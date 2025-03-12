import { container } from "tsyringe";

import TwilioClient from "./index";

export const registerTwilioDi = () => {
  container.register(TwilioClient.name, { useClass: TwilioClient });
};
