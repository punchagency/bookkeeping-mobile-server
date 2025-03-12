import axios from "axios";
import { Result } from "tsfluent";
import { Response, Request } from "express";
import { inject, injectable } from "tsyringe";

import { logger } from "./../../../utils";
import { visualizeTransactionsDto } from "./visualize-transactions.dto";

@injectable()
export default class VisualizeTransactionsHandler {
  constructor() {}

  public async handle(req: Request, res: Response) {
    const values = await visualizeTransactionsDto.validateAsync(req.body);

    return await this.visualizeTransactions(values.query as string);
  }

  private async visualizeTransactions(query: string) {
    try {
      const visualizeTransactionsResponse = await axios.post(
        "http://localhost:9000/visualize-transactions",
        {
          query,
        }
      );

      return Result.ok(visualizeTransactionsResponse.data.data);
    } catch (error: any) {
      logger(error);

      return Result.fail("An error occured while visualizing transactions");
    }
  }
}
