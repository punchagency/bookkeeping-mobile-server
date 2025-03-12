import "reflect-metadata";
import "express-async-errors";
import { container } from "tsyringe";

import Server from "./server";
import "./infrastructure/events";
import GlobalDIConfig from "./infrastructure/config/di/global-di-config";

GlobalDIConfig.registerAllServices();

const server = container.resolve(Server);

server.start();
