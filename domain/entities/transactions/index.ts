import { modelOptions, prop, getModelForClass } from "@typegoose/typegoose";
import { Types } from "mongoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    collection: "transactions",
  },
})
export class Transaction {
  @prop({ required: true })
  category: string;

  @prop({ required: true })
  date: string;

  @prop({ required: true })
  status: string;

  @prop({ required: true })
  topLevelCategory: string;

  @prop({ required: true })
  type: "CREDIT" | "DEBIT";

  @prop({ required: true })
  accountId: string;

  @prop({ required: true, ref: "User" })
  userId: Types.ObjectId;

  @prop({ required: true })
  accountGuid: string;

  @prop({ required: true })
  amount: number;

  @prop({ required: true })
  currencyCode: string;

  @prop({ required: true })
  description: string;

  @prop({ required: true })
  guid: string;

  @prop({ required: true })
  transactionId: string;

  @prop({ required: true })
  isExpense: boolean;

  @prop({ required: true })
  isIncome: boolean;

  @prop({ required: false })
  memo?: string;

  @prop({ required: true })
  originalDescription: string;

  @prop({ required: true })
  memberGuid: string;

  @prop({ required: true })
  userGuid: string;

  @prop({ required: false })
  metadata?: Record<string, any>;

  @prop({ required: true, default: false })
  isDeleted: boolean;
}

const TransactionModel = getModelForClass(Transaction);
export default TransactionModel;
