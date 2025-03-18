import dayjs from "dayjs";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import forgotPasswordEventEmitter from "./event";
import { FORGOT_PASSWORD_EVENT } from "./event.dto";
import { AuthTokenUtils, logger } from "./../../../utils";
import { forgotPasswordSchema } from "./forgot-password.dto";
import { TokenType } from "./../../../domain/entities/token";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { IUserRepository } from "./../../../infrastructure/repositories/user/i-user-repository";
import { TokenRepository } from "./../../../infrastructure/repositories/token/token-repository";
import { ITokenRepository } from "./../../../infrastructure/repositories/token/i-token-repository";

@injectable()
export default class ForgotPasswordHandler {
  private readonly _authTokenUtils: AuthTokenUtils;
  private readonly _userRepository: IUserRepository;
  private readonly _tokenRepository: ITokenRepository;

  constructor(
    @inject(AuthTokenUtils.name) authTokenUtils: AuthTokenUtils,
    @inject(UserRepository.name) userRepository: UserRepository,
    @inject(TokenRepository.name) tokenRepository: TokenRepository
  ) {
    this._authTokenUtils = authTokenUtils;
    this._userRepository = userRepository;
    this._tokenRepository = tokenRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await forgotPasswordSchema.validateAsync(req.body);

    if (values.email) {
      return await this.forgotPassword(values.email, "EMAIL");
    }

    if (values.phoneNumber) {
      return await this.forgotPassword(values.phoneNumber, "PHONE_NUMBER");
    }
  }

  private async forgotPassword(
    value: string,
    optType: "EMAIL" | "PHONE_NUMBER"
  ) {
    const existingUser =
      optType === "EMAIL"
        ? await this._userRepository.findByEmail(value)
        : await this._userRepository.findByPhoneNumber(value);

    if (!existingUser) {
      return Result.fail("User not found").withMetadata({
        context: {
          statusCode: 404,
        },
      });
    }

    logger(existingUser);

    if (!existingUser.isVerified) {
      return Result.fail("User not verified. Please verify your account.");
    }

    await this._tokenRepository.deleteTokensByType(
      existingUser._id,
      TokenType.FORGOT_PASSWORD_OTP
    );

    const forgotPasswordOtp = await this._tokenRepository.create({
      userId: existingUser._id,
      expiresAt: dayjs().add(1, "hour").toDate(),
      token: this._authTokenUtils.generateOtpToken(),
      type: TokenType.FORGOT_PASSWORD_OTP,
    });

    const eventDetails = {
      firstName: existingUser.firstName,
      lastName: existingUser.lastName,
      email: existingUser.email,
      phoneNumber: existingUser.phoneNumber,
      otp: forgotPasswordOtp.token,
      otpDeliveryMethod: optType,
    };

    forgotPasswordEventEmitter.emit(FORGOT_PASSWORD_EVENT, eventDetails);

    return Result.ok("OTP sent successfully");
  }
}
