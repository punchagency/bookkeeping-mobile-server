import { container } from "tsyringe";

import RedisService from "./";

export const registerRedisServiceDi = () => {
  container.registerSingleton(RedisService);
};
