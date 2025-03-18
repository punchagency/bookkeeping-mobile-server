import Joi from "joi";

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().optional(),
  phoneNumber: Joi.string().optional(),
});

