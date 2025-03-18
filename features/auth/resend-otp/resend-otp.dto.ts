import Joi from "joi";

export const resendOtpContext = {
  FORGOT_PASSWORD: "FORGOT_PASSWORD",
  VERIFY_EMAIL: "VERIFY_EMAIL",
  INITIATE_SIGNUP: "INITIATE_SIGNUP",
  LOGIN: "LOGIN",
} as const;

export type ResendOtpContext = (typeof resendOtpContext)[keyof typeof resendOtpContext];

export const resendOtpSchema = Joi.object({
  context: Joi.string()
    .valid(...Object.values(resendOtpContext))
    .required(),
  email: Joi.string().email().lowercase(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) /* Matches E.164 format */
    .messages({ "string.pattern.base": "Invalid phone number format" }),
}).xor("email", "phoneNumber");
