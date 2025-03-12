import { Result } from "tsfluent";
import { Types } from "mongoose";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { User } from "./../../../domain/entities/user";
import { deleteConversationSchema } from "./delete-conversation.dto";
import ConversationRepository from "../../../infrastructure/repositories/conversations/conversation-repository";

@injectable()
export default class DeleteConversationHandler {
  private readonly _conversationRepository: ConversationRepository;

  constructor(
    @inject(ConversationRepository.name)
    conversationRepository: ConversationRepository
  ) {
    this._conversationRepository = conversationRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await deleteConversationSchema.validateAsync(req.params);

    return this.deleteConversation(values.id as string, req);
  }

  private async deleteConversation(conversationId: string, req: Request) {
    const conversationExits = await this._conversationRepository.findById(
      conversationId as unknown as Types.ObjectId
    );

    const currentUser = req.user as User;

    if (!conversationExits) {
      return Result.fail(
        "Conversation with given id does not exist"
      ).withMetadata({
        context: {
          statusCode: 404,
        },
      });
    }

    if (conversationExits.userId.toString() !== currentUser._id.toString()) {
      return Result.fail(
        "You are not allowed to delete this conversation"
      ).withMetadata({
        context: {
          statusCode: 403,
        },
      });
    }

    await this._conversationRepository.delete(
      conversationId as unknown as Types.ObjectId
    );

    return Result.ok("Conversation deleted successfully");
  }
}
