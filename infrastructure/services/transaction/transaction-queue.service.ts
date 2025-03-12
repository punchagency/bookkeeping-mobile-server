import { Queue } from "bullmq";
import { singleton, inject } from "tsyringe";

import RedisService from "../redis";

@singleton()
export default class TransactionQueueService {
  private readonly _queue: Queue;
  private readonly _redisService: RedisService;

  constructor(@inject(RedisService) redisService) {
    this._redisService = redisService;
    this._queue = new Queue("transactions", {
      connection: this._redisService.getRedisConnection(),
    });
  }

  /**
   * Add a transaction to the queue
   * @param transaction
   *
   * TODO: Add a transaction interface
   */
  public async addTransactionToQueue(transaction: any) {
    await this._queue.add("process-transaction", transaction);
  }

  public async removeTransactionFromQueue(transactionId: string) {
    await this._queue.remove(transactionId);
  }
}
