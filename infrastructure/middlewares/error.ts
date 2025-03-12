import Joi from "joi";
import { container } from "tsyringe";
import { Request, Response, NextFunction } from "express";

import { logger, EnvConfiguration } from "./../../utils";
import HttpConstants from "./../../application/constants/http";
import ApiResponse from "./../../application/response/response";

const useErrorHandler = async (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const requestPath = req.path;
    const response = container.resolve(ApiResponse);
    const httpConstant = container.resolve(HttpConstants);
    const envConfig = container.resolve(EnvConfiguration);

    logger(err);

    if (err instanceof Joi.ValidationError) {
      const errors = err.details.map((error) => error.message);
      response.BadRequest(res, errors, httpConstant.BAD_REQUEST, requestPath);
      return;
    }

    response.InternalServerError(
      res,
      `${httpConstant.INTERNAL_SERVER_ERROR} ${
        envConfig.IS_PRODUCTION ? "" : err.message
      }`,
      requestPath
    );

    return;
  } catch (internalError: any) {
    next(internalError);
  }
};

export default useErrorHandler;
