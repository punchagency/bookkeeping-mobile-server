import Joi from "joi";

export const saveCompletionsSchema = Joi.object({
  conversationId: Joi.string().required(),
  completions: Joi.object({
    role: Joi.string().valid("ai", "user").required(),
    content: Joi.string().required(),
    timestamp: Joi.date().required(),
  }).required(),
});
