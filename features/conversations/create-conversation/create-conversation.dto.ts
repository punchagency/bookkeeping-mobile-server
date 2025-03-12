import Joi from "joi";

export const createConversationSchema = Joi.object({
  messages: Joi.array().items(
    Joi.object({
      role: Joi.string().valid("user", "ai").required(),
      content: Joi.string().required(),
      timestamp: Joi.date().required(),
    })
  ).required(),
});



export interface IMessage {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}