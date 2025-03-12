import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "../../../utils";
import { TokenRepository } from "../../../infrastructure/repositories/token/token-repository";

@injectable()
export default class LogoutHandler {
  private readonly _tokenRepository: TokenRepository;

  constructor(
    @inject(TokenRepository.name)
    tokenRepository: TokenRepository
  ) {
    this._tokenRepository = tokenRepository;
  }

  public async handle(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (refreshToken) {
        const tokenDoc = await this._tokenRepository.findByRefreshToken(
          refreshToken
        );

        if (tokenDoc) {
          await this._tokenRepository.deleteRefreshTokens(tokenDoc.userId);
        }
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return Result.ok({ message: "Logged out successfully" });
    } catch (error: any) {
      logger("Logout error:", error);
      return Result.fail([{ message: "Logout failed" }]);
    }
  }
}
