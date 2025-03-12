import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "./../../../domain/entities/user";
import MxClient from "./../../../infrastructure/config/packages/mx";
import { deleteMxUserSchema, IDeleteMxUser } from "./delete-user.dto";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";

@injectable()
export default class DeleteMxUserHandler {
  private readonly _mxClient: MxClient;
  private readonly _userRepository: UserRepository;

  constructor(
    @inject(MxClient.name) mxClient: MxClient,
    @inject(UserRepository.name) userRepository: UserRepository
  ) {
    this._mxClient = mxClient;
    this._userRepository = userRepository;
  }

  private async deleteMxUser(data: IDeleteMxUser, req: Request) {
    const createMxUserResponse = await this._mxClient.client.deleteUser(
      data.userId
    );

    if (createMxUserResponse.status !== 204) {
      logger(createMxUserResponse.status);
      return Result.fail([{ message: "Error deleting user in MX" }]);
    }

    const currentUser = req.user as User;

    await this._userRepository.update(currentUser._id, {
      mxUsers: currentUser.mxUsers.filter((mx) => mx.mxUserId !== data.userId),
    });

    return Result.ok(createMxUserResponse.data);
  }

  public async handle(req: Request, res: Response) {
    const values = await deleteMxUserSchema.validateAsync(req.params);
    const result = await this.deleteMxUser(values, req);

    if (result.isFailure) {
      return Result.fail(result.errors);
    }

    return Result.ok(result.value);
  }
}
