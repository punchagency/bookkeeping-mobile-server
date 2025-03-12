import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import SessionHandler from "./session/handler";
import ApiResponse from "./../../application/response/response";
import QueryTransactionHandler from "./query-transactions/handler";
import { IApiResponse } from "./../../application/response/i-response";
import VisualizeTransactionsHandler from "./visualize-transactions/handler";

@injectable()
export default class AiController {
  private readonly _apiResponse: IApiResponse;
  private readonly _sessionHandler: SessionHandler;
  private readonly _queryTransactionHandler: QueryTransactionHandler;
  private readonly _visualizeTransactionsHandler: VisualizeTransactionsHandler;
  constructor(
    @inject(SessionHandler.name) sessionHandler: SessionHandler,
    @inject(QueryTransactionHandler.name)
    queryTransactionHandler: QueryTransactionHandler,
    @inject(ApiResponse.name) apiResponse: IApiResponse,
    @inject(VisualizeTransactionsHandler.name)
    visualizeTransactionsHandler: VisualizeTransactionsHandler
  ) {
    this._apiResponse = apiResponse;
    this._sessionHandler = sessionHandler;
    this._queryTransactionHandler = queryTransactionHandler;
    this._visualizeTransactionsHandler = visualizeTransactionsHandler;
  }

  public async createSession(req: Request, res: Response) {
    const result = await this._sessionHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Session created successfully",
      result.value
    );
  }

  public async queryTransactions(req: Request, res: Response) {
    const result = await this._queryTransactionHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Transactions queried successfully",
      result.value
    );
  }

  public async visualizeTransactions(req: Request, res: Response) {
    const result = await this._visualizeTransactionsHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Transactions visualized successfuly",
      result.value
    );
  }
}
