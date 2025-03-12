import { container } from "tsyringe";

import SendgridService from "./";

export const registerSendgridServiceDi = () => {
  container.register(SendgridService.name, {
    useClass: SendgridService,
  });
};
