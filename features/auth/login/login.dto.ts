import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string().email(),
  phoneNumber: Joi.string(),
  password: Joi.string().required(),
}).xor("email", "phoneNumber");

export default loginSchema;
