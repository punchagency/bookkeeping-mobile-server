import { Types } from "mongoose";
import { IRepository } from "../i-repository";
import { Token, TokenType } from "../../../domain/entities/token";

export interface ITokenRepository extends IRepository<Token> {
  findByUserId(userId: Types.ObjectId): Promise<Token | null>;
  findByRefreshToken(refreshToken: string): Promise<Token | null>;
  deleteByUserId(userId: Types.ObjectId, type: TokenType): Promise<boolean>;
  deleteRefreshTokens(userId: Types.ObjectId): Promise<boolean>;
  findByOtp(otp: string);
  deleteTokensByType(userId: Types.ObjectId, type: TokenType): Promise<any>;
  findByToken(token: string, type: TokenType): Promise<Token | null>;
}
