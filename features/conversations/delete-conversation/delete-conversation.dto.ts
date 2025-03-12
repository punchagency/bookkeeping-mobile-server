import Joi from "joi";

export const deleteConversationSchema = Joi.object({
  id: Joi.string().required(),
});
