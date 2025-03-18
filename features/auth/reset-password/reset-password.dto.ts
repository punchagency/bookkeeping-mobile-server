import Joi from "joi";

export const resetPasswordSchema = Joi.object({
  otp: Joi.string().required().max(6).min(6),
  newPassword: Joi.string().min(8).max(30).required(),
});
