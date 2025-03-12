import { OpenAI } from "openai";
import { inject, injectable } from "tsyringe";

import {
  EnvConfiguration,
  formatTransactionsToMarkdown,
} from "./../../../../utils";
import { IMessage } from "./../../../../features/conversations/create-conversation/create-conversation.dto";

@injectable()
export default class OpenAiClient {
  private readonly _envConfiguration: EnvConfiguration;
  public readonly client: OpenAI;

  constructor(
    @inject(EnvConfiguration.name) envConfiguration: EnvConfiguration
  ) {
    this._envConfiguration = envConfiguration;
    this.client = new OpenAI({
      apiKey: this._envConfiguration.OPENAI_API_KEY,
    });
  }

  public async generateConversationTitle(messages: IMessage[]) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates brief, relevant titles for conversations. The title should be concise (2-6 words) and capture the main topic or purpose of the conversation.",
        },
        {
          role: "user",
          content: `Please generate a title for the following conversation. Respond with a JSON object containing a single "title" field:\n\n${messages
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n")}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("Failed to generate conversation title");
    }

    try {
      const parsedResponse = JSON.parse(response.choices[0].message.content);
      return parsedResponse.title as string;
    } catch (error) {
      throw new Error("Failed to parse conversation title response");
    }
  }

  public async createEmbedding(input: string) {
    const response = await this.client.embeddings.create({
      model: "text-embedding-3-small",
      input: inject.toString(),
    });

    return response.data[0].embedding;
  }
}
