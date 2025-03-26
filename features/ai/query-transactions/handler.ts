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
    const values = await queryTransactionsDto.validateAsync(req.body);
    const currentUser = req.user as User;

    const result = await this.handleNaturalLanguageQuery(
      values.query,
      currentUser
    );

    if (!result.isSuccess) {
      return res.status(400).json({
        message: result.errors,
      });
    }

    return res.status(200).json({
      data: result.value,
    });
  }

  public async handleNaturalLanguageQuery(query: string, user: User) {
    try {
      const queryCacheKey = `transactions_query:${
        user._id
      }:${query.toLowerCase()}`;
      const queryResult = await this._redisService.get(queryCacheKey);

      logger("Cache Check:", {
        key: queryCacheKey,
        hasCache: !!queryResult,
        query: query,
      });

      if (queryResult) {
        logger("Returning cached result for query:", query);
        return Result.ok(queryResult);
      }

      const redisQuery =
        await this._openAiClient.generateRedisQueryFromNaturalLanguage(query);

      logger("Natural Language Query:", query);
      logger("Generated Redis Query:", redisQuery);

      const cachedTransactions = await this.getCachedTransactions(user);
      logger("Cached Transactions:", cachedTransactions);

      if (
        !cachedTransactions ||
        (Array.isArray(cachedTransactions) && cachedTransactions.length === 0)
      ) {
        return Result.fail("No transactions found for user");
      }

      const transactions = Array.isArray(cachedTransactions)
        ? cachedTransactions
        : JSON.parse(cachedTransactions as string);

      logger("Parsed Transactions:", transactions);

      const filteredTransactions = transactions.filter((transaction: any) => {
        try {
          // Create a safe transaction object with null checks for string operations
          const safeTransaction = {
            ...transaction,
            description: (transaction.description || "").toLowerCase(),
            originalDescription: (
              transaction.originalDescription || ""
            ).toLowerCase(),
            topLevelCategory: (
              transaction.topLevelCategory || ""
            ).toLowerCase(),
            memo: (transaction.memo || "").toLowerCase(),
            date: transaction.date || "",
            amount: transaction.amount || 0,
            isIncome: !!transaction.isIncome,
            isExpense: !!transaction.isExpense,
            // Add helper functions for more lenient matching
            containsInAnyField: function (searchTerm: string) {
              searchTerm = searchTerm.toLowerCase();
              // Handle plural/singular forms
              const searchTerms = [
                searchTerm,
                searchTerm.endsWith("s")
                  ? searchTerm.slice(0, -1)
                  : searchTerm + "s",
              ];

              return searchTerms.some(
                (term) =>
                  this.description.includes(term) ||
                  this.originalDescription.includes(term) ||
                  this.topLevelCategory.includes(term) ||
                  this.memo.includes(term)
              );
            },
            matchesCategory: function (category: string) {
              category = category.toLowerCase();
              return this.topLevelCategory.includes(category);
            },
          };

          logger("Evaluating transaction:", {
            description: safeTransaction.description,
            isIncome: safeTransaction.isIncome,
            isExpense: safeTransaction.isExpense,
            query: redisQuery,
          });

          const evaluateQuery = new Function(
            "transaction",
            `
            try {
              const searchTerm = '${query}'.toLowerCase();
              const result = ${redisQuery};
              if (result) return true;
              
              // Fallback matching for income/expense keywords
              if (searchTerm.includes('income') && transaction.isIncome) return true;
              if (searchTerm.includes('expense') && transaction.isExpense) return true;
              
              // Handle plural/singular forms in fallback matching
              const searchTerms = [
                searchTerm,
                searchTerm.endsWith('s') ? searchTerm.slice(0, -1) : searchTerm + 's'
              ];
              
              // Fallback for text matching with plural/singular handling
              return searchTerms.some(term => 
                transaction.containsInAnyField(term) ||
                transaction.description.includes(term) ||
                transaction.topLevelCategory.includes(term) ||
                transaction.memo.includes(term)
              );
            } catch (e) {
              console.error('Query evaluation error:', e);
              // If query fails, try basic matching with plural/singular handling
              const searchTerm = '${query}'.toLowerCase();
              return transaction.containsInAnyField(searchTerm);
            }
          `
          );

          const result = evaluateQuery(safeTransaction);

          logger("Transaction Filter Result:", {
            transaction: safeTransaction.description,
            query: redisQuery,
            result: result,
          });

          return result;
        } catch (error) {
          logger("Error filtering transaction:", error);
          // If all else fails, try basic text matching
          const searchTerm = query.toLowerCase();
          return Object.values(transaction)
            .filter((val) => typeof val === "string")
            .some((val) => val.toString().toLowerCase().includes(searchTerm));
        }
      });

      logger("Filtered Transactions:", filteredTransactions);

      if (filteredTransactions.length === 0) {
        return Result.fail("No transactions match your query criteria");
      }

      await this._redisService.set(
        queryCacheKey,
        filteredTransactions,
        60 * 15
      );

      return Result.ok(filteredTransactions);
    } catch (error: any) {
      logger(error);
      return Result.fail(
        error.message || "Failed to process natural language query"
      );
    }
  }

  private async getCachedTransactions(user: User) {
    const allTransactionsCacheKey = `transactions:${user._id}`;

    let cachedTransactions = await this._redisService.get(
      allTransactionsCacheKey
    );

    logger("Initial Redis Check:", {
      hasCachedTransactions: !!cachedTransactions,
      cacheKey: allTransactionsCacheKey,
    });

    if (!cachedTransactions) {
      logger(`No cached transactions found for ${user.firstName}`);

      // Test transactions for development
      const testTransactions = [
        // Income transactions
        {
          isIncome: true,
          isExpense: false,
          amount: 3000.0,
          description: "Salary Deposit",
          originalDescription: "DIRECT DEPOSIT SALARY",
          topLevelCategory: "Income",
          date: "2024-03-24",
          memo: "Monthly salary",
        },
        {
          isIncome: true,
          isExpense: false,
          amount: 500.0,
          description: "Freelance Payment",
          originalDescription: "PAYPAL TRANSFER",
          topLevelCategory: "Income",
          date: "2024-03-20",
          memo: "Website development project",
        },
        {
          isIncome: true,
          isExpense: false,
          amount: 100.0,
          description: "Investment Dividend",
          originalDescription: "VANGUARD DIV",
          topLevelCategory: "Income",
          date: "2024-03-15",
          memo: "Quarterly dividend payment",
        },

        // Food & Dining
        {
          isIncome: false,
          isExpense: true,
          amount: 150.5,
          description: "Walmart Groceries",
          originalDescription: "WALMART GROCERY",
          topLevelCategory: "Food & Dining",
          date: "2024-03-24",
          memo: "Weekly groceries",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 85.75,
          description: "Restaurant Dinner",
          originalDescription: "OLIVE GARDEN",
          topLevelCategory: "Food & Dining",
          date: "2024-03-22",
          memo: "Family dinner",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 25.4,
          description: "Starbucks Coffee",
          originalDescription: "STARBUCKS",
          topLevelCategory: "Food & Dining",
          date: "2024-03-23",
          memo: "Coffee and breakfast",
        },

        // Entertainment & Subscriptions
        {
          isIncome: false,
          isExpense: true,
          amount: 25.0,
          description: "Netflix Subscription",
          originalDescription: "NETFLIX.COM",
          topLevelCategory: "Entertainment",
          date: "2024-03-23",
          memo: "Monthly subscription",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 9.99,
          description: "Spotify Premium",
          originalDescription: "SPOTIFY.COM",
          topLevelCategory: "Entertainment",
          date: "2024-03-21",
          memo: "Monthly music subscription",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 15.0,
          description: "HBO Max",
          originalDescription: "HBO MAX",
          topLevelCategory: "Entertainment",
          date: "2024-03-20",
          memo: "Streaming service",
        },

        // Loans & Mortgage
        {
          isIncome: false,
          isExpense: true,
          amount: 500.0,
          description: "Car Loan Payment",
          originalDescription: "AUTO LOAN PAYMENT",
          topLevelCategory: "Loans",
          date: "2024-03-24",
          memo: "Monthly car loan payment",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 1200.0,
          description: "Mortgage Payment",
          originalDescription: "MORTGAGE PAYMENT",
          topLevelCategory: "Loans",
          date: "2024-03-24",
          memo: "Monthly mortgage payment",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 75.0,
          description: "Student Loan Payment",
          originalDescription: "STUDENT LOAN PAYMENT",
          topLevelCategory: "Loans",
          date: "2024-03-24",
          memo: "Monthly student loan payment",
        },

        // Utilities & Bills
        {
          isIncome: false,
          isExpense: true,
          amount: 80.0,
          description: "Electric Bill",
          originalDescription: "ELECTRIC COMPANY",
          topLevelCategory: "Utilities",
          date: "2024-03-24",
          memo: "Monthly electric bill",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 60.0,
          description: "Phone Bill",
          originalDescription: "PHONE COMPANY",
          topLevelCategory: "Utilities",
          date: "2024-03-24",
          memo: "Monthly phone bill",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 45.0,
          description: "Internet Service",
          originalDescription: "COMCAST",
          topLevelCategory: "Utilities",
          date: "2024-03-22",
          memo: "Monthly internet",
        },

        // Shopping & Retail
        {
          isIncome: false,
          isExpense: true,
          amount: 120.0,
          description: "Amazon Purchase",
          originalDescription: "AMAZON.COM",
          topLevelCategory: "Shopping",
          date: "2024-03-21",
          memo: "Home supplies",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 75.5,
          description: "Target Shopping",
          originalDescription: "TARGET",
          topLevelCategory: "Shopping",
          date: "2024-03-19",
          memo: "Household items",
        },

        // Transportation
        {
          isIncome: false,
          isExpense: true,
          amount: 45.0,
          description: "Gas Station",
          originalDescription: "SHELL OIL",
          topLevelCategory: "Transportation",
          date: "2024-03-23",
          memo: "Fuel",
        },
        {
          isIncome: false,
          isExpense: true,
          amount: 150.0,
          description: "Car Insurance",
          originalDescription: "GEICO",
          topLevelCategory: "Insurance",
          date: "2024-03-15",
          memo: "Monthly auto insurance",
        },
      ];

      logger("Using test transactions:", testTransactions);

      await this._redisService.set(
        allTransactionsCacheKey,
        testTransactions,
        60 * 60 * 24
      );

      return testTransactions;
    }

    logger("Returning cached transactions:", {
      count: Array.isArray(cachedTransactions)
        ? cachedTransactions.length
        : "unknown",
    });

    return cachedTransactions;
  }
}
