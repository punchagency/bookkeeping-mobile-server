import { inject, injectable } from "tsyringe";
import sgMail from "@sendgrid/mail";

import { Result } from "./../../../../application/result";
import { EnvConfiguration, logger } from "./../../../../utils";
@injectable()
export default class SendgridService {
  private readonly _envConfig: EnvConfiguration;
  private readonly _fromEmailAddress: string;
  private readonly _sendgridApiKey: string;

  constructor(@inject(EnvConfiguration) envConfig: EnvConfiguration) {
    this._envConfig = envConfig;
    this._fromEmailAddress = this._envConfig.FROM_EMAIL_ADDRESS;
    this._sendgridApiKey = this._envConfig.SENDGRID_API_KEY;
    sgMail.setApiKey(this._sendgridApiKey);
  }

  public async sendEmail(to: string, subject: string, content: string) {
    const msg = {
      to: to,
      from: this._fromEmailAddress,
      subject: subject,
      html: content,
    };

    try {
      await sgMail.send(msg);
      return Result.Ok();
    } catch (error: any) {
      logger(error);
      return Result.Fail([{ message: "An error occured while sending email" }]);
    }
  }
}
