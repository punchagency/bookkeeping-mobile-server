import { injectable } from "tsyringe";

import { Repository } from "../repository";
import { ITransactionRepository } from "./i-transaction-repository";
import TransactionModel, {
  Transaction,
} from "../../../domain/entities/transactions";

@injectable()
export class TransactionRepository
  extends Repository<Transaction>
  implements ITransactionRepository
{
  constructor() {
    super(TransactionModel);
  }

  public async insertMany(transactions: Transaction[]): Promise<void> {
    const transactionGuids = transactions.map((t) => t.guid);

    const existingTransactions = await TransactionModel.find({
      guid: { $in: transactionGuids },
    });

    const existingGuids = existingTransactions.map((t) => t.guid);

    const newTransactions = transactions.filter(
      (transaction) => !existingGuids.includes(transaction.guid)
    );

    if (newTransactions.length > 0) {
      await TransactionModel.insertMany(newTransactions);
    }
  }
}
