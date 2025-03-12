import { IError, Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "./../../../domain/entities/user";
import MxClient from "./../../../infrastructure/config/packages/mx";
import { IGetStatementsErrorContext, IPageOptions, getStatementsSchema } from "./get-statements.dto";

@injectable()
export default class GetStatementsHandler {
  private readonly _mxClient: MxClient;

  constructor(@inject(MxClient.name) mxClient: MxClient) {
    this._mxClient = mxClient;
  }

  public async handle(req: Request, res: Response) {
    const values = await getStatementsSchema.validateAsync(req.query);
    const currentUser = req.user as User;

    return this.getStatements(currentUser, values);
  }

  private async getStatements(user: User, pageOptions: IPageOptions) {
    const mxUserId = user.mxUsers.find(
      (mxUser) => mxUser.id === user._id?.toString()
    ).mxUserId;

    try {
      const mxUserMember = await this._mxClient.client.listMembers(mxUserId);

      const mxUserMemberGuid = mxUserMember?.data?.members[0].guid;

      const statementsResponse =
        await this._mxClient.client.listStatementsByMember(
          mxUserMemberGuid,
          mxUserId,
          pageOptions.page,
          pageOptions.recordsPerPage
        );

      if (statementsResponse.status !== 200) {
        return Result.fail([{ message: "Error getting statements from MX" }]);
      }

      logger(statementsResponse.data);

      return Result.ok(statementsResponse.data);
    } catch (error: any) {
      logger(error);
      return (
        Result.fail < IError,
        IGetStatementsErrorContext>([
          { message: "Member not found. Please connect your bank!" },
        ]).withMetadata({
          context: {
            statusCode: 404,
          },
        })
      );
    }
  }
}
