import { z } from "zod";
import { Result } from "tsfluent";
import { openai } from "@ai-sdk/openai";
import { embed, generateObject } from "ai";
import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "../../../domain/entities/user";
import { suggestQuestionsSchema } from "./suggest-questions.dto";
import { Message } from "../../../domain/entities/conversations";
import RedisService from "./../../../infrastructure/services/redis";
import {
  IPromptConversation,
  IQuestionSuggestion,
  IResultMetadataContext,
} from "./type";
import ConversationRepository from "./../../../infrastructure/repositories/conversations/conversation-repository";

@injectable()
export default class SuggestQuestionsHandler {
  private readonly _redisService: RedisService;
  private readonly _conversationRepository: ConversationRepository;
  constructor(
    @inject(RedisService) redisService: RedisService,
    @inject(ConversationRepository)
    conversationRepository: ConversationRepository
  ) {
    this._redisService = redisService;
    this._conversationRepository = conversationRepository;
  }

  public async handle(req: Request, res: Response) {
    const values = await suggestQuestionsSchema.validateAsync(req.params);
    const currentUser = req.user as User;

    const conversations =
      await this._conversationRepository.findUserConversation(
        currentUser._id.toString(),
        values.id as string
      );

    if (!conversations) {
      return Result.fail<IResultMetadataContext>(
        "Conversations not found"
      ).withMetadata({
        context: {
          statusCode: 404,
        },
      });
    }

    const questionsResult = await this.suggestQuestions(
      conversations._id.toString(),
      conversations.messages
    );

    if (!questionsResult.isSuccess) {
      return Result.fail("Failed to suggest questions");
    }

    return Result.ok(questionsResult.value);
  }

  private async suggestQuestions(
    conversationId: string,
    conversations: Message[]
  ) {
    const cachedQuestions = await this.getCachedQuestions(conversationId);

    if (cachedQuestions) {
      logger(`Returning cached questions for conversation ${conversationId}`);
      return Result.ok(cachedQuestions);
    }

    logger(`Cached questions not found for conversation ${conversationId}`);

    logger(`Generating questions for conversation ${conversationId}`);

    const conversationsWithoutTimestamp = conversations.map((c) => ({
      role: c.role,
      content: c.content,
    }));

    const suggestionPrompt = await this.generatePrompt(
      conversationsWithoutTimestamp
    );

    const suggestionsParams = await generateObject({
      model: openai("gpt-4o-mini", {
        structuredOutputs: true,
      }),

      schemaName: "SuggestionParams",
      schemaDescription:
        "SuggestionParams is a schema that defines the parameters for the suggestion questions",
      schema: z.object({
        categories: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            questions: z.array(
              z.object({
                id: z.string(),
                question: z.string(),
                relevance: z.number(),
                context: z.string(),
              })
            ),
          })
        ),
      }),
      prompt: suggestionPrompt,
    });

    const categories = suggestionsParams.object.categories;

    await this.setCachedQuestions(
      conversationId,
      categories as IQuestionSuggestion[]
    );

    return Result.ok(categories as IQuestionSuggestion[]);
  }

  private async generatePrompt(conversation: IPromptConversation[]) {
    return `
      Analyze the following conversation and generate follow-up questions **only within the financial domain**.

      [CONVERSATION]
      ${conversation.map((c) => `${c.role}: ${c.content}`).join("\n")}
      [/CONVERSATION]

      Generate questions in this JSON format:

      {
          "categories": [
              {
                  "name": "string",
                  "description": "string",
                  "questions": [
                      {
                          "id": "string",
                          "question": "string",
                          "relevance": number (50-100),
                          "context": "string"
                      }
                  ]
              }
          ]
      }

      **Guidelines for Generating Questions:**
      - Only generate questions relevant to these two financial domains:
        1. **Querying Transactions** (e.g., filtering transactions by date, amount, category).
        2. **Data Visualizations** (e.g., representing financial data in charts).
      
      - Do **not** generate questions outside these topics.
      - Write questions in a user-friendly and query-friendly way.
      - Ensure questions match the financial intent of the conversation.

      **Example Questions (Good vs. Bad):**

      ✅ **Good (Relevant to Transactions & Data Visualization)**  
      - "Can you show me my expenses for the last 3 months?"  
      - "How much have I spent on groceries this year?"  
      - "Visualize my spending habits as a pie chart."  
      - "Show my highest transaction in February."  
      - "Compare my income and expenses in a bar chart."  

      ❌ **Bad (Not Related to Finance)**  
      - "Can you repeat that?" ❌ *(Not financial-related)*  
      - "What do you mean by that?" ❌ *(General conversation question)*  
      - "How does AI understand my messages?" ❌ *(Not useful for finance queries)*  
      - "Can you tell me about the weather?" ❌ *(Not financial-related)*  

      **Rules for Output:**
      - 3-5 highly relevant questions per category.
      - Maximum of 6 categories.
      - Questions must be **clear, specific, and directly related to transactions or financial data visualization**.
      - Return **valid JSON only**.
  `;
  }

  private async getCachedQuestions(conversationId: string) {
    logger(`Getting cached questions for conversation ${conversationId}`);
    const cachedQuestions = await this._redisService.get(
      `conversation:${conversationId}:questions`
    );

    return cachedQuestions as IQuestionSuggestion[];
  }

  private async setCachedQuestions(
    conversationId: string,
    questions: IQuestionSuggestion[]
  ) {
    logger(`Caching questions for conversation ${conversationId}`);
    await this._redisService.set(
      `conversation:${conversationId}:questions`,
      questions,
      60 * 60 // /1 hour
    );
  }
}
