import { inject, injectable } from "tsyringe";
import { Configuration, MxPlatformApi } from "mx-platform-node";

import { EnvConfiguration } from "./../../../../utils";

@injectable()
export default class MxClient {
  private readonly _configuration: Configuration;
  private readonly _envConfiguration: EnvConfiguration;
  private readonly _mxProductionApiUrl  = "https://api.mx.com";
  private readonly _mxDevelopmentApiUrl = "https://int-api.mx.com";
  public client: MxPlatformApi;

  constructor(
    @inject(EnvConfiguration.name) envConfiguration: EnvConfiguration
  ) {
    this._envConfiguration = envConfiguration;
    this._configuration = new Configuration({
      username: this._envConfiguration.MX_CLIENT_ID,
      password: this._envConfiguration.MX_API_KEY,

      basePath: this._mxDevelopmentApiUrl,

      baseOptions: {
        headers: {
          Accept: "application/vnd.mx.api.v1+json",
        },
      },
    });

    this.client = new MxPlatformApi(this._configuration);
  }
}
