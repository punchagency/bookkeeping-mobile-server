import bcrypt from "bcrypt";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { resetPasswordSchema } from "./reset-password.dto";
import { TokenType } from "./../../../domain/entities/token";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { IUserRepository } from "./../../../infrastructure/repositories/user/i-user-repository";
import { TokenRepository } from "./../../../infrastructure/repositories/token/token-repository";
import { ITokenRepository } from "./../../../infrastructure/repositories/token/i-token-repository";

@injectable()
export default class ResetPasswordHandler {
  private readonly _userRepository: IUserRepository;
  private readonly _tokenRepository: ITokenRepository;

  constructor(
    @inject(TokenRepository.name) tokenRepository: ITokenRepository,
    @inject(UserRepository.name) userRepository: IUserRepository
  ) {
    this._userRepository = userRepository;
    this._tokenRepository = tokenRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await resetPasswordSchema.validateAsync(req.body);

    const token = await this._tokenRepository.findByToken(
      values.otp,
      TokenType.FORGOT_PASSWORD_OTP
    );

    if (!token || token.expiresAt < new Date()) {
      return Result.fail("Invalid or expired OTP");
    }

    const user = await this._userRepository.findById(token.userId);

    if (!user) {
      return Result.fail("User not found").withMetadata({
        context: {
          statusCode: 404,
        },
      });
    }

    if (!user.isVerified) {
      return Result.fail("User is not verified");
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);

    user.password = hashedPassword;

    await this._userRepository.update(user._id, user);

    await this._tokenRepository.deleteByUserId(
      user._id,
      TokenType.FORGOT_PASSWORD_OTP
    );

    return Result.ok("Password reset successfully");
  }
}
