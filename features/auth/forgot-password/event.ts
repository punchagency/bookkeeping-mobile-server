import EventEmitter from "events";
import { logger } from "../../../utils";

const forgotPasswordEventEmitter = new EventEmitter();

logger("Forgot password event emitter initialized");

export default forgotPasswordEventEmitter;
