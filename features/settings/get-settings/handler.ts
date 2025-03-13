import { Result } from "tsfluent";
import { injectable, inject } from "tsyringe";
import { Request, Response } from "express";

import { User } from "./../../../domain/entities/user";
import { UserRepository } from "../../../infrastructure/repositories/user/user-repository";
import { IUserRepository } from "./../../../infrastructure/repositories/user/i-user-repository";
import { SettingsRepository } from "../../../infrastructure/repositories/settings/settings-repository";
import { ISettingsRepository } from "../../../infrastructure/repositories/settings/i-settings-repository";

@injectable()
export default class GetSettingsHandler {
  private readonly _userRepository: IUserRepository;
  private readonly _settingsRepository: ISettingsRepository;

  constructor(
    @inject(SettingsRepository.name) settingsRepository: ISettingsRepository,
    @inject(UserRepository.name) userRepository: IUserRepository
  ) {
    this._settingsRepository = settingsRepository;
    this._userRepository = userRepository;
  }

  public async handle(req: Request, res: Response) {
    const currentUser = req.user as User;

    const settings = await this._settingsRepository.findSettingsByUserId(
      currentUser._id.toString()
    );

    const defaultVoice = "verse";

    const user = await this._userRepository.findById(
      currentUser._id.toString()
    );

    return Result.ok({
      voice: settings?.voice || defaultVoice,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: `https://api.dicebear.com/9.x/micah/svg?seed=${user.firstName}`,
    });
  }
}
