import Joi from "joi";

export const disconnectBankDto = Joi.object({
  memberGuid: Joi.string().required(),
});
