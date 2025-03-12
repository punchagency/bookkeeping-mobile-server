import dayjs from "dayjs";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import initiateSignupOtpEventEmitter from "./event";
import {
  IInitiateSignupOtpEvent,
  INITIATE_SIGNUP_OTP_EVENT,
} from "./event.dto";
import {
  initiateSignupOtpSchema,
  IInitiateSignupOtpDto,
} from "./initiate-otp.dto";
import { User, VerificationMethod } from "./../../../domain/entities/user";
import { TokenType } from "../../../domain/entities/token";
import { AuthTokenUtils } from "./../../../utils/auth-token";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { TokenRepository } from "./../../../infrastructure/repositories/token/token-repository";

@injectable()
export default class InitiateSignupOtpHandler {
  private readonly _userRepository: UserRepository;
  private readonly _tokenRepository: TokenRepository;
  private readonly _authTokenUtils: AuthTokenUtils;
  constructor(
    @inject(UserRepository.name) userRepository: UserRepository,
    @inject(AuthTokenUtils.name) authTokenUtils: AuthTokenUtils,
    @inject(TokenRepository.name) tokenRepository: TokenRepository
  ) {
    this._userRepository = userRepository;
    this._authTokenUtils = authTokenUtils;
    this._tokenRepository = tokenRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await initiateSignupOtpSchema.validateAsync(req.body);

    const initiateSignupOtpResult = await this.initiateSignupOtp(values);

    if (initiateSignupOtpResult.isFailure) {
      return Result.fail(initiateSignupOtpResult.errors);
    }

    return Result.ok(initiateSignupOtpResult.value);
  }

  private async initiateSignupOtp(data: IInitiateSignupOtpDto) {
    const { details, type } = data;

    let user: User | null = null;

    switch (type) {
      case "EMAIL":
        user = await this._userRepository.findByEmail(details);
        break;
      case "PHONE_NUMBER":
        user = await this._userRepository.findByPhoneNumber(details);
        break;
    }

    if (user) {
      return Result.fail("User aleady exists");
    }

    try {
      let createdUser: User | null = null;

      if (type === "EMAIL") {
        createdUser = await this._userRepository.create({
          email: details,
          accountType: null,
          fullName: null,
          phoneNumber: null,
          password: null,
          isVerified: false,
          isEmailVerified: false,
          isPhoneVerified: false,
          mxUsers: [],
          verificationMethod: VerificationMethod.EMAIL,
        });
      } else if (type === "PHONE_NUMBER") {
        createdUser = await this._userRepository.create({
          email: null,
          phoneNumber: details,
          accountType: null,
          fullName: null,
          password: null,
          isVerified: false,
          isEmailVerified: false,
          isPhoneVerified: false,
          mxUsers: [],
          verificationMethod: VerificationMethod.PHONE,
        });
      } else {
        return Result.fail("Invalid account type");
      }

      if (!createdUser) {
        return Result.fail("Failed to create user");
      }

      const otp = await this._tokenRepository.create({
        userId: createdUser._id,
        token: this._authTokenUtils.generateOtpToken(),
        expiresAt: dayjs().add(1, "hour").toDate(),
        type: TokenType.OTP,
      });

      const initiateSignupOtpEvent: IInitiateSignupOtpEvent = {
        otp: otp.token,
        channel: type,
        phoneNumber: type === "PHONE_NUMBER" ? details : undefined,
        email: type === "EMAIL" ? details : undefined,
      };

      initiateSignupOtpEventEmitter.emit(
        INITIATE_SIGNUP_OTP_EVENT,
        initiateSignupOtpEvent
      );

      const otpDeliveryMethod = type === "EMAIL" ? "email" : "phone";

      return Result.ok(
        `An OTP has been sent. Please check your ${otpDeliveryMethod} for the OTP.`
      );
    } catch (error: any) {
      console.error("Failed to create user:", error);
      throw error;
    }
  }
}
