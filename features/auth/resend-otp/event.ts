import EventEmitter from "events";
import { logger } from "../../../utils";

const resendOtpEventEmitter = new EventEmitter();

logger("Resend OTP event emitter initialized");

export default resendOtpEventEmitter;
