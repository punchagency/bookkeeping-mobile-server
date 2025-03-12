import axios from "axios";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";
import { Result, ResultAsync } from "tsfluent";

import { User } from "./../../../domain/entities/user";
import { queryTransactionsDto } from "./query-transction.dto";
//import { financeAgent } from "./../../../features/mastra/agents";
import MxClient from "./../../../infrastructure/config/packages/mx";
import RedisService from "./../../../infrastructure/services/redis";
import OpenAiClient from "./../../../infrastructure/config/packages/openai";
import {
  formatTransactionsToMarkdown,
  logger,
  EnvConfiguration,
} from "./../../../utils";
import PineconeClient from "./../../../infrastructure/config/packages/pinecone";

@injectable()
export default class QueryTransactionHandler {
  private readonly _mxClient: MxClient;
  private readonly _redisService: RedisService;
  private readonly _openAiClient: OpenAiClient;
  private readonly _envConfig: EnvConfiguration;
  private readonly _pineconeClient: PineconeClient;

  constructor(
    @inject(MxClient) mxClient: MxClient,
    @inject(RedisService) redisService: RedisService,
    @inject(OpenAiClient) openAiClient: OpenAiClient,
    @inject(PineconeClient) pineconeClient: PineconeClient,
    @inject(EnvConfiguration) envConfig: EnvConfiguration
  ) {
    this._mxClient = mxClient;
    this._envConfig = envConfig;
    this._redisService = redisService;
    this._openAiClient = openAiClient;
    this._pineconeClient = pineconeClient;
  }

  public async handle(req: Request, res: Response) {
    const currentUser = req.user as User;
    const values = await queryTransactionsDto.validateAsync(req.body);

    const result = await ResultAsync.okAsync();

    // const financeAgentResponse = await financeAgent.generate(values.query);

    // logger(financeAgentResponse);
    const response = await axios.post("http://localhost:9000/finance-query", {
      query: values.query,
    });

    logger(response.data);

    if (result.isSuccess) {
      return Result.ok(response.data.data);
    }

    logger(result.errors);
    return Result.fail(result.errors);
  }

  private async queryTransactions(query: string, user: User) {
    const cachedCustomQueryTransactions =
      await this.getCachedCustomQueryTransactions(user, query);

    if (cachedCustomQueryTransactions) {
      return Result.ok(cachedCustomQueryTransactions);
    }

    const { cachedTransactions, markdownTransactions } =
      await this.getCachedTransactions(user);

    // Check if user's transactions are already in Pinecone
    const pineconeIndex = this._pineconeClient.client.index(
      this._envConfig.PINECONE_INDEX_NAME
    );

    const existingVector = await pineconeIndex.fetch([user._id.toString()]);

    if (!existingVector?.records?.[user._id.toString()]) {
      // Only convert and upsert if not already in Pinecone
      const openAiVectorEmbeddings = await this._openAiClient.createEmbedding(
        cachedTransactions as string
      );

      logger(openAiVectorEmbeddings);

      await pineconeIndex.upsert([
        {
          id: user._id.toString(),
          values: openAiVectorEmbeddings,
          metadata: {
            summary: markdownTransactions.toString(),
          },
        },
      ]);
      logger(`Upserted ${user._id} into Pinecone`);
    }

    // Convert user query to vector embedding
    const queryEmbedding = await this._openAiClient.createEmbedding(query);

    // Search Pinecone for similar transactions
    console.log("queryEmbedding");
    logger(queryEmbedding);
    const searchResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      filter: { id: user._id.toString() },
      topK: 1,
    });

    logger(searchResponse);

    if (!searchResponse.matches?.length) {
      logger("No matching transactions found");
      return Result.fail("No matching transactions found");
    }

    // Cache the query results
    const queryCacheKey = `transactions_query:${user._id}:${query}`;
    await this._redisService.set(
      queryCacheKey,
      searchResponse.matches[0].metadata.summary,
      60 * 15
    );

    return Result.ok(searchResponse.matches[0]);
  }

  private async getCachedTransactions(user: User) {
    const allTransactionsCacheKey = `transactions:${user._id}`;

    let cachedTransactions = await this._redisService.get(
      allTransactionsCacheKey
    );

    let markdownTransactions = null;

    if (!cachedTransactions) {
      logger(`No cached transactions found for ${user.fullName}`);

      const mxUserId = user.mxUsers[0].mxUserId;

      const countResponse = await this._mxClient.client.listTransactions(
        mxUserId,
        undefined,
        1,
        1
      );

      const totalTransactions = countResponse.data.pagination.total_entries;
      const totalPages = Math.ceil(totalTransactions / 1000);

      let allTransactions: any[] = [];
      for (let page = 1; page <= totalPages; page++) {
        const batchResponse = await this._mxClient.client.listTransactions(
          mxUserId,
          undefined,
          page,
          1000
        );
        allTransactions = [
          ...allTransactions,
          ...batchResponse.data.transactions,
        ];
      }

      const totals = allTransactions.reduce(
        (acc, t) => {
          if (t.is_income) acc.totalIncome += Number(t.amount);
          if (t.is_expense) acc.totalExpenses += Number(t.amount);
          acc.categories[t.top_level_category] =
            (acc.categories[t.top_level_category] || 0) + t.amount;
          acc.merchantFrequency[t.description] =
            (acc.merchantFrequency[t.description] || 0) + 1;
          if (t.amount > (acc.highestTransaction?.amount || 0)) {
            acc.highestTransaction = {
              amount: t.amount,
              description: t.description,
              category: t.top_level_category,
            };
          }
          return acc;
        },
        {
          totalIncome: 0,
          totalExpenses: 0,
          netChange: 0,
          categories: {},
          merchantFrequency: {},
          highestTransaction: null,
        }
      );

      const formattedTotals = {
        income: Number(totals.totalIncome.toFixed(2)),
        expenses: Number(totals.totalExpenses.toFixed(2)),
        netChange: Number(totals.totalIncome - totals.totalExpenses),
      };

      const transformedTransactions = allTransactions.map((t) => ({
        isIncome: t.is_income,
        isExpense: t.is_expense,
        amount: Number(t.amount),
        description: t.description,
        originalDescription: t.original_description,
        topLevelCategory: t.top_level_category,
        date: t.date,
        memo: t.memo,
      }));

      const transactionSummary = transformedTransactions.reduce(
        (summary, t) => {
          const month = new Date(t.date).toLocaleString("default", {
            month: "long",
          });
          if (!summary[month]) {
            summary[month] = {
              income: 0,
              expenses: 0,
              transactions: [],
              topCategories: new Map(),
              categoryTotals: new Map(),
              merchantTotals: new Map(),
              recurringExpenses: new Map(),
              largestExpenses: [],
            };
          }

          if (t.isIncome) summary[month].income += t.amount;
          if (t.isExpense) summary[month].expenses += t.amount;

          const descriptionKey = t.description.toLowerCase().trim();
          const merchantTotal =
            summary[month].merchantTotals.get(descriptionKey) || 0;
          summary[month].merchantTotals.set(
            descriptionKey,
            merchantTotal + t.amount
          );

          const categoryTotal =
            summary[month].categoryTotals.get(t.topLevelCategory) || 0;
          summary[month].categoryTotals.set(
            t.topLevelCategory,
            categoryTotal + t.amount
          );

          const currentCount =
            summary[month].topCategories.get(t.topLevelCategory) || 0;
          summary[month].topCategories.set(
            t.topLevelCategory,
            currentCount + 1
          );

          if (t.isExpense) {
            summary[month].transactions.push({
              description: t.description,
              originalDescription: t.originalDescription,
              amount: t.amount,
              category: t.topLevelCategory,
              date: t.date,
            });

            if (
              summary[month].transactions.some(
                (tr) =>
                  tr.description !== t.description &&
                  tr.description.toLowerCase().includes(descriptionKey)
              )
            ) {
              summary[month].recurringExpenses.set(descriptionKey, {
                amount: t.amount,
                category: t.topLevelCategory,
                frequency: "monthly",
              });
            }
          }

          return summary;
        },
        {}
      );

      const dataToSave = {
        totals: formattedTotals,
        transactions: transactionSummary,
      };

      cachedTransactions = formatTransactionsToMarkdown(dataToSave);

      markdownTransactions = formatTransactionsToMarkdown(dataToSave);

      logger(markdownTransactions);

      await this._redisService.set(
        allTransactionsCacheKey,
        cachedTransactions,
        60 * 60 * 24
      );
    }

    return { cachedTransactions, markdownTransactions };
  }

  private async getCachedCustomQueryTransactions(user: User, query: string) {
    const queryCacheKey = `transactions_query:${user._id}:${query}`;

    const cachedTransactions = await this._redisService.get(queryCacheKey);

    if (!cachedTransactions) {
      logger(`No cached custom query transactions found for ${user.fullName}`);
    }

    return cachedTransactions;
  }
}
