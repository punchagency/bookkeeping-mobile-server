import { Redis } from "ioredis";
import { inject, singleton } from "tsyringe";

import { EnvConfiguration, logger } from "./../../../utils";

@singleton()
export default class RedisService {
  public readonly client: Redis;
  private readonly _envConfiguration: EnvConfiguration;

  constructor(
    @inject(EnvConfiguration.name) envConfiguration: EnvConfiguration
  ) {
    this._envConfiguration = envConfiguration;
    this.client = this._envConfiguration.IS_PRODUCTION ? new Redis(this._envConfiguration.REDIS_HOST) : new Redis({
      port: this._envConfiguration.REDIS_PORT,
      host: this._envConfiguration.REDIS_HOST,
    });

    this.client.on("error", (error) => {
      logger(`Redis error: ${error}`);
    });

    logger("Redis connection successful");
  }

  async set<T>(key: string, value: T, ttl?: number) {
    const stringValues =
      typeof value === "string" ? value : JSON.stringify(value);

    if (ttl) {
      await this.client.set(key, stringValues, "EX", ttl);
    } else {
      await this.client.set(key, stringValues);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (data === null) return null;

    try {
      return JSON.parse(data) as T;
    } catch {
      return data as T;
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    return (await this.client.exists(key)) === 1;
  }

  getRedisConnection() {
    return this.client;
  }
}
