import Joi from "joi";

export const createMxUserSchema = Joi.object({
  email: Joi.string().email().required(),
  isDisabled: Joi.boolean().default(false),
  metadata: Joi.optional(),
});



export interface ICreateMxUser {
  email: string;
  isDisabled: boolean;
  metadata: string;
}
