import { Router } from "express";
import { injectable, inject } from "tsyringe";

import BaseController from "./controller";

@injectable()
export default class BaseRoute {
  public router: Router;

  constructor(@inject(BaseController.name) baseController: BaseController) {
    this.router = Router();
    this.setupRoutes(baseController);
  }

  private setupRoutes(baseController: BaseController) {
    this.router.get("/", (req, res) => baseController.Hello(req, res));
  }
}
