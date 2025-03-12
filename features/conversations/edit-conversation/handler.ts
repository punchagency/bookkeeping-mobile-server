import { Result } from "tsfluent";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "../../../domain/entities/user";
import {
  IEditConversationDto,
  editConversationSchema,
} from "./edit-conversation.dto";
import ConversationRepository from "./../../../infrastructure/repositories/conversations/conversation-repository";

@injectable()
export default class EditConversationHandler {
  private readonly _conversationRepository: ConversationRepository;

  constructor(
    @inject(ConversationRepository.name)
    conversationRepository: ConversationRepository
  ) {
    this._conversationRepository = conversationRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await editConversationSchema.validateAsync(req.body);

    const dataToSend = {
      ...values,
      conversationId: req.params.id,
    };

    return this.editConversation(dataToSend as IEditConversationDto, req);
  }

  private async editConversation(data: IEditConversationDto, req: Request) {
    const conversation = await this._conversationRepository.findById(
      data.conversationId
    );

    const user = req.user as User;

    if (!conversation) {
      return Result.fail("Conversation with given id not found").withMetadata({
        context: {
          statusCode: 404,
        },
      });
    }

    if (conversation.userId.toString() !== user._id.toString()) {
      return Result.fail(
        "You are not allowed to edit this conversation"
      ).withMetadata({
        context: {
          statusCode: 403,
        },
      });
    }

    conversation.title = data.title;

    await this._conversationRepository.update(conversation._id, conversation);

    return Result.ok(conversation);
  }
}
