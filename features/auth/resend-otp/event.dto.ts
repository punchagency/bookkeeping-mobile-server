export const RESEND_OTP_EVENT = "RESEND_OTP_EVENT";

export interface IResendOtpEvent {
  fullName: string;
  email: string;
  phoneNumber: string;
  otp: string;
  otpDeliveryMethod: "EMAIL" | "PHONE_NUMBER";
}

export interface IResendOtpErrorContext {
  statusCode: number;
}
