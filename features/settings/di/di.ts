import { container } from "tsyringe";

import SettingsRoute from "../route";
import SettingsController from "../controller";
import GetSettingsHandler from "../get-settings/handler";
import UpdateSettingsHandler from "../update-settings/handler";

export const registerSettingsDi = () => {
  container.register<SettingsController>(SettingsController.name, {
    useClass: SettingsController,
  });

  container.register<SettingsRoute>(SettingsRoute.name, {
    useClass: SettingsRoute,
  });

  container.register<UpdateSettingsHandler>(UpdateSettingsHandler.name, {
    useClass: UpdateSettingsHandler,
  });

  container.register<GetSettingsHandler>(GetSettingsHandler.name, {
    useClass: GetSettingsHandler,
  });
};
