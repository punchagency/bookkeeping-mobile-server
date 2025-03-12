import { container } from "tsyringe";
import { TransactionRepository } from "./transaction-repository";
import { ITransactionRepository } from "./i-transaction-repository";

export const registerTransactionRepositoryDi = () => {
  container.register<ITransactionRepository>(TransactionRepository.name, {
    useClass: TransactionRepository,
  });
};
