import Joi from "joi";

export const queryTransactionsDto = Joi.object({
  query: Joi.string().required(),
});

