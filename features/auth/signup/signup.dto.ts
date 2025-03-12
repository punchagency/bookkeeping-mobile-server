import Joi from "joi";

const signupSchema = Joi.object({
  fullName: Joi.string().optional().min(6).max(30),
  phoneNumber: Joi.string().optional(),
});

export default signupSchema;
