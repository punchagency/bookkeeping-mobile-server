import Joi from "joi";

export const getTransactionsSchema = Joi.object({
  perPage: Joi.number().optional(),
  currentPage: Joi.number().optional(),

  /**
   * This will allow us get total expenses for a given time range.
   * It will be used to calculate the total expenses for the selected time range.
   * I don't want to make it a seperate API call because expenses are part of the transactions.
   */
  days: Joi.string().optional().valid("30", "60", "90", "all"),
});
