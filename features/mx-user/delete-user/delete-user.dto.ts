import Joi from "joi";

export const deleteMxUserSchema = Joi.object({
  userId: Joi.string().required(),
});

export interface IDeleteMxUser {
  userId: string;
}
