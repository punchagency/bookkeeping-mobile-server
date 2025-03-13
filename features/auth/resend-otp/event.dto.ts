export const RESEND_OTP_EVENT = "RESEND_OTP_EVENT";

export interface IResendOtpEvent {
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
