import dotenv from "dotenv";
import process from "process";
import { container, singleton } from "tsyringe";

dotenv.config();
@singleton()
export class EnvConfiguration {
  public readonly IS_PRODUCTION = process.env.NODE_ENV === "production";
  public readonly PORT: number = parseInt(process.env.PORT || "2800", 10);
  public readonly JWT_SECRET = process.env.JWT_SECRET;
  public readonly JWT_ISSUER = process.env.JWT_ISSUER;
  public readonly JWT_AUDIENCE = process.env.JWT_AUDIENCE;
  public readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
  public readonly MX_CLIENT_ID = process.env.MX_CLIENT_ID;
  public readonly MX_API_KEY = process.env.MX_API_KEY;
  public readonly MONGODB_URL = process.env.MONGODB_URL;
  public readonly SEEDED_ACCOUNT_EMAIL = process.env.SEEDED_ACCOUNT_EMAIL;
  public readonly SEEDED_ACCOUNT_PASSWORD = process.env.SEEDED_ACCOUNT_PASSWORD;
  public readonly OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  public readonly FROM_EMAIL_ADDRESS = process.env.FROM_EMAIL_ADDRESS;
  public readonly SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
  public readonly TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
  public readonly TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
  public readonly TWILIO_PHONE_NUMBER = process.env
    .TWILIO_PHONE_NUMBER as string;
  public readonly PINECONE_API_KEY = process.env.PINECONE_API_KEY;
  public readonly REDIS_HOST = process.env.REDIS_HOST;
  public readonly REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
  public readonly PINECONE_INDEX_NAME =
    process.env.PINECONE_INDEX_NAME || "mx-project";
}

export const registerEnvConfigDi = () => {
  container.register(EnvConfiguration.name, { useClass: EnvConfiguration });
};
