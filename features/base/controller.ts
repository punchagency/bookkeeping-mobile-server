import { inject, injectable } from "tsyringe";
import { Request, Response } from "express";

import ApiResponse from "../../application/response/response";
import { IApiResponse } from "./../../application/response/i-response";

@injectable()
export default class BaseController {
  private readonly _apiResponse: IApiResponse;

  constructor(@inject(ApiResponse.name) apiResponse: IApiResponse) {
    this._apiResponse = apiResponse;
  }
  public async Hello(req: Request, res: Response) {
    return this._apiResponse.Ok(res, "Hello world", {});
  }
}
