import Joi from "joi";

const signupSchema = Joi.object({
  fullName: Joi.string().required().min(6).max(30),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().required(),
  password: Joi.string().min(8).max(30).required(),
  otpDeliveryMethod: Joi.string().valid("EMAIL").optional().default("EMAIL"),
});

export default signupSchema;
