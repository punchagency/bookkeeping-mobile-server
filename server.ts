import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { inject, injectable } from "tsyringe";
import "reflect-metadata";

import AiRoute from "./features/ai/route";
import BaseRoute from "./features/base/route";
import AuthRoute from "./features/auth/route";
import BankRoute from "./features/bank/route";
import MxUserRoute from "./features/mx-user/route";
import SettingsRoute from "./features/settings/route";
import ConversationRoute from "./features/conversations/route";

import {
  logger,
  corsOptions,
  EnvConfiguration,
  connectToDatabase,
  disconnectFromDatabase,
} from "./utils";
import passport from "./infrastructure/config/packages/passport";
import { useErrorHandler, useNotFound } from "./infrastructure/middlewares/";

@injectable()
export default class Server {
  private readonly _apiVersion = "/v1";

  private readonly _aiRoute: AiRoute;
  private readonly _baseRoute: BaseRoute;
  private readonly _authRoute: AuthRoute;
  private readonly _bankRoute: BankRoute;
  private readonly _mxUserRoute: MxUserRoute;
  private readonly _settingsRoute: SettingsRoute;
  private readonly _conversationRoute: ConversationRoute;

  private readonly _app: express.Application;
  private readonly _envConfig: EnvConfiguration;

  constructor(
    @inject(AiRoute.name) aiRoute: AiRoute,
    @inject(BaseRoute.name) baseRoute: BaseRoute,
    @inject(AuthRoute.name) authRoute: AuthRoute,
    @inject(BankRoute.name) bankRoute: BankRoute,
    @inject(MxUserRoute.name) mxUserRoute: MxUserRoute,
    @inject(SettingsRoute.name) settingsRoute: SettingsRoute,
    @inject(ConversationRoute.name) conversationRoute: ConversationRoute,
    @inject(EnvConfiguration.name) envConfiguration: EnvConfiguration
  ) {
    dotenv.config();
    this._aiRoute = aiRoute;
    this._baseRoute = baseRoute;
    this._authRoute = authRoute;
    this._bankRoute = bankRoute;
    this._mxUserRoute = mxUserRoute;
    this._settingsRoute = settingsRoute;
    this._envConfig = envConfiguration;
    this._conversationRoute = conversationRoute;

    this._app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares() {
    this._app.use(cors(corsOptions));
    this._app.use(cookieParser());
    this._app.use(bodyParser.json());
    this._app.use(passport.initialize());
    this._app.use(morgan("dev"));
    this._app.use(helmet());
    this._app.use(bodyParser.urlencoded({ extended: true }));
  }

  private setupRoutes() {
    this._app.use(`${this._apiVersion}/`, this._baseRoute.router);
    this._app.use(`${this._apiVersion}/auth`, this._authRoute.router);
    this._app.use(`${this._apiVersion}/bank`, this._bankRoute.router);
    this._app.use(`${this._apiVersion}/mx-user`, this._mxUserRoute.router);
    this._app.use(`${this._apiVersion}/ai`, this._aiRoute.router);
    this._app.use(`${this._apiVersion}/settings`, this._settingsRoute.router);
    this._app.use(
      `${this._apiVersion}/conversations`,
      this._conversationRoute.router
    );
  }

  private setupErrorHandling() {
    this._app.use(useErrorHandler);
    this._app.use(useNotFound);
  }

  public async start() {
    this.handleGracefulShutdown();
    await connectToDatabase();
    this._app.listen(this._envConfig.PORT, () => {
      logger(`Server is running on port ${this._envConfig.PORT}`);
    });
  }

  private async handleShutdown() {
    await disconnectFromDatabase();
    logger("Shutting down gracefully ...");
    process.exit(0);
  }

  public handleGracefulShutdown() {
    process.on("SIGTERM", this.handleShutdown);
    process.on("SIGINT", this.handleShutdown);
  }
}
