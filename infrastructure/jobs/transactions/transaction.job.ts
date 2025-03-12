import cron from "node-cron";
import { singleton, inject } from "tsyringe";

import logger from "../../../utils/logger";
import { UserRepository } from "../../repositories/user/user-repository";
import { IUserRepository } from "../../repositories/user/i-user-repository";
import TransactionService from "../../services/transaction/transaction.service";
import TransactionQueueService from "../../services/transaction/transaction-queue.service";

@singleton()
export default class TransactionJob {
  private readonly _userRepository: IUserRepository;
  private readonly _transactionService: TransactionService;
  private readonly _transactionQueueService: TransactionQueueService;

  constructor(
    @inject(UserRepository) userRepository,
    @inject(TransactionService) transactionService,
    @inject(TransactionQueueService) transactionQueueService
  ) {
    this._userRepository = userRepository;
    this._transactionService = transactionService;
    this._transactionQueueService = transactionQueueService;
  }

  public async start() {
    cron.schedule("0 * * * *", async () => {
      const allUsers = await this._userRepository.findQualifiedUsers();

      for (const user of allUsers) {
        const transactions = await this._transactionService.getTransactions(
          user
        );

        for (const transaction of transactions) {
          await this._transactionQueueService.addTransactionToQueue(
            transaction
          );
        }
      }
    });
  }
}
