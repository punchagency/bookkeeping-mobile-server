export const SIGNUP_EVENT = "SIGNUP_EVENT";

export interface ISignupEvent {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  otp: string;
  otpDeliveryMethod: "EMAIL" | "PHONE_NUMBER";
}

export interface ISignupErrorContext {
  statusCode: number;
}
