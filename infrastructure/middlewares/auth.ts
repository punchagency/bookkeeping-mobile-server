import { container } from "tsyringe";
import { Request, Response, NextFunction } from "express";

import { logger } from "../../utils";
import passport from "../config/packages/passport";
import { User } from "./../../domain/entities/user";
import ApiResponse from "../../application/response/response";

const useAuth = (req: Request, res: Response, next: NextFunction) => {
  const response = container.resolve(ApiResponse);

  passport.authenticate(
    "jwt",
    { session: false },
    (error, user: User, info) => {
      if (error) {
        logger("Authentication error:", error);
        return response.Unauthorized(res);
      }

      if (!user) {
        if (info instanceof Error) {
          if (info.name === "TokenExpiredError") {
            return response.Unauthorized(res);
          }
          if (info.name === "JsonWebTokenError") {
            return response.Unauthorized(res);
          }
        }
        return response.Unauthorized(res);
      }

      req.user = user;
      next();
    }
  )(req, res, next);
};

export default useAuth;
