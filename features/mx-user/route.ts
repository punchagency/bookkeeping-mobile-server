import { Router } from "express";
import { inject, injectable } from "tsyringe";

import MXUserController from "./controller";
import { useAuth } from "./../../infrastructure/middlewares";

@injectable()
export default class MxUserRoute {
  public readonly router: Router;
  private readonly _mxUserController: MXUserController;

  constructor(
    @inject(MXUserController.name) mxUserController: MXUserController
  ) {
    this.router = Router();
    this._mxUserController = mxUserController;

    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post("/", [useAuth], (req, res) =>
      this._mxUserController.createUser(req, res)
    );

    this.router.delete("/:userId", [useAuth], (req, res) =>
      this._mxUserController.deleteUser(req, res)
    );

    this.router.get("/", [useAuth], (req, res) =>
      this._mxUserController.getAllUsers(req, res)
    );

    this.router.post("/statements", [useAuth], (req, res) =>
      this._mxUserController.getStatements(req, res)
    );
  }
}
