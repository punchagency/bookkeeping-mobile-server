import dayjs from "dayjs";
import bcrypt from "bcrypt";
import { IError, Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import signupSchema from "./signup.dto";
import signupEventEmitter from "./event";
import { User } from "./../../../domain/entities/user";
import { AuthTokenUtils } from "./../../../utils/auth-token";
import { TokenType } from "./../../../domain/entities/token";
import MxClient from "../../../infrastructure/config/packages/mx";
import { ISignupErrorContext, ISignupEvent, SIGNUP_EVENT } from "./event.dto";
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

    const userExists = await this._userRepository.findByEmail(values.email);

    if (userExists) {
      return Result.fail<IError, ISignupErrorContext>([
        { message: "User already exists" },
      ]).withMetadata({
        context: {
          statusCode: 409,
        },
      });
    }

    const hashedPassword = await bcrypt.hash(values.password, 10);

    const otpDeliveryMethod =
      values.otpDeliveryMethod === "EMAIL" ? "email" : "phone";

    const userToCreate: Partial<User> = {
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: hashedPassword,
      fullName: values.fullName,
      verificationMethod: values.otpDeliveryMethod,
    };

    const user = await this._userRepository.create(userToCreate as User);

    /**
     * Now, we can create the MX user
     */

    const dataToSend = {
      user: {
        email: values.email,
        id: user._id.toString(),
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

      await this._userRepository.update(user._id, {
        mxUsers: [
          ...(user.mxUsers || []),
          {
            ...mxUserDetails,
            isDisabled: false,
          },
        ],
      });

      const createdOtpToken = await this._tokenRepository.create({
        userId: user._id,
        expiresAt: dayjs().add(1, "hour").toDate(),
        token: this._authTokenUtils.generateOtpToken(),
        type: TokenType.OTP,
      });

      const signupEvent: ISignupEvent = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        otp: createdOtpToken.token,
        otpDeliveryMethod: values.otpDeliveryMethod as "EMAIL" | "PHONE_NUMBER",
      };

      signupEventEmitter.emit(SIGNUP_EVENT, signupEvent);

      return Result.ok(
        `Account created. Please check your ${otpDeliveryMethod} for the OTP.`
      );
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
