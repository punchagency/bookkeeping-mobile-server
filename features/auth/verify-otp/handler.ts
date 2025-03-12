import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { verifyOtpSchema } from "./verify-otp.dto";
import { TokenType } from "../../../domain/entities/token";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { TokenRepository } from "./../../../infrastructure/repositories/token/token-repository";

@injectable()
export default class VerifyOtpHandler {
  private readonly _userRepository: UserRepository;
  private readonly _tokenRepository: TokenRepository;

  constructor(
    @inject(TokenRepository.name) tokenRepository,
    @inject(UserRepository.name) userRepository
  ) {
    this._userRepository = userRepository;
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
      await this._tokenRepository.deleteByUserId(
        otpExists.userId,
        TokenType.OTP
      );
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

    return Result.ok("OTP verified successfully");
  }
}
