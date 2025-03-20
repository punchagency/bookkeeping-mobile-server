import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import CurrentBankHandler from "./current-connected-banks/handler";
import ConnectBankHandler from "./connect-bank/handler";
import DisconnectBankHandler from "./disconnect-bank/handler";
import GetTransactionsHandler from "./transactions/get-transactions/handler";
import ApiResponse from "./../../application/response/response";
import { IApiResponse } from "./../../application/response/i-response";

@injectable()
export default class BankController {
  private readonly _apiResponse: IApiResponse;
  private readonly _connectBankHandler: ConnectBankHandler;
  private readonly _currentBankHandler: CurrentBankHandler;
  private readonly _disconnectBankHandler: DisconnectBankHandler;
  private readonly _getTransactionsHandler: GetTransactionsHandler;

  constructor(
    @inject(ApiResponse) ApiResponse: IApiResponse,
    @inject(ConnectBankHandler) connectBankHandler: ConnectBankHandler,
    @inject(CurrentBankHandler) currentBankHandler: CurrentBankHandler,
    @inject(DisconnectBankHandler) disconnectBankHandler: DisconnectBankHandler,
    @inject(GetTransactionsHandler)
    getTransactionsHandler: GetTransactionsHandler
  ) {
    this._apiResponse = ApiResponse;
    this._connectBankHandler = connectBankHandler;
    this._currentBankHandler = currentBankHandler;
    this._disconnectBankHandler = disconnectBankHandler;
    this._getTransactionsHandler = getTransactionsHandler;
  }

  public async connectBank(req: Request, res: Response) {
    const result = await this._connectBankHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Bank connection request sent successfully",
      result.value
    );
  }

  public async disconnectBank(req: Request, res: Response) {
    const result = await this._disconnectBankHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(
        res,
        result.errors.map((error) => error.message)
      );
    }

    return this._apiResponse.Ok(res, "Bank disconnected successfully", null);
  }

  public async getCurrentBank(req: Request, res: Response) {
    const result = await this._currentBankHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Current bank fetched successfully",
      result.value
    );
  }

  public async getTransactions(req: Request, res: Response) {
    const result = await this._getTransactionsHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Transactions fetched successfully",
      result.value
    );
  }
}
