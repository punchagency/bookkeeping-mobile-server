import { Result } from "tsfluent";
import { injectable } from "tsyringe";
import { Request, Response } from "express";

import { User } from "./../../../domain/entities/user";

@injectable()
export default class GetAllMxUsersHandler {
  public async handle(req: Request, res: Response) {
    try {
      const currentUser = req.user as User;

      return Result.ok({
        mxUsers: currentUser.mxUsers || [],
      });
    } catch (error: any) {
      return Result.fail([{ message: "Error fetching MX users" }]);
    }
  }
}
