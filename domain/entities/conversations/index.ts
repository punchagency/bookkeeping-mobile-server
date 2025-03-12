import { Types } from "mongoose";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
  },
})
class Conversation {
  _id?: Types.ObjectId;

  @prop({ required: true })
  public userId: string;

  @prop({ required: true })
  public title: string;

  @prop({ required: true, default: [] })
  public messages: Message[];

  @prop({ required: true, default: true })
  public isActive: boolean;
}

const ConversationModel = getModelForClass(Conversation);

export { ConversationModel, Conversation, Message };
