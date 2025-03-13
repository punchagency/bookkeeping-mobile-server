import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { IError, Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import signupSchema from "./signup.dto";
import { User } from "./../../../domain/entities/user";
import { AuthTokenUtils } from "./../../../utils/auth-token";
import { TokenType } from "./../../../domain/entities/token";
import MxClient from "../../../infrastructure/config/packages/mx";
import { ISignupErrorContext } from "./event.dto";
import { UserRepository } from "../../../infrastructure/repositories/user/user-repository";
import { IUserRepository } from "../../../infrastructure/repositories/user/i-user-repository";
import { TokenRepository } from "../../../infrastructure/repositories/token/token-repository";
import { ITokenRepository } from "../../../infrastructure/repositories/token/i-token-repository";

@injectable()
export default class SignupHandler {
  private readonly _mxClient: MxClient;
  private readonly _authTokenUtils: AuthTokenUtils;
  private readonly _userRepository: IUserRepository;
  private readonly _tokenRepository: ITokenRepository;

  constructor(
    @inject(MxClient.name) mxClient: MxClient,
    @inject(AuthTokenUtils.name) authTokenUtils: AuthTokenUtils,
    @inject(UserRepository.name) userRepository: IUserRepository,
    @inject(TokenRepository.name) tokenRepository: ITokenRepository
  ) {
    this._mxClient = mxClient;
    this._userRepository = userRepository;
    this._authTokenUtils = authTokenUtils;
    this._tokenRepository = tokenRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await signupSchema.validateAsync(req.body);

    const signupToken = await this._tokenRepository.findByToken(
      values.signupFlowToken,
      TokenType.SIGNUP_FLOW_TOKEN
    );

    if (!signupToken) {
      return Result.fail<IError, ISignupErrorContext>([
        { message: "Invalid or expired signup flow token" },
      ]).withMetadata({
        context: {
          statusCode: 400,
        },
      });
    }

    if (signupToken.expiresAt < new Date()) {
      return Result.fail<IError, ISignupErrorContext>([
        { message: "Signup flow token expired" },
      ]).withMetadata({
        context: {
          statusCode: 400,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    const {
      accountType,
      companyName,
      companyWebsite,
      companyCategory,
      businessStructure,
    } = values;

    const detailsToEdit = {
      accountType,
      companyName,
      companyWebsite,
      companyCategory,
      businessStructure,
    };

    const userToCreate: Partial<User> = {
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: hashedPassword,
      firstName: values.firstName,
      lastName: values.lastName,
      verificationMethod: values.otpDeliveryMethod,
    };

    const updatedUser = await this._userRepository.update(
      signupToken.userId,
      detailsToEdit
    );

    /**
     * Now, we can create the MX user
     */

    const dataToSend = {
      user: {
        email: values.email,
        id: signupToken.userId.toString(),
      },
    };

    try {
      const createMxUserResponse = await this._mxClient.client.createUser(
        dataToSend
      );

      const newMxUser = createMxUserResponse.data.user;

      const mxUserDetails = {
        mxUserId: newMxUser.guid,
        email: values.email,
        id: newMxUser.id,
        metadata: null,
        createdAt: new Date(),
      };

      await this._userRepository.update(signupToken.userId, {
        mxUsers: [
          ...(updatedUser.mxUsers || []),
          {
            ...mxUserDetails,
            isDisabled: false,
          },
        ],
      });

      const createdOtpToken = await this._tokenRepository.create({
        userId: signupToken.userId,
        expiresAt: dayjs().add(1, "hour").toDate(),
        token: this._authTokenUtils.generateOtpToken(),
        type: TokenType.OTP,
      });

      return Result.ok(`Account created successfully`);
    } catch (error: any) {
      return Result.fail<IError, ISignupErrorContext>([
        { message: "Error creating mx user" },
      ]).withMetadata({
        context: {
          statusCode: 500,
        },
      });
    }
  }
}
