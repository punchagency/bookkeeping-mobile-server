import jwt from "jsonwebtoken";
import { Types } from "mongoose";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "../../../utils";
import { TokenType } from "../../../domain/entities/token";
import { AuthTokenUtils } from "../../../utils/auth-token";
import { EnvConfiguration } from "../../../utils/env-config";
import { IRefreshTokenResponse } from "./refresh-token-response";
import { UserRepository } from "../../../infrastructure/repositories/user/user-repository";
import { TokenRepository } from "../../../infrastructure/repositories/token/token-repository";

@injectable()
export default class RefreshTokenHandler {
  private readonly _envConfig: EnvConfiguration;
  private readonly _userRepository: UserRepository;
  private readonly _authTokenUtils: AuthTokenUtils;
  private readonly _tokenRepository: TokenRepository;

  constructor(
    @inject(EnvConfiguration.name) envConfig: EnvConfiguration,
    @inject(UserRepository.name) userRepository: UserRepository,
    @inject(TokenRepository.name) tokenRepository: TokenRepository,
    @inject(AuthTokenUtils.name) authTokenUtils: AuthTokenUtils
  ) {
    this._envConfig = envConfig;
    this._userRepository = userRepository;
    this._tokenRepository = tokenRepository;
    this._authTokenUtils = authTokenUtils;
  }

  public async handle(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return Result.fail([{ message: "Refresh token not found" }]);
      }

      const decoded = jwt.verify(
        refreshToken,
        this._envConfig.JWT_REFRESH_SECRET
      ) as jwt.JwtPayload;

      if (decoded.type !== TokenType.REFRESH_TOKEN) {
        return Result.fail([{ message: "Invalid token type" }]);
      }

      const tokenDoc = await this._tokenRepository.findByRefreshToken(
        refreshToken
      );

      if (!tokenDoc) {
        return Result.fail([{ message: "Invalid refresh token" }]);
      }

      if (tokenDoc.expiresAt < new Date()) {
        await this._tokenRepository.deleteByUserId(
          tokenDoc.userId,
          TokenType.REFRESH_TOKEN
        );
        return Result.fail([{ message: "Refresh token expired" }]);
      }

      const user = await this._userRepository.findById(
        new Types.ObjectId(decoded.sub)
      );

      if (!user) {
        return Result.fail([{ message: "User not found" }]);
      }

      await this._tokenRepository.deleteRefreshTokens(user._id);

      const accessToken = this._authTokenUtils.generateAccessToken(
        user._id,
        user.email
      );
      const newRefreshToken = this._authTokenUtils.generateRefreshToken(
        user._id
      );

      await this._tokenRepository.create({
        userId: user._id,
        token: newRefreshToken,
        type: TokenType.REFRESH_TOKEN,
        expiresAt: this._authTokenUtils.getRefreshTokenExpiry(),
        userAgent: req.headers["user-agent"],
      });

      this._authTokenUtils.setRefreshTokenCookie(res, newRefreshToken);

      return Result.ok<IRefreshTokenResponse>({
        accessToken,
      });
    } catch (error: any) {
      logger("Refresh token error:", error);

      if (error instanceof jwt.JsonWebTokenError) {
        return Result.fail([{ message: "Invalid refresh token" }]);
      }

      return Result.fail([{message: "Token refresh failed" }]);
    }
  }
}
