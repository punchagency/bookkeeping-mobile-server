import mongoose from "mongoose";
import { container } from "tsyringe";

import { logger } from "./index";
import { EnvConfiguration } from "./env-config";

export const connectToDatabase = async (): Promise<void> => {
  try {
    const envConfig = container.resolve(EnvConfiguration);
    logger(`Connecting to MongoDB at: ${envConfig.MONGODB_URL}`);
    await mongoose.connect(envConfig.MONGODB_URL);
    logger("Connected to MongoDB successfully");
  } catch (error) {
    logger("MongoDB connection error:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger("Disconnected from MongoDB successfully");
  } catch (error) {
    logger("MongoDB disconnection error:", error);
    throw error;
  }
};
