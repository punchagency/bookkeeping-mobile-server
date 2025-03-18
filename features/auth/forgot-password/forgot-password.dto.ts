import Joi from "joi";

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().lowercase(),
  phoneNumber: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/) /* Matches E.164 format */
    .messages({ "string.pattern.base": "Invalid phone number format" }),
}).xor("email", "phoneNumber");
