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

  public async generateMongoQueryFromNaturalLanguage(query: string) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates MongoDB queries from natural language.",
        },
        {
          role: "user",
          content: `Please generate a MongoDB query for the following natural language query: ${query}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("Failed to generate MongoDB query");
    }

    try {
      const parsedResponse = JSON.parse(response.choices[0].message.content);
      return parsedResponse.query as string;
    } catch (error) {
      throw new Error("Failed to parse MongoDB query response");
    }
  }

  public async generateRedisQueryFromNaturalLanguage(query: string) {
    const response = await this.client.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that generates Redis queries from natural language.
You must generate JavaScript expressions that evaluate to true/false for filtering transactions.
Return your response as a JSON object with a 'query' field containing the JavaScript expression.

The transactions have these fields:
- isIncome: boolean (true for income transactions)
- isExpense: boolean (true for expense transactions)
- amount: number (positive number)
- description: string (transaction description)
- originalDescription: string (original transaction description)
- topLevelCategory: string (transaction category)
- date: string (YYYY-MM-DD format)
- memo: string (additional notes)

Important: Make text matching very lenient:
1. Use 'includes' instead of exact matches
2. Always use toLowerCase() for case-insensitive matching
3. Check across multiple fields (description, originalDescription, topLevelCategory, memo)
4. Use the containsInAnyField helper function for text searches
5. Handle common variations (e.g., 'bill' should match 'bills')

Common query patterns:
1. For income: "transaction.isIncome === true"
2. For expenses: "transaction.isExpense === true"
3. For amounts: "transaction.amount > X" or "transaction.amount < X"
4. For text search: "transaction.containsInAnyField('search term')"
5. For categories: "transaction.topLevelCategory.toLowerCase().includes('category')"
6. For dates: "transaction.date.startsWith('YYYY-MM')"

Examples:
Query: "Show my income"
Response: {"query": "transaction.isIncome === true"}

Query: "Show bills"
Response: {"query": "transaction.containsInAnyField('bill')"}

Query: "Show walmart transactions"
Response: {"query": "transaction.containsInAnyField('walmart')"}

Query: "Show utilities"
Response: {"query": "transaction.topLevelCategory.toLowerCase().includes('utilities') || transaction.containsInAnyField('bill')"}
`,
        },
        {
          role: "user",
          content: `Generate a Redis query JSON response for: ${query}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    if (!response.choices[0]?.message?.content) {
      throw new Error("Failed to generate Redis query");
    }

    try {
      const parsedResponse = JSON.parse(response.choices[0].message.content);
      return parsedResponse.query as string;
    } catch (error) {
      throw new Error("Failed to parse Redis query response");
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
