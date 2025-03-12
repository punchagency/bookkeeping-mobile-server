import EventEmitter from "events";
import { logger } from "../../../utils";

const initiateSignupOtpEventEmitter = new EventEmitter();

logger("Initialize signup otp event emitter initialized");

export default initiateSignupOtpEventEmitter;
