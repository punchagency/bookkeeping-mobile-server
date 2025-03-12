import { injectable, inject } from "tsyringe";

import RedisService from "../redis";
import { User } from "./../../../domain/entities/user";
import MxClient from "./../../../infrastructure/config/packages/mx";

/**
 * This service is responsible for getting transactions from https://mx.com
 *
 */
@injectable()
export default class TransactionService {
  private readonly _mxClient: MxClient;
  private readonly _redisService: RedisService;

  constructor(@inject(MxClient) mxClient) {
    this._mxClient = mxClient;
  }

  public async getTransactions(user: User) {
    const currentUser = user;
    const mxUserId = currentUser.mxUsers[0].mxUserId;

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

    const transformedTransactions = allTransactions.map((t: any) => ({
      category: t.category,
      date: t.date,
      status: t.status,
      topLevelCategory: t.top_level_category,
      type: t.type,
      accountId: t.account_id,
      userId: currentUser._id,
      accountGuid: t.account_guid,
      amount: t.amount,
      currencyCode: t.currency_code,
      description: t.description,
      guid: t.guid,
      transactionId: t.id,
      isExpense: t.is_expense,
      isIncome: t.is_income,
      memo: t.memo,
      originalDescription: t.original_description,
      memberGuid: t.member_guid,
      userGuid: t.user_guid,
      metadata: {
        merchantCategoryCode: t.merchant_category_code,
        merchantGuid: t.merchant_guid,
        classification: t.classification,
        extendedTransactionType: t.extended_transaction_type,
      },
    }));

    return transformedTransactions;
  }
}
