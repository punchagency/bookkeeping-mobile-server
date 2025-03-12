import { container } from "tsyringe";
import { SettingsRepository } from "./settings-repository";
import { ISettingsRepository } from "./i-settings-repository";

export const registerSettingsRepositoryDi = () => {
  container.register<ISettingsRepository>(SettingsRepository.name, {
    useClass: SettingsRepository,
  });

};
