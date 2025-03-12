import { IRepository } from "../i-repository";
import { Settings } from "../../../domain/entities/settings";

export interface ISettingsRepository extends IRepository<Settings> {
  findSettingsByUserId(userId: string): Promise<Settings | null>;
}
