import { container } from "tsyringe";

import MxClient from "./index";

export const registerMxClientDi = () => {
  container.register(MxClient.name, {
    useClass: MxClient,
  });
};
