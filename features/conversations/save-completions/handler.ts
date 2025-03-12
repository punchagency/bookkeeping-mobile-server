import { Types } from "mongoose";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { ISaveCompletionsData } from "./types";
import { User } from "./../../../domain/entities/user";
import { saveCompletionsSchema } from "./save-completions.dto";
import ConversationRepository from "./../../../infrastructure/repositories/conversations/conversation-repository";

@injectable()
export default class SaveCompletionsHandler {
  private readonly _conversationRepository: ConversationRepository;

  constructor(
    @inject(ConversationRepository.name)
    conversationRepository: ConversationRepository
  ) {
    this._conversationRepository = conversationRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await saveCompletionsSchema.validateAsync(req.body);

    return this.saveCompletions(values, req);
  }

  private async saveCompletions(data: ISaveCompletionsData, req: Request) {
    const {
      conversationId,
      completions: { role, content, timestamp },
    } = data;
    const validConversations = await this._conversationRepository.findById(
      conversationId as unknown as Types.ObjectId
    );

    if (!validConversations) {
      return Result.fail("Conversation with given id not found").withMetadata({
        context: {
          statusCode: 404,
        },
      });
    }

    const currentUser = req.user as User;

    if (validConversations.userId.toString() !== currentUser._id.toString()) {
      return Result.fail(
        "You are not allowed to save completions for this conversation"
      ).withMetadata({
        context: {
          statusCode: 403,
        },
      });
    }

    validConversations.messages.push({
      role: role as "user" | "ai",
      content,
      timestamp,
    });

    await this._conversationRepository.update(
      validConversations._id,
      validConversations
    );

    return Result.ok();
  }
}
