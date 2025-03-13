import Joi from "joi";

import { AccountType } from "./../../../domain/entities/user";

const signupSchema = Joi.object({
  signupFlowToken: Joi.string().uuid().required(),
  accountType: Joi.string()
    .required()
    .valid(AccountType.BUSINESS, AccountType.PERSONAL),
  companyName: Joi.string().optional(),
  companyWebsite: Joi.string().optional(),
  companyCategory: Joi.string().optional(),
  businessStructure: Joi.string().optional(),
  password: Joi.string().min(8).max(30).required(),
});

export default signupSchema;
