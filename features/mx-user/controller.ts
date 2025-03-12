import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { logger } from "./../../utils";
import CreateMxUserHandler from "./create-user/handler";
import DeleteMxUserHandler from "./delete-user/handler";
import GetAllMxUsersHandler from "./get-all-users/handler";
import GetStatementsHandler from "./get-statements/handler";
import ApiResponse from "./../../application/response/response";
import { IApiResponse } from "./../../application/response/i-response";
@injectable()
export default class MXUserController {
  private readonly _apiResponse: IApiResponse;
  private readonly _createMxUserHandler: CreateMxUserHandler;
  private readonly _deleteMxUserHandler: DeleteMxUserHandler;
  private readonly _getAllMxUsersHandler: GetAllMxUsersHandler;
  private readonly _getStatementsHandler: GetStatementsHandler;

  constructor(
    @inject(ApiResponse) ApiResponse: IApiResponse,
    @inject(CreateMxUserHandler.name) createMxUserHandler: CreateMxUserHandler,
    @inject(DeleteMxUserHandler.name) deleteMxUserHandler: DeleteMxUserHandler,
    @inject(GetAllMxUsersHandler.name)
    getAllMxUsersHandler: GetAllMxUsersHandler,
    @inject(GetStatementsHandler.name)
    getStatementsHandler: GetStatementsHandler
  ) {
    this._apiResponse = ApiResponse;
    this._createMxUserHandler = createMxUserHandler;
    this._deleteMxUserHandler = deleteMxUserHandler;
    this._getAllMxUsersHandler = getAllMxUsersHandler;
    this._getStatementsHandler = getStatementsHandler;
  }

  public async createUser(req: Request, res: Response) {
    const result = await this._createMxUserHandler.handle(req, res);

    if (result.isFailure) {
      const errors = result.errors.map((error) => error.message);

      return this._apiResponse.BadRequest(res, errors);
    }

    return this._apiResponse.Ok(res, "User created successfully", result.value);
  }

  public async deleteUser(req: Request, res: Response) {
    const result = await this._deleteMxUserHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(res, "User deleted successfully", {});
  }

  public async getAllUsers(req: Request, res: Response) {
    const result = await this._getAllMxUsersHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Users fetched successfully",
      result.value
    );
  }

  public async getStatements(req: Request, res: Response) {
    const result = await this._getStatementsHandler.handle(req, res);
    if (result.isFailure) {
      if (result.metadata && result.metadata.context.statusCode === 404) {
        return this._apiResponse.NotFound(
          res,
          "Member id not found. Please connect your bank",
          null
        );
      }
      return this._apiResponse.BadRequest(res, result.errors);
    }

    logger(result.value);

    return this._apiResponse.Ok(
      res,
      "Statements fetched successfully",
      result.value
    );
  }
}
