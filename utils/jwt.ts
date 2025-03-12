import jwt from "jsonwebtoken";
import { container } from "tsyringe";
import {EnvConfiguration} from "./env-config";

const envConfig = container.resolve(EnvConfiguration);

export const generateAccessToken = (user: { id: string }) => {
  return jwt.sign({ sub: user.id }, envConfig.JWT_SECRET, {
    expiresIn: "15m",
    issuer: envConfig.JWT_ISSUER,
    audience: envConfig.JWT_AUDIENCE,
  });
};

export const generateRefreshToken = (user: { id: string }) => {
  return jwt.sign({ sub: user.id }, envConfig.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
    issuer: envConfig.JWT_ISSUER,
    audience: envConfig.JWT_AUDIENCE,
  });
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, envConfig.JWT_REFRESH_SECRET);
};
