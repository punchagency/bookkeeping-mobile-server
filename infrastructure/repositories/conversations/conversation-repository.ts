import { injectable } from "tsyringe";

import { Repository } from "../repository";
import {
  ConversationModel,
  Conversation,
} from "../../../domain/entities/conversations";
import { IConversationRepository } from "./i-conversation-repository";

@injectable()
export default class ConversationRepository
  extends Repository<Conversation>
  implements IConversationRepository
{
  constructor() {
    super(ConversationModel);
  }

  /**
   * Find all user conversations
   * @param userId
   * @returns
   */
  async findConversationsByUserId(
    userId: string
  ): Promise<Conversation[] | null> {
    return await ConversationModel.find({
      userId,
    });
  }

  /**
   * Find conversation by user id and conversation id
   * @param userId
   * @param conversationId
   * @returns
   */
  async findUserConversation(
    userId: string,
    conversationId: string
  ): Promise<Conversation | null> {
    return await ConversationModel.findOne({
      _id: conversationId,
      userId,
    });
  }
}
