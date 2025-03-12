import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "./../../../domain/entities/user";
import MxClient from "./../../../infrastructure/config/packages/mx";
import { createMxUserSchema, ICreateMxUser } from "./create-user.dto";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";

@injectable()
export default class CreateMxUserHandler {
  private readonly _mxClient: MxClient;
  private readonly _userRepository: UserRepository;

  constructor(
    @inject(MxClient.name) mxClient: MxClient,
    @inject(UserRepository.name) userRepository: UserRepository
  ) {
    this._mxClient = mxClient;
    this._userRepository = userRepository;
  }

  private async createMxUser(user: ICreateMxUser, req: Request) {
    const { email, isDisabled, metadata } = user;
    const { _id } = req.user as User;

    const dataToSend = {
      user: {
        email: email,
        id: _id.toString(),
        is_disabled: isDisabled,
        metadata: metadata,
      },
    };

    const createMxUserResponse = await this._mxClient.client.createUser(
      dataToSend
    );

    if (createMxUserResponse.status !== 200) {
      logger(createMxUserResponse.status);
      return Result.fail([{ message: "Error creating user in MX" }]);
    }

    const currentUser = req.user as User;

    const mxUserDetails = {
      mxUserId: createMxUserResponse.data.user.guid,
      email: email,
      id: createMxUserResponse.data.user.id,
      isDisabled: isDisabled,
      metadata: typeof metadata === "string" ? {} : metadata || {},
      createdAt: new Date(),
    };

    await this._userRepository.update(currentUser._id, {
      mxUsers: [...(currentUser.mxUsers || []), mxUserDetails],
    });

    return Result.ok(createMxUserResponse.data);
  }

  public async handle(req: Request, res: Response) {
    const values = await createMxUserSchema.validateAsync(req.body);
    const result = await this.createMxUser(values, req);

    if (result.isFailure) {
      return Result.fail(result.errors);
    }

    return Result.ok(result.value);
  }
}
