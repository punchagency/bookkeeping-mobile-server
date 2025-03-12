export const INITIATE_SIGNUP_OTP_EVENT = "INITIATE_SIGNUP_OTP_EVENT";

export interface IInitiateSignupOtpEvent {
  otp: string;
  channel: "EMAIL" | "PHONE_NUMBER";
  phoneNumber?: string;
  email?: string;
}
