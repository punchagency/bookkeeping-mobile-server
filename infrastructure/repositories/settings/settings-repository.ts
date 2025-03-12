import { Repository } from "../repository";
import { ISettingsRepository } from "./i-settings-repository";
import { Settings, SettingsModel } from "../../../domain/entities/settings";

export class SettingsRepository
  extends Repository<Settings>
  implements ISettingsRepository
{
  constructor() {
    super(SettingsModel);
  }

  async findSettingsByUserId(userId: string): Promise<Settings | null> {
    return await SettingsModel.findOne({
      userId,
    });
  }
}
