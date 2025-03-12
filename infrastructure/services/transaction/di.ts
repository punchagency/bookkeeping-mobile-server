import { container } from "tsyringe";
import TransactionQueueService from "./transaction-queue.service";
import TransactionService from "./transaction.service";

export const registerTransactionQueueService = () => {
  container.registerSingleton(TransactionQueueService);
};

export const registerTransactionService = () => {
  container.register(TransactionService.name, {
    useClass: TransactionService,
  });
};
