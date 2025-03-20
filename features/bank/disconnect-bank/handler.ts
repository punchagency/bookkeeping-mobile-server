import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "./../../../domain/entities/user";
import { disconnectBankDto } from "./disconnect-bank.dto";
import MxClient from "./../../../infrastructure/config/packages/mx";

@injectable()
export default class DisconnectBankHandler {
  private readonly _mxClient: MxClient;

  constructor(@inject(MxClient.name) mxClient: MxClient) {
    this._mxClient = mxClient;
  }

  public async handle(req: Request, res: Response) {
    const values = await disconnectBankDto.validateAsync(req.body);

    const result = await this.disconnectBank(req, values.memberGuid);

    if (result.isFailure) {
      return Result.fail(result.errors);
    }

    return Result.ok(result.value);
  }

  private async disconnectBank(req: Request, memberGuid: string) {
    const user = req.user as User;

    const mxUserId = user.mxUsers[0].mxUserId;

    try {
      const disconnectRequest = await this._mxClient.client.deleteMember(
        memberGuid,
        mxUserId
      );

      logger(disconnectRequest.data);

      if (disconnectRequest.status !== 204) {
        return Result.fail([{ message: "Error disconnecting bank from MX" }]);
      }

      return Result.ok(disconnectRequest.data);
    } catch (error: any) {
      logger(error);
      return Result.fail(`Error disconnecting bank from MX`);
    }
  }
}
