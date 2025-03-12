import Joi from "joi";

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().required().min(6).max(6),
});

