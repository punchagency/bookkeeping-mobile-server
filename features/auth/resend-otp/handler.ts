import dayjs from "dayjs";
import { IError, Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import resendOtpEventEmitter from "./event";
import {
  IResendOtpErrorContext,
  IResendOtpEvent,
  RESEND_OTP_EVENT,
} from "./event.dto";
import { resendOtpSchema } from "./resend-otp.dto";
import { AuthTokenUtils } from "./../../../utils/auth-token";
import { TokenType } from "./../../../domain/entities/token";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { TokenRepository } from "../../../infrastructure/repositories/token/token-repository";

@injectable()
export default class ResendOtpHandler {
  private readonly _authTokenUtils: AuthTokenUtils;
  private readonly _userRepository: UserRepository;
  private readonly _tokenRepository: TokenRepository;

  constructor(
    @inject(AuthTokenUtils.name) authTokenUtils,
    @inject(UserRepository.name) userRepository,
    @inject(TokenRepository.name) tokenRepository
  ) {
    this._authTokenUtils = authTokenUtils;
    this._userRepository = userRepository;
    this._tokenRepository = tokenRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await resendOtpSchema.validateAsync(req.body);

    if (values.email) {
      return this.resendOtp(values.email, "EMAIL");
    }

    return this.resendOtp(values.phoneNumber, "PHONE_NUMBER");
  }

  public async resendOtp(value: string, optType: "EMAIL" | "PHONE_NUMBER") {
    const existingUser =
      optType === "EMAIL"
        ? await this._userRepository.findByEmail(value)
        : await this._userRepository.findByPhoneNumber(value);

    if (!existingUser) {
      return Result.fail<IError, IResendOtpErrorContext>([
        { message: "User not found" },
      ]).withMetadata({
        context: {
          statusCode: 404,
        },
      });
    }

    if (existingUser.isVerified) {
      return Result.fail([{ message: "User already verified" }]);
    }

    console.log(existingUser);

    if (optType === "EMAIL" && existingUser.verificationMethod !== "EMAIL") {
      return Result.fail([
        { message: "User verification method is not email" },
      ]);
    }

    if (
      optType === "PHONE_NUMBER" &&
      existingUser.verificationMethod !== "PHONE_NUMBER"
    ) {
      return Result.fail([
        { message: "User verification method is not phone number" },
      ]);
    }

    await this._tokenRepository.deleteAllOtpTokens(existingUser._id);

    const createdOtpToken = await this._tokenRepository.create({
      userId: existingUser._id,
      expiresAt: dayjs().add(1, "hour").toDate(),
      token: this._authTokenUtils.generateOtpToken(),
      type: TokenType.OTP,
    });

    resendOtpEventEmitter.emit(RESEND_OTP_EVENT, {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      otp: createdOtpToken.token,
      otpDeliveryMethod: optType,
    } as IResendOtpEvent);

    return Result.ok("New OTP sent successfully");
  }
}
