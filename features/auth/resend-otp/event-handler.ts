import { container } from "tsyringe";

import resendOtpEventEmitter from "./event";
import { resendOtpContext } from "./resend-otp.dto";
import { logger, EnvConfiguration } from "../../../utils";
import { IResendOtpEvent, RESEND_OTP_EVENT } from "./event.dto";
import SendgridService from "./../../../infrastructure/config/packages/sendgrid";
import TwilioService from "../../../infrastructure/config/packages/twilio/";

const twilioService = container.resolve(TwilioService);
const envConfiguration = container.resolve(EnvConfiguration);
const sendgridService = container.resolve(SendgridService);

resendOtpEventEmitter.on(RESEND_OTP_EVENT, async (data: IResendOtpEvent) => {
  try {
    logger("Handling resend OTP event", data);
    const {
      firstName,
      lastName,
      otp,
      email,
      phoneNumber,
      otpDeliveryMethod,
      context,
    } = data;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Your New OTP Code</h1>
        <p>Hi ${
          context === resendOtpContext.INITIATE_SIGNUP
            ? email
            : firstName + " " + lastName
        },</p>
        <p>You requested a new OTP code.</p>
        <div style="text-align: center; padding: 20px;">
          <h2 style="letter-spacing: 5px; font-size: 32px; color: #4F46E5;">${otp}</h2>
        </div>
        <p>This OTP will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Bookkeeping Team</p>
      </div>
    `;

    const smsBody = `
      Your OTP is ${otp}
    `;

    if (otpDeliveryMethod === "EMAIL") {
      await sendgridService.sendEmail(
        email,
        "Your New OTP Code - Bookkeeping",
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
      `New OTP sent to ${otpDeliveryMethod} ${
        otpDeliveryMethod === "EMAIL" ? email : phoneNumber
      }`
    );
  } catch (error: any) {
    logger("Error sending OTP:", error);
  }
});

logger("Resend OTP event handler registered");
