export interface ISaveCompletionsData {
  conversationId: string;
  completions: {
    role: string;
    content: string;
    timestamp: Date;
  };
}
