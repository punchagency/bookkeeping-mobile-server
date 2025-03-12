import EventEmitter from "events";
import { logger } from "../../../utils";

const signupEventEmitter = new EventEmitter();

logger("Signup event emitter initialized");

export default signupEventEmitter;