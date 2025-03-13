import Joi from "joi";

export const updateSettingsSchema = Joi.object({
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
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
  firstName: string;
  lastName: string;
  voice: string;
}
