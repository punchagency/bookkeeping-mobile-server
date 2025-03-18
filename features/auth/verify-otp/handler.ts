import dayjs from "dayjs";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { verifyOtpSchema } from "./verify-otp.dto";
import { TokenType } from "../../../domain/entities/token";
import { AuthTokenUtils } from "../../../utils/auth-token";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { TokenRepository } from "./../../../infrastructure/repositories/token/token-repository";

@injectable()
export default class VerifyOtpHandler {
  private readonly _authTokenUtils: AuthTokenUtils;
  private readonly _userRepository: UserRepository;
  private readonly _tokenRepository: TokenRepository;

  constructor(
    @inject(UserRepository.name) userRepository,
    @inject(AuthTokenUtils.name) authTokenUtils,
    @inject(TokenRepository.name) tokenRepository
  ) {
    this._userRepository = userRepository;
    this._authTokenUtils = authTokenUtils;
    this._tokenRepository = tokenRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await verifyOtpSchema.validateAsync(req.body);

    return this.verifyOtp(values.otp);
  }

  private async verifyOtp(otp: string) {
    const otpExists = await this._tokenRepository.findByOtp(otp);

    if (!otpExists) {
      return Result.fail([{ message: "Invalid or expired token" }]);
    }

    if (otpExists.expiresAt < new Date()) {
      await this._tokenRepository.delete(otpExists.id);

      return Result.fail([{ message: "Invalid or expired token" }]);
    }

    const user = await this._userRepository.findById(otpExists.userId);

    if (!user) {
      return Result.fail([{ message: "User not found" }]);
    }

    if (user.isVerified) {
      return Result.fail([{ message: "User already verified" }]);
    }

    if (user.verificationMethod === "EMAIL") {
      await this._userRepository.update(otpExists.userId, {
        isVerified: true,
        isEmailVerified: true,
      });
    } else {
      await this._userRepository.update(otpExists.userId, {
        isVerified: true,
        isPhoneVerified: true,
      });
    }

    await this._tokenRepository.delete(otpExists.id);

    const signupFlowToken = await this._tokenRepository.create({
      userId: user._id,
      token: this._authTokenUtils.generateTempSignupFlowToken(),
      type: TokenType.SIGNUP_FLOW_TOKEN,
      expiresAt: dayjs().add(7, "days").toDate(),
    });

    return Result.ok({
      signupFlowToken: signupFlowToken.token,
    });
  }
}
