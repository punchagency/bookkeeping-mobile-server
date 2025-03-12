import { container } from "tsyringe";

import ConversationRoute from "./route";
import { ConversationController } from "./controller";
import GetCompletionsHandler from "./get-completions/handler";
import GetConversationHandler from "./get-conversation/handler";
import SaveCompletionsHandler from "./save-completions/handler";
import SuggestQuestionsHandler from "./suggest-questions/handler";
import EditConversationHandler from "./edit-conversation/handler";
import DeleteConversationHandler from "./delete-conversation/handler";
import CreateConversationHandler from "./create-conversation/handler";

export const registerConversationsDi = () => {
  container.register<ConversationController>(ConversationController.name, {
    useClass: ConversationController,
  });

  container.register<ConversationRoute>(ConversationRoute.name, {
    useClass: ConversationRoute,
  });

  container.register<CreateConversationHandler>(
    CreateConversationHandler.name,
    {
      useClass: CreateConversationHandler,
    }
  );

  container.register<GetConversationHandler>(GetConversationHandler.name, {
    useClass: GetConversationHandler,
  });

  container.register<EditConversationHandler>(EditConversationHandler.name, {
    useClass: EditConversationHandler,
  });

  container.register<SuggestQuestionsHandler>(SuggestQuestionsHandler.name, {
    useClass: SuggestQuestionsHandler,
  });

  container.register<GetCompletionsHandler>(GetCompletionsHandler.name, {
    useClass: GetCompletionsHandler,
  });

  container.register<SaveCompletionsHandler>(SaveCompletionsHandler.name, {
    useClass: SaveCompletionsHandler,
  });

  container.register<DeleteConversationHandler>(
    DeleteConversationHandler.name,
    {
      useClass: DeleteConversationHandler,
    }
  );
};
