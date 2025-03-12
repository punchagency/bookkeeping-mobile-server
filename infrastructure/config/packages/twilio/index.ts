import twilio from "twilio";
import { injectable } from "tsyringe";

@injectable()
export default class TwilioClient {
  public readonly client: twilio.Twilio;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  }
}
