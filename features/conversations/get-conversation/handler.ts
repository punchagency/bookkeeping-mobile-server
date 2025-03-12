import { Result } from "tsfluent";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "./../../../domain/entities/user";
import { getConversationSchema } from "./get-conversation.dto";
import ConversationRepository from "../../../infrastructure/repositories/conversations/conversation-repository";
import { IConversationRepository } from "./../../../infrastructure/repositories/conversations/i-conversation-repository";

@injectable()
export default class GetConversationHandler {
  private readonly _conversationRepository: IConversationRepository;

  constructor(
    @inject(ConversationRepository.name)
    conversationRepository: IConversationRepository
  ) {
    this._conversationRepository = conversationRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await getConversationSchema.validateAsync(req.body);
    const currentUser = req.user as User;

    const conversations =
      await this._conversationRepository.findConversationsByUserId(
        currentUser._id.toString()
      );

    logger(conversations);

    return Result.ok(conversations);
  }
}
