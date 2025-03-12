import Joi from "joi";

export const suggestQuestionsSchema = Joi.object({
  id: Joi.string().required(),
});
