import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { logger } from "./../../utils";
import LoginHandler from "./login/handler";
import SignupHandler from "./signup/handler";
import LogoutHandler from "./logout/handler";
import VerifyOtpHandler from "./verify-otp/handler";
import ResendOtpHandler from "./resend-otp/handler";
import ResetPasswordHandler from "./reset-password/handler";
import ForgotPasswordHandler from "./forgot-password/handler";
import ApiResponse from "./../../application/response/response";
import RefreshTokenHandler from "./refresh-access-token/handler";
import InitiateSignupOtpHandler from "./initiate-signup-otp/handler";
import { IApiResponse } from "./../../application/response/i-response";

@injectable()
export default class AuthController {
  private readonly _apiResponse: IApiResponse;
  private readonly _loginHandler: LoginHandler;
  private readonly _signupHandler: SignupHandler;
  private readonly _logoutHandler: LogoutHandler;
  private readonly _verifyOtpHandler: VerifyOtpHandler;
  private readonly _resendOtpHandler: ResendOtpHandler;
  private readonly _refreshTokenHandler: RefreshTokenHandler;
  private readonly _resetPasswordHandler: ResetPasswordHandler;
  private readonly _forgotPasswordHandler: ForgotPasswordHandler;
  private readonly _initiateSignupOtpHandler: InitiateSignupOtpHandler;
  constructor(
    @inject(ApiResponse.name) apiResponse: IApiResponse,
    @inject(LoginHandler.name) loginHandler: LoginHandler,
    @inject(SignupHandler.name) signupHandler: SignupHandler,
    @inject(LogoutHandler.name) logoutHandler: LogoutHandler,
    @inject(VerifyOtpHandler.name) verifyOtpHandler: VerifyOtpHandler,
    @inject(ResendOtpHandler.name) resendOtpHandler: ResendOtpHandler,
    @inject(RefreshTokenHandler.name) refreshTokenHandler: RefreshTokenHandler,
    @inject(InitiateSignupOtpHandler.name)
    initiateSignupOtpHandler: InitiateSignupOtpHandler,
    @inject(ForgotPasswordHandler.name)
    forgotPasswordHandler: ForgotPasswordHandler,
    @inject(ResetPasswordHandler.name)
    resetPasswordHandler: ResetPasswordHandler
  ) {
    this._apiResponse = apiResponse;
    this._loginHandler = loginHandler;
    this._signupHandler = signupHandler;
    this._logoutHandler = logoutHandler;
    this._verifyOtpHandler = verifyOtpHandler;
    this._resendOtpHandler = resendOtpHandler;
    this._refreshTokenHandler = refreshTokenHandler;
    this._resetPasswordHandler = resetPasswordHandler;
    this._forgotPasswordHandler = forgotPasswordHandler;
    this._initiateSignupOtpHandler = initiateSignupOtpHandler;
  }

  public async login(req: Request, res: Response) {
    const loginResult = await this._loginHandler.handle(req, res);

    if (loginResult.isFailure) {
      let errors = loginResult.errors.map((error) => error.message);
      logger(errors);

      return this._apiResponse.BadRequest(res, errors);
    }

    return this._apiResponse.Ok(res, "Login successful", loginResult.value);
  }

  public async signup(req: Request, res: Response) {
    const signupResult = await this._signupHandler.handle(req, res);

    if (signupResult.isFailure) {
      if (signupResult.metadata.context.statusCode == 409) {
        return this._apiResponse.Conflict(res, "User already exist", null);
      }

      let errors = signupResult.errors.map((error) => error.message);
      return this._apiResponse.BadRequest(res, errors);
    }

    return this._apiResponse.Created(res, signupResult.value.toString(), null);
  }

  public async logout(req: Request, res: Response) {
    const logoutResult = await this._logoutHandler.handle(req, res);

    if (logoutResult.isFailure) {
      let errors = logoutResult.errors.map((error) => error.message);
      return this._apiResponse.BadRequest(res, errors);
    }

    return this._apiResponse.Ok(res, "Logout successful", {});
  }

  public async refreshToken(req: Request, res: Response) {
    const refreshTokenResult = await this._refreshTokenHandler.handle(req, res);

    if (refreshTokenResult.isFailure) {
      let errors = refreshTokenResult.errors.map((error) => error.message);

      return this._apiResponse.BadRequest(res, errors);
    }

    return this._apiResponse.Ok(
      res,
      "Access token refreshed successfully",
      refreshTokenResult.value
    );
  }

  public async verifyOtp(req: Request, res: Response) {
    const verifyOtpResult = await this._verifyOtpHandler.handle(req, res);

    if (verifyOtpResult.isFailure) {
      return this._apiResponse.BadRequest(
        res,
        verifyOtpResult.errors.map((error) => error.message)
      );
    }

    return this._apiResponse.Ok(
      res,
      "Account verified successfully",
      verifyOtpResult.value
    );
  }

  public async resendOtp(req: Request, res: Response) {
    const resendOtpResult = await this._resendOtpHandler.handle(req, res);

    if (resendOtpResult.isFailure) {
      if (resendOtpResult?.metadata?.context?.statusCode == 404) {
        return this._apiResponse.NotFound(res, "User not found", null);
      }

      return this._apiResponse.BadRequest(
        res,
        resendOtpResult.errors.map((error) => error.message)
      );
    }

    return this._apiResponse.Ok(res, "OTP resent successfully", null);
  }

  public async initiateSignupOtp(req: Request, res: Response) {
    const initiateSignupOtpResult = await this._initiateSignupOtpHandler.handle(
      req,
      res
    );

    if (initiateSignupOtpResult.isFailure) {
      return this._apiResponse.BadRequest(
        res,
        initiateSignupOtpResult.errors.map((error) => error.message)
      );
    }

    return this._apiResponse.Ok(
      res,
      initiateSignupOtpResult.value.toString(),
      null
    );
  }

  public async forgotPassword(req: Request, res: Response) {
    const forgotPasswordResult = await this._forgotPasswordHandler.handle(
      req,
      res
    );

    if (forgotPasswordResult.isFailure) {
      const statusCode = forgotPasswordResult.metadata.context.statusCode;

      switch (statusCode) {
        case 404:
          return this._apiResponse.NotFound(
            res,
            forgotPasswordResult.errors[0].message,
            null
          );

        default:
          return this._apiResponse.BadRequest(
            res,
            forgotPasswordResult.errors.map((error) => error.message)
          );
      }
    }

    return this._apiResponse.Ok(
      res,
      "A password reset OTP has been sent successfully",
      null
    );
  }

  public async resetPassword(req: Request, res: Response) {
    const resetPasswordResult = await this._resetPasswordHandler.handle(
      req,
      res
    );

    if (resetPasswordResult.isFailure) {
      const statusCode = resetPasswordResult.metadata?.context?.statusCode;

      switch (statusCode) {
        case 404:
          return this._apiResponse.NotFound(
            res,
            resetPasswordResult.errors[0].message,
            null
          );
        default:
          return this._apiResponse.BadRequest(
            res,
            resetPasswordResult.errors.map((error) => error.message)
          );
      }
    }

    return this._apiResponse.Ok(res, "Password reset successfully", null);
  }
}
