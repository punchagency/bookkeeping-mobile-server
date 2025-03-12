import { Message } from "./../../../domain/entities/conversations";

export interface IPromptConversation
  extends Partial<Omit<Message, "timestamp">> {}

export interface IResultMetadataContext {
  statusCode: number;
}

export interface IQuestionSuggestion {
  name: string;
  description: string;
  questions: IQuestion[];
}

export interface IQuestion {
  id: string;
  question: string;
  relevance: number;
  context: string;
}
