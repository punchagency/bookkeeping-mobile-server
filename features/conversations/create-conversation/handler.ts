import { Result } from "tsfluent";
import { v4 as uuidv4 } from "uuid";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "../../../utils";
import { User } from "../../../domain/entities/user";
import OpenAiClient from "../../../infrastructure/config/packages/openai";
import { createConversationSchema, IMessage } from "./create-conversation.dto";
import ConversationRepository from "../../../infrastructure/repositories/conversations/conversation-repository";
import { IConversationRepository } from "./../../../infrastructure/repositories/conversations/i-conversation-repository";

@injectable()
export default class CreateConversationHandler {
  private readonly _openAiClient: OpenAiClient;
  private readonly _conversationRepository: IConversationRepository;

  constructor(
    @inject(ConversationRepository)
    conversationRepository: IConversationRepository,
    @inject(OpenAiClient)
    openAiClient: OpenAiClient
  ) {
    this._openAiClient = openAiClient;
    this._conversationRepository = conversationRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await createConversationSchema.validateAsync(req.body);
    const currentUser = req.user as User;

    logger(values);

    const messages = values.messages as IMessage[];

    const conversationTitle =
      await this._openAiClient.generateConversationTitle(messages);

    logger(conversationTitle);

    const conversations = await this._conversationRepository.create({
      userId: currentUser._id.toString(),
      messages: values.messages as IMessage[],
      title: conversationTitle,
      isActive: true,
    });

    logger(conversations);

    return Result.ok();
  }
}
