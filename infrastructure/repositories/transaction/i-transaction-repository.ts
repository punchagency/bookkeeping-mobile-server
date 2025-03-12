import { IRepository } from "../i-repository";
import { Transaction } from "./../../../domain/entities/transactions";

export interface ITransactionRepository extends IRepository<Transaction> {
  insertMany(transactions: Transaction[]): Promise<void>;
}
