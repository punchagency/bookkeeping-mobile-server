export const FORGOT_PASSWORD_EVENT = "FORGOT_PASSWORD_EVENT";

export interface IForgotPasswordEvent {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  otp: string;
  otpDeliveryMethod: "EMAIL" | "PHONE_NUMBER";
}

export interface IResendOtpErrorContext {
  statusCode: number;
}
