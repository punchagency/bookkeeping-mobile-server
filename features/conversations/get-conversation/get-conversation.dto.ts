import Joi from "joi";

export const getConversationSchema = Joi.object({
  skip: Joi.number().optional().default(0),
  take: Joi.number().optional().default(10),
  conversationId: Joi.string().optional(),
});
