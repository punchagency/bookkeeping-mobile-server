import Joi from "joi";

import { AccountType } from "./../../../domain/entities/user";

const signupSchema = Joi.object({
  signupFlowToken: Joi.string().uuid().required(),
  accountType: Joi.string()
    .required()
    .valid(AccountType.BUSINESS, AccountType.PERSONAL),
  password: Joi.string().min(8).max(30).required(),
  companyName: Joi.string().when("accountType", {
    is: AccountType.BUSINESS,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  companyWebsite: Joi.string().when("accountType", {
    is: AccountType.BUSINESS,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  companyCategory: Joi.string().when("accountType", {
    is: AccountType.BUSINESS,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  businessStructure: Joi.string().when("accountType", {
    is: AccountType.BUSINESS,
    then: Joi.required(),
    otherwise: Joi.forbidden(),
  }),
  financialGoal: Joi.string().required(),
  firstName: Joi.string().when("accountType", {
    is: AccountType.PERSONAL,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
  lastName: Joi.string().when("accountType", {
    is: AccountType.PERSONAL,
    then: Joi.required(),
    otherwise: Joi.optional(),
  }),
});

export default signupSchema;
