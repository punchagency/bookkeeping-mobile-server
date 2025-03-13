import { Types } from "mongoose";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

export enum VerificationMethod {
  EMAIL = "EMAIL",
  PHONE = "PHONE_NUMBER",
}

export enum AccountType {
  BUSINESS = "BUSINESS",
  PERSONAL = "PERSONAL",
}

@modelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
  },
})
class User {
  _id?: Types.ObjectId;

  @prop({ required: false, select: true, default: null })
  public firstName: string;

  @prop({ required: false, select: true, default: null })
  public lastName: string;

  @prop({ required: false, enum: AccountType, select: true, default: null })
  public accountType: AccountType;

  @prop({ required: false, select: true, default: null })
  public companyName?: string;

  @prop({ required: false, select: true, default: null })
  public companyWebsite?: string;

  @prop({ required: false, select: true, default: null })
  public companyCategory?: string;

  @prop({ require: false, select: true, default: null })
  public businessStructure?: string;

  @prop({ required: false, unique: true, select: true })
  public email: string;

  @prop({ required: false, unique: true, select: true })
  public phoneNumber: string;

  @prop({ required: false, select: true })
  public password: string;

  @prop({ required: true, default: false, select: true })
  public isVerified: boolean; /**Phone number or email verification will determine this */

  @prop({ required: false, enum: VerificationMethod, select: false })
  public verificationMethod: VerificationMethod;

  @prop({ required: false, default: false, select: true })
  public isEmailVerified: boolean;

  @prop({ required: false, default: false, select: true })
  public isPhoneVerified: boolean;

  @prop({ required: false, select: true, default: null })
  public financialGoal: string;

  @prop({ type: () => [Object], default: [], select: true })
  public mxUsers: Array<{
    id: string;
    mxUserId: string;
    memberId?: string;
    email: string;
    isDisabled: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
  }>;
}

const UserModel = getModelForClass(User);

export { UserModel, User };
