import Joi from "joi";

export const resendOtpSchema = Joi.object({
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
});
