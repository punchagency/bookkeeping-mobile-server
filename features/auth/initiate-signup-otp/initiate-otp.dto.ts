import Joi from "joi";

export const initiateSignupOtpSchema = Joi.object({
  details: Joi.string().required(),
  type: Joi.string().valid("EMAIL", "PHONE_NUMBER").required(),
});

export interface IInitiateSignupOtpDto {
  details: string;
  type: "EMAIL" | "PHONE_NUMBER";
}

