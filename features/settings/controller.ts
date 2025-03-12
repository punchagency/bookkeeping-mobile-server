import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import GetSettingsHandler from "./get-settings/handler";
import UpdateSettingsHandler from "./update-settings/handler";
import ApiResponse from "./../../application/response/response";
import { IApiResponse } from "./../../application/response/i-response";

@injectable()
export default class SettingsController {
  private readonly _apiResponse: IApiResponse;
  private readonly _getSettingsHandler: GetSettingsHandler;
  private readonly _updateSettingsHandler: UpdateSettingsHandler;

  constructor(
    @inject(UpdateSettingsHandler.name)
    updateSettingsHandler: UpdateSettingsHandler,
    @inject(GetSettingsHandler.name)
    getSettingsHandler: GetSettingsHandler, 
    @inject(ApiResponse.name) apiResponse: IApiResponse
  ) {
    this._apiResponse = apiResponse;
    this._getSettingsHandler = getSettingsHandler;
    this._updateSettingsHandler = updateSettingsHandler;
  }

  public async updateSettings(req: Request, res: Response) {
    const result = await this._updateSettingsHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Settings updated successfully",
      result.value
    );
  }

  public async getSettings(req: Request, res: Response) {
    const result = await this._getSettingsHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Settings fetched successfully",
      result.value
    );
  }
}
