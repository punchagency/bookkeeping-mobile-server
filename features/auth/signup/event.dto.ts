export const SIGNUP_EVENT = "SIGNUP_EVENT";

export interface ISignupEvent {
  fullName: string;
  email: string;
  phoneNumber: string;
  otp: string;
  otpDeliveryMethod: "EMAIL" | "PHONE_NUMBER";
}

export interface ISignupErrorContext {
  statusCode: number;
}
