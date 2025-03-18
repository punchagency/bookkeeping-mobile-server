import { container } from "tsyringe";

import forgotPasswordEventEmitter from "./event";
import { logger, EnvConfiguration } from "../../../utils";
import { IForgotPasswordEvent, FORGOT_PASSWORD_EVENT } from "./event.dto";
import SendgridService from "./../../../infrastructure/config/packages/sendgrid";
import TwilioService from "../../../infrastructure/config/packages/twilio/";

const envConfiguration = container.resolve(EnvConfiguration);
const twilioService = container.resolve(TwilioService);
const sendgridService = container.resolve(SendgridService);

forgotPasswordEventEmitter.on(
  FORGOT_PASSWORD_EVENT,
  async (data: IForgotPasswordEvent) => {
    try {
      logger("Handling forgot password event", data);

      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        otp,
        otpDeliveryMethod,
      } = data;

      const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Forgot Password</h1>
        <p>Hi ${firstName + " " + lastName},</p>
        <p>You requested to reset your password. Please use the OTP below to reset your password.</p>
        <div style="text-align: center; padding: 20px;">
          <h2 style="letter-spacing: 5px; font-size: 32px; color: #4F46E5;">${otp}</h2>
        </div>
        <p>This OTP will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Bookkeeping Team</p>
      </div>
    `;

      const smsBody = `
      Your password reset OTP is ${otp}
    `;

      if (otpDeliveryMethod === "EMAIL") {
        await sendgridService.sendEmail(
          email,
          "Forgot Password Request - Bookeeping",
          emailBody
        );
      } else {
        await twilioService.client.messages.create({
          body: smsBody,
          from: envConfiguration.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });
      }

      logger(
        `Forgot password OTP sent to ${otpDeliveryMethod} ${
          otpDeliveryMethod === "EMAIL" ? email : phoneNumber
        }`
      );
    } catch (error: any) {
      logger("Error handling forgot password event", error);
    }
  }
);

logger("Forgot password event handler registered");
