import { container } from "tsyringe";

import BaseRoute from "./route";
import BaseController from "./controller";

export const registerBaseDi = () => {
  container.register<BaseController>(BaseController.name, {
    useClass: BaseController,
  });
  container.register<BaseRoute>(BaseRoute.name, {
    useClass: BaseRoute,
  });
};
