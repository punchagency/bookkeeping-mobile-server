import Joi from "joi";

export const visualizeTransactionsDto = Joi.object({
  query: Joi.string().required(),
});
