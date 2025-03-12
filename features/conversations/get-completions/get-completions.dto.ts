import Joi from "joi";

export const getCompletionsDto = Joi.object({
  message: Joi.string().required(),
});
