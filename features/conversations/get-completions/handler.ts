import axios from "axios";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { getCompletionsDto } from "./get-completions.dto";
import {
  logger,
  getOpenaiFinanceTools,
  getOpenaiFinanceAgentPrompt,
} from "./../../../utils";
import OpenAiClient from "./../../../infrastructure/config/packages/openai";

@injectable()
export default class GetCompletionsHandler {
  private readonly _openAiClient: OpenAiClient;

  constructor(@inject(OpenAiClient.name) openAiClient: OpenAiClient) {
    this._openAiClient = openAiClient;
  }

  public async handle(req: Request, res: Response) {
    const values = await getCompletionsDto.validateAsync(req.body);

    return await this.getCompletions(values.message);
  }
  private async getCompletions(message: string) {
    const tools = getOpenaiFinanceTools().map((tool) => ({
      type: "function" as const,
      function: tool,
    }));

    const completions = await this._openAiClient.client.chat.completions.create(
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: getOpenaiFinanceAgentPrompt(),
          },
          {
            role: "user",
            content: message,
          },
        ],
        tools,
        tool_choice: "auto",
      }
    );

    logger(completions);

    /**
     * Check for tool calls
     */

    const toolCalls = completions.choices[0].message.tool_calls;

    if (toolCalls) {
      logger("Tool calls found");
      logger(toolCalls);

      const toolCall = toolCalls[0];
      const toolName = toolCall.function.name;
      const toolArgs = JSON.parse(toolCall.function.arguments);

      switch (toolName) {
        case "query_transactions":
          try {
            const response = await axios.post(
              "http://localhost:9000/finance-query",
              {
                query: toolArgs.query,
              }
            );

            const details = response.data.data;

            logger("Logging finance query details");
            logger(details);

            return Result.ok({ details, functionName: "query_transactions" });
          } catch (error: any) {
            logger(error);
            return Result.fail("An error occurred while querying transactions");
          }
        case "create_visualization":
          try {
            const response = await axios.post(
              "http://localhost:9000/visualize-transactions",
              {
                query: toolArgs.query,
              }
            );

            const details = response.data.data;

            return Result.ok({
              details,
              functionName: "create_visualization",
            });
          } catch (error: any) {
            logger(error);
            return Result.fail("An error occurred while querying transactions");
          }
      }
    }

    return Result.ok(completions.choices[0].message.content);
  }
}
