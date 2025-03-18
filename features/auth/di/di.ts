import { container } from "tsyringe";

import AuthRoute from "../route";
import AuthController from "../controller";
import LoginHandler from "../login/handler";
import SignupHandler from "../signup/handler";
import LogoutHandler from "../logout/handler";
import VerifyOtpHandler from "../verify-otp/handler";
import ResendOtpHandler from "../resend-otp/handler";
import ResetPasswordHandler from "../reset-password/handler";
import ForgotPasswordHandler from "../forgot-password/handler";
import RefreshTokenHandler from "../refresh-access-token/handler";
import InitiateSignupOtpHandler from "../initiate-signup-otp/handler";

export const registerAuthDi = () => {
  container.register(AuthController.name, {
    useClass: AuthController,
  });

  container.register(AuthRoute.name, {
    useClass: AuthRoute,
  });

  container.register(LoginHandler.name, {
    useClass: LoginHandler,
  });

  container.register(SignupHandler.name, {
    useClass: SignupHandler,
  });

  container.register(RefreshTokenHandler.name, {
    useClass: RefreshTokenHandler,
  });

  container.register(LogoutHandler.name, {
    useClass: LogoutHandler,
  });

  container.register(VerifyOtpHandler.name, {
    useClass: VerifyOtpHandler,
  });

  container.register(ResendOtpHandler.name, {
    useClass: ResendOtpHandler,
  });

  container.register(InitiateSignupOtpHandler.name, {
    useClass: InitiateSignupOtpHandler,
  });

  container.register(ForgotPasswordHandler.name, {
    useClass: ForgotPasswordHandler,
  });

  container.register(ResetPasswordHandler.name, {
    useClass: ResetPasswordHandler,
  });
};
