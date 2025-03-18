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
import {
  resendOtpSchema,
  ResendOtpContext,
  resendOtpContext,
} from "./resend-otp.dto";
import { AuthTokenUtils } from "./../../../utils/auth-token";
import { Token, TokenType } from "./../../../domain/entities/token";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { TokenRepository } from "../../../infrastructure/repositories/token/token-repository";
import { Types } from "mongoose";

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
      return this.resendOtp(values.email, "EMAIL", values.context);
    }

    return this.resendOtp(values.phoneNumber, "PHONE_NUMBER", values.context);
  }

  public async resendOtp(
    value: string,
    optType: "EMAIL" | "PHONE_NUMBER",
    context: ResendOtpContext
  ) {
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

    if (
      context === resendOtpContext.INITIATE_SIGNUP &&
      existingUser.isVerified
    ) {
      return Result.fail([{ message: "User already verified" }]);
    }

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

    let otp: Token;

    switch (context) {
      case resendOtpContext.INITIATE_SIGNUP:
        await this._tokenRepository.deleteTokensByType(
          existingUser._id,
          TokenType.INITIATE_SIGNUP_OTP
        );

        otp = await this._tokenRepository.create({
          userId: existingUser._id,
          expiresAt: dayjs().add(1, "hour").toDate(),
          token: this._authTokenUtils.generateOtpToken(),
          type: TokenType.INITIATE_SIGNUP_OTP,
        });

        break;
      case resendOtpContext.FORGOT_PASSWORD:
        await this._tokenRepository.deleteTokensByType(
          existingUser._id,
          TokenType.FORGOT_PASSWORD_OTP
        );

        otp = await this._tokenRepository.create({
          userId: existingUser._id,
          expiresAt: dayjs().add(1, "hour").toDate(),
          token: this._authTokenUtils.generateOtpToken(),
          type: TokenType.FORGOT_PASSWORD_OTP,
        });

        break;
    }

    resendOtpEventEmitter.emit(RESEND_OTP_EVENT, {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      otp: otp.token,
      otpDeliveryMethod: optType,
      context,
    } as IResendOtpEvent);

    return Result.ok(`New OTP sent successfully`);
  }
}
