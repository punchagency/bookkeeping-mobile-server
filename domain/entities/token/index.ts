import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";
import { User } from "../user";
import { Types } from "mongoose";

enum TokenType {
  REFRESH_TOKEN = "refreshToken",
  OTP = "otp",
  SIGNUP_FLOW_TOKEN = "signupFlowToken",
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
  },
})
class Token {
  @prop({ ref: () => User, required: true })
  public userId: Types.ObjectId;

  @prop({ required: true, unique: true })
  public token: string;

  @prop({ required: true })
  public expiresAt: Date;

  @prop({ required: true, enum: TokenType })
  public type: TokenType;

  @prop()
  public userAgent?: string;
}

const TokenModel = getModelForClass(Token);

export { TokenModel, Token, TokenType };
