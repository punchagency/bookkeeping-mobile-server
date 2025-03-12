import axios, { get } from "axios";
import { Result } from "tsfluent";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { User } from "./../../../domain/entities/user";
import {
  EnvConfiguration,
  logger,
  getOpenaiFinanceTools,
  getOpenaiFinanceAgentPrompt,
} from "./../../../utils";
import MxClient from "./../../../infrastructure/config/packages/mx";
import RedisService from "./../../../infrastructure/services/redis";
import PineconeClient from "./../../../infrastructure/config/packages/pinecone";
import { SettingsRepository } from "./../../../infrastructure/repositories/settings/settings-repository";
import { ISettingsRepository } from "./../../../infrastructure/repositories/settings/i-settings-repository";
@injectable()
export default class SessionHandler {
  private readonly _mxClient: MxClient;
  private readonly _redisService: RedisService;
  private readonly _pineconeClient: PineconeClient;
  private readonly _envConfiguration: EnvConfiguration;
  private readonly _settingsRepository: ISettingsRepository;

  constructor(
    @inject(MxClient) mxClient: MxClient,
    @inject(RedisService) redisService: RedisService,
    @inject(PineconeClient) pineconeClient,
    @inject(EnvConfiguration.name) envConfiguration: EnvConfiguration,
    @inject(SettingsRepository.name) settingsRepository: ISettingsRepository
  ) {
    this._mxClient = mxClient;
    this._redisService = redisService;
    this._pineconeClient = pineconeClient;
    this._envConfiguration = envConfiguration;
    this._settingsRepository = settingsRepository;
  }

  public async handle(req: Request, res: Response) {
    const currentUser = req.user as User;
    const settings = await this._settingsRepository.findSettingsByUserId(
      currentUser._id.toString()
    );

    const aiVoice = settings?.voice || "verse";

    const session = await this.createSession(req, aiVoice);
    if (session.isFailure) {
      return session;
    }

    // Add function handlers to the session response
    const sessionData = session.value;
    sessionData.functionHandlers = {
      query_transactions: async (params: { query: string }) => {
        const result = await this.queryTransactions(
          params.query,
          currentUser._id.toString()
        );
        if (result.isFailure) {
          throw new Error(result.errors[0].message);
        }
        return result.value;
      },
      create_visualization: async (params: any) => {
        // Visualization implementation will go here
        return {};
      },
    };

    return Result.ok(sessionData);
  }

  private async createSession(req: Request, aiVoice: string) {
    try {
      const tools = getOpenaiFinanceTools();

      const systemPrompt = getOpenaiFinanceAgentPrompt();

      const response = await axios.post(
        "https://api.openai.com/v1/realtime/sessions",
        {
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: aiVoice,
          instructions: systemPrompt,
          tools,
          input_audio_transcription: {
            model: "whisper-1",
            language: "en",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this._envConfiguration.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
            "OpenAI-Beta": "realtime-1.0.0",
          },
        }
      );

      if (response.data.error) {
        console.error("OpenAI Error:", response.data.error);
        return Result.fail([{ message: response.data.error.message }]);
      }

      return Result.ok(response.data);
    } catch (error: any) {
      console.error(
        "Session creation error:",
        error.response?.data || error.message
      );
      return Result.fail([{ message: "Failed to create session" }]);
    }
  }

  private async queryTransactions(query: string, userId: string) {
    try {
      // Try to get cached results first
      const cacheKey = `transactions_query:${userId}:${query}`;
      const cachedResults = await this._redisService.get<any>(cacheKey);
      if (cachedResults) {
        return Result.ok(JSON.parse(cachedResults));
      }

      // Get embeddings for the query
      const response = await axios.post(
        "https://api.openai.com/v1/embeddings",
        {
          input: query,
          model: "text-embedding-3-small",
        },
        {
          headers: {
            Authorization: `Bearer ${this._envConfiguration.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const queryEmbedding = response.data.data[0].embedding;

      // Search Pinecone for similar transactions
      const index = this._pineconeClient.client.index("transactions");
      const searchResponse = await index.query({
        vector: queryEmbedding,
        topK: 10,
        includeMetadata: true,
        filter: { userId: userId }, // Filter by userId instead of using namespace
      });

      // Format results
      const results = searchResponse.matches.map((match) => ({
        transaction: match.metadata,
        similarity: match.score,
      }));

      // Cache results for 5 minutes
      await this._redisService.set(cacheKey, JSON.stringify(results), 300);

      return Result.ok(results);
    } catch (error: any) {
      console.error("Transaction query error:", error.message);
      return Result.fail([{ message: "Failed to query transactions" }]);
    }
  }

  private async createVisualization() {
    // Implementation for visualization will go here
  }
}
