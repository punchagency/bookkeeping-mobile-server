import { container } from "tsyringe";

import OpenAiClient from "./";

export const registerOpenAiClientDi = () => {
  container.register(OpenAiClient.name, {
    useClass: OpenAiClient,
  });
};
