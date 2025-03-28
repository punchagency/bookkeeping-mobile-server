import { Router } from "express";
import { inject, injectable } from "tsyringe";

import AuthController from "./controller";

@injectable()
export default class AuthRoute {
  public readonly router: Router;
  private readonly _authController: AuthController;

  constructor(@inject(AuthController.name) authController: AuthController) {
    this.router = Router();
    this._authController = authController;

    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post("/login", (req, res) =>
      this._authController.login(req, res)
    );

    this.router.post("/signup", (req, res) =>
      this._authController.signup(req, res)
    );

    this.router.post("/refresh-access-token", (req, res) =>
      this._authController.refreshToken(req, res)
    );

    this.router.post("/logout", (req, res) =>
      this._authController.logout(req, res)
    );

    this.router.post("/verify-otp", (req, res) =>
      this._authController.verifyOtp(req, res)
    );

    this.router.post("/resend-otp", (req, res) =>
      this._authController.resendOtp(req, res)
    );

    this.router.post("/initiate-signup-otp", (req, res) =>
      this._authController.initiateSignupOtp(req, res)
    );

    this.router.post("/forgot-password", (req, res) =>
      this._authController.forgotPassword(req, res)
    );

    this.router.post("/reset-password", (req, res) =>
      this._authController.resetPassword(req, res)
    );
  }
}
