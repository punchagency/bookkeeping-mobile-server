import Joi from "joi";
import { Types } from "mongoose";

export const editConversationSchema = Joi.object({
  title: Joi.string().required(),
});

export interface IEditConversationDto {
  title: string;
  conversationId: Types.ObjectId;
}
