import { container } from "tsyringe";

import AiRoute from "./route";
import AiController from "./controller";
import SessionHandler from "./session/handler";
import QueryTransactionHandler from "./query-transactions/handler";
import VisualizeTransactionsHandler from "./visualize-transactions/handler";

export const registerAiDi = () => {
  container.register(SessionHandler.name, {
    useClass: SessionHandler,
  });

  container.register(AiRoute.name, {
    useClass: AiRoute,
  });

  container.register(AiController.name, {
    useClass: AiController,
  });

  container.register(QueryTransactionHandler.name, {
    useClass: QueryTransactionHandler,
  });

  container.register(VisualizeTransactionsHandler.name, {
    useClass: VisualizeTransactionsHandler,
  });
};
