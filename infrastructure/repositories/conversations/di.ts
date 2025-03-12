import { container } from "tsyringe";
import ConversationRepository from "./conversation-repository";

export const registerConversationRepositoryDi = () => {
  container.register<ConversationRepository>(ConversationRepository.name, {
    useClass: ConversationRepository,
  });
};
