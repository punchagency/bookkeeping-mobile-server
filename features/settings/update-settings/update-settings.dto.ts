import Joi from "joi";

export const updateSettingsSchema = Joi.object({
  fullName: Joi.string().optional(),
  voice: Joi.string()
    .optional()
    .allow(
      "alloy",
      "ash",
      "ballad",
      "coral",
      "echo",
      "sage",
      "shimmer",
      "verse"
    ),
});

export interface IUpdateSettings {
  fullName: string;
  voice: string;
}
