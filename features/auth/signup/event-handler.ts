import { container } from "tsyringe";

import signupEventEmitter from "./event";
import { ISignupEvent, SIGNUP_EVENT } from "./event.dto";
import { logger, EnvConfiguration } from "../../../utils";
import TwilioService from "../../../infrastructure/config/packages/twilio/";
import SendgridService from "../../../infrastructure/config/packages/sendgrid";

const envConfiguration = container.resolve(EnvConfiguration);
const twilioService = container.resolve(TwilioService);
const sendgridService = container.resolve(SendgridService);
signupEventEmitter.on(SIGNUP_EVENT, async (data: ISignupEvent) => {
  try {
    logger("Handling signup event", data);
    const { fullName, otp, email, phoneNumber, otpDeliveryMethod } = data;

    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Verify Your Account</h1>
        <p>Hi ${fullName},</p>
        <p>Thank you for creating an account with us. Please use the following OTP to verify your account:</p>
        <div style="text-align: center; padding: 20px;">
          <h2 style="letter-spacing: 5px; font-size: 32px; color: #4F46E5;">${otp}</h2>
        </div>
        <p>This OTP will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Bookkeeping Team</p>
      </div>
    `;

    logger(phoneNumber);

    const smsBody = `
      Your OTP is ${otp}
    `;

    if (otpDeliveryMethod === "EMAIL") {
      await sendgridService.sendEmail(
        email,
        "Verify Your Account - Bookkeeping",
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
      `OTP sent to ${otpDeliveryMethod} ${
        otpDeliveryMethod === "EMAIL" ? email : phoneNumber
      }`
    );
  } catch (error) {
    logger("Error sending OTP:", error);
  }
});

logger("Signup event handler registered");
