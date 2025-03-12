import Joi from "joi";

export const getStatementsSchema = Joi.object({
  page: Joi.number().optional(),
  recordsPerPage: Joi.number().optional(),
});

export interface IPageOptions {
  page: number;
  recordsPerPage: number;
}


export interface IGetStatementsErrorContext {
  statusCode: number;
}
