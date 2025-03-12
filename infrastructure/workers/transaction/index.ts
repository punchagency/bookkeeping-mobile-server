import { Worker, Job } from "bullmq";
import { singleton, inject } from "tsyringe";

import logger from "../../../utils/logger";
import RedisService from "../../../infrastructure/services/redis";

/***
 *
 * @description This worker is responsible for processing transactions
 *
 */
@singleton()
export default class TransactionWorker {
  private readonly _worker: Worker;
  private readonly _redisService: RedisService;

  constructor(@inject(RedisService) redisService) {
    this._redisService = redisService;
    this._worker = new Worker(
      "transactions-queue",
      async (job: Job) => {
        const transaction = job.data;

        logger(`Processsing transaction`);
      },
      {
        connection: this._redisService.getRedisConnection(),
      }
    );

    this._worker.on("failed", (job: Job, error: Error) => {
      logger(`Worker failed for job ${job.id} with reason ${error.message}`);
      logger(error);
    });

    this._worker.on("completed", (job: Job, result: any) => {
      logger(`Worker completed for job ${job.id} with result ${result}`);
    });
  }
}
