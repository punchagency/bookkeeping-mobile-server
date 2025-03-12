import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "./../../../domain/entities/user";
import { updateSettingsSchema } from "./update-settings.dto";
import { UserRepository } from "./../../../infrastructure/repositories/user/user-repository";
import { IUserRepository } from "./../../../infrastructure/repositories/user/i-user-repository";
import { SettingsRepository } from "../../../infrastructure/repositories/settings/settings-repository";
import { ISettingsRepository } from "../../../infrastructure/repositories/settings/i-settings-repository";

@injectable()
export default class UpdateSettingsHandler {
  private readonly _userRepository: IUserRepository;
  private readonly _settingsRepository: ISettingsRepository;

  constructor(
    @inject(UserRepository.name) userRepository: IUserRepository,
    @inject(SettingsRepository.name) settingsRepository: ISettingsRepository
  ) {
    this._userRepository = userRepository;
    this._settingsRepository = settingsRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await updateSettingsSchema.validateAsync(req.body);

    const { fullName, voice } = values;

    const currentUser = req.user as User;

    logger(currentUser);
    logger(`Updating settings for user ${currentUser._id}`);

    const updatedUser = await this._userRepository.update(currentUser._id, {
      fullName,
    });

    const settings = await this._settingsRepository.findSettingsByUserId(
      currentUser._id.toString()
    );

    let updatedSettings;
    if (!settings) {
      updatedSettings = await this._settingsRepository.create({
        voice,
        userId: currentUser._id.toString(),
      });
    } else {
      updatedSettings = await this._settingsRepository.update(settings._id, {
        voice,
      });
    }

    const response = {
      voice: updatedSettings.voice,
      fullName: updatedUser.fullName,
    };

    return Result.ok(response);
  }
}
