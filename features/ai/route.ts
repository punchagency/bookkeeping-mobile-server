import { Router } from "express";
import { inject, injectable } from "tsyringe";

import AiController from "./controller";
import { useAuth } from "./../../infrastructure/middlewares";

@injectable()
export default class AiRoute {
  public readonly router: Router;
  private readonly _aiController: AiController;

  constructor(@inject(AiController.name) aiController: AiController) {
    this.router = Router();
    this._aiController = aiController;

    this.registerRoutes();
  }

  public registerRoutes() {
    this.router.post("/session", [useAuth], (req, res) =>
      this._aiController.createSession(req, res)
    );

    this.router.post("/query-transactions", [useAuth], (req, res) =>
      this._aiController.queryTransactions(req, res)
    );

    this.router.post("/visualize-transactions", [useAuth], (req, res) =>
      this._aiController.visualizeTransactions(req, res)
    );
  }
}
