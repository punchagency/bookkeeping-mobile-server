import "reflect-metadata";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { container } from "tsyringe";

import {
  EnvConfiguration,
  logger,
  connectToDatabase,
  disconnectFromDatabase,
} from "../../../../utils";
import { User } from "../../../../domain/entities/user";
import GlobalDIConfig from "../../../config/di/global-di-config";
import MxClient from "../../../../infrastructure/config/packages/mx";
import { UserRepository } from "../../../repositories/user/user-repository";
dotenv.config();

GlobalDIConfig.registerAllServices();

export const seedDeveloperUser = async () => {
  try {
    const userRepository = container.resolve(UserRepository);
    const envConfig = container.resolve(EnvConfiguration);
    const mxClient = container.resolve(MxClient);

    const seededAccountEmail = envConfig.SEEDED_ACCOUNT_EMAIL;
    const seededAccountPassword = envConfig.SEEDED_ACCOUNT_PASSWORD;

    if (!seededAccountEmail || !seededAccountPassword) {
      throw new Error(
        "Seeded account email or password is not defined in the environment variables."
      );
    }

    const existingUser = await userRepository.findByEmail(seededAccountEmail);

    if (existingUser) {
      logger("Developer user already exists, skipping seeder...");
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(seededAccountPassword, saltRounds);

    const developerUser: Partial<User> = {
      email: seededAccountEmail,
      fullName: "Developer Account",
      password: hashedPassword,
    };

    const createdUser = await userRepository.create(developerUser as User);
    logger(`Developer user created successfully: ${createdUser.email}`);

    /**
     *
     * We can now create the mx user
     */

    const dataToSend = {
      user: {
        email: seededAccountEmail,
        id: createdUser._id.toString(),
        is_disabled: false,
      },
    };

    const createMxUserResponse = await mxClient.client.createUser(dataToSend);

    if (createMxUserResponse.status !== 200) {
      throw new Error("Error creating mx user");
    }

    const newMxUser = createMxUserResponse.data.user;

    const mxUserDetails = {
      mxUserId: createMxUserResponse.data.user.guid,
      email: seededAccountEmail,
      id: createMxUserResponse.data.user.id,
      isDisabled: false,
      metadata: null,
      createdAt: new Date(),
    };

    await userRepository.update(createdUser._id, {
      mxUsers: [...(createdUser.mxUsers || []), mxUserDetails],
    });

    logger("MX User created successfully");
  } catch (error) {
    logger("Error seeding developer user:", error);
    throw error;
  }
};

if (require.main === module) {
  connectToDatabase();
  seedDeveloperUser()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      disconnectFromDatabase();
      process.exit(1);
    });
}
