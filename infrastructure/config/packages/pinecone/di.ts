import { container } from "tsyringe";

import PineconeClient from "./";

export const registerPineconeClientDi = () => {
  container.register(PineconeClient.name, {
    useClass: PineconeClient,
  });
};
