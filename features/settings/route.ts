import { Router } from "express";
import { injectable, inject } from "tsyringe";

import SettingsController from "./controller";
import { useAuth } from "./../../infrastructure/middlewares";

@injectable()
export default class SettingsRoute {
  public readonly router: Router;
  private readonly _settingsController: SettingsController;

  constructor(
    @inject(SettingsController.name) settingsController: SettingsController
  ) {
    this.router = Router();
    this._settingsController = settingsController;

    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.put("/", [useAuth], (req, res) =>
      this._settingsController.updateSettings(req, res)
    );

    this.router.get("/", [useAuth], (req, res) =>
      this._settingsController.getSettings(req, res)
    );
  }
}
