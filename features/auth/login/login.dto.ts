import Joi from "joi";

const loginSchema = Joi.object({
  details: Joi.string().required(),
  password: Joi.string().required(),
  type: Joi.string().valid("EMAIL", "PHONE_NUMBER").required(),
});

export default loginSchema;
