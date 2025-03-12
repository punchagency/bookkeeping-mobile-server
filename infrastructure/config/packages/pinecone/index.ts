import { inject, injectable } from "tsyringe";
import { Pinecone } from "@pinecone-database/pinecone";

import { EnvConfiguration } from "./../../../../utils";

@injectable()
export default class PineconeClient {
  private readonly _envConfiguration: EnvConfiguration;
  public readonly client: Pinecone;

  constructor(
    @inject(EnvConfiguration.name) envConfiguration: EnvConfiguration
  ) {
    this._envConfiguration = envConfiguration;
    this.client = new Pinecone({
      apiKey: this._envConfiguration.PINECONE_API_KEY,
    });
  }
}
