import { Result } from "tsfluent";
import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import { logger } from "./../../../utils";
import { User } from "./../../../domain/entities/user";
import MxClient from "./../../../infrastructure/config/packages/mx";

@injectable()
export default class ConnectBankHandler {
  private readonly _mxClient: MxClient;

  constructor(@inject(MxClient.name) mxClient: MxClient) {
    this._mxClient = mxClient;
  }

  public async handle(req: Request, res: Response) {
    const currentUser = req.user as User;

    const result = await this.connectBank(currentUser.mxUsers[0].mxUserId);

    if (result.isFailure) {
      return Result.fail(result.errors);
    }

    return Result.ok(result.value);
  }

  private async connectBank(userId: string) {
    const widgetRequestBody = {
      widget_url: {
        include_transactions: true,
        is_mobile_webview: false,
        mode: "verification",
        ui_message_version: 4,
        widget_type: "connect_widget",
      },
    };

    const widgetResponse = await this._mxClient.client.requestWidgetURL(
      userId,
      widgetRequestBody
    );

    if (widgetResponse.status !== 200) {
      logger(widgetResponse.status);
      return Result.fail([{ message: "Error creating widget in MX" }]);
    }

    const { url, type, user_id } = widgetResponse.data.widget_url;

    const dataToReturn = {
      widgetUrl: url,
      widgetType: type,
      userId: user_id,
    };

    logger(dataToReturn);

    return Result.ok(dataToReturn);
  }
}
