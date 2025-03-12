import { Types } from "mongoose";
import { prop, getModelForClass, modelOptions } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    versionKey: false,
  },
})
class Settings {
  _id?: Types.ObjectId;

  @prop({ required: true })
  public userId: string;

  @prop({ required: true })
  public voice: string;
}

const SettingsModel = getModelForClass(Settings);

export { SettingsModel, Settings };
