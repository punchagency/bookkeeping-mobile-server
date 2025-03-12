import { registerMxClientDi } from "../packages/mx/di";
import { registerAiDi } from "../../../features/ai/di";
import { registerTwilioDi } from "../packages/twilio/di";
import { registerBaseDi } from "../../../features/base/di";
import { registerBankDi } from "../../../features/bank/di";
import { registerAuthDi } from "../../../features/auth/di/di";
import { registerOpenAiClientDi } from "../packages/openai/di";
import { registerMxUserDi } from "../../../features/mx-user/di";
import { registerRedisServiceDi } from "../../services/redis/di";
import { registerEnvConfigDi } from "./../../../utils/env-config";
import { registerPineconeClientDi } from "../packages/pinecone/di";
import { registerSendgridServiceDi } from "../packages/sendgrid/di";
import { registerAuthTokenUtilsDi } from "../../../utils/auth-token";
import { registerUserRepositoryDi } from "../../repositories/user/di";
import { registerSettingsDi } from "./../../../features/settings/di/di";
import { registerTokenRepositoryDi } from "../../repositories/token/di";
import { registerApiResponseDi } from "../../../application/response/di";
import { registerTransactionWorker } from "../../workers/transaction/di";
import { registerConversationsDi } from "../../../features/conversations/di";
import { registerSettingsRepositoryDi } from "../../repositories/settings/di";
import {
  registerTransactionQueueService,
  registerTransactionService,
} from "../../services/transaction/di";
import { registerTransactionRepositoryDi } from "../../repositories/transaction/di";
import { registerConversationRepositoryDi } from "../../repositories/conversations/di";
export default class GlobalDIConfig {
  public static registerAllServices() {
    /**
     * Application Services || Features
     */

    registerAiDi();
    registerBaseDi();
    registerAuthDi();
    registerBankDi();
    registerMxUserDi();
    registerSettingsDi();
    registerConversationsDi();

    /**
     * External Services
     */
    registerMxClientDi();
    registerOpenAiClientDi();
    registerSendgridServiceDi();
    registerTwilioDi();
    registerPineconeClientDi();

    /**
     * Repositories
     */
    registerUserRepositoryDi();
    registerTokenRepositoryDi();
    registerSettingsRepositoryDi();
    registerTransactionRepositoryDi();
    registerConversationRepositoryDi();

    /**
     * Utils
     */

    registerEnvConfigDi();
    registerAuthTokenUtilsDi();

    /**
     * Application Behaviors
     */

    registerApiResponseDi();

    /**
     * Infrastructure Services
     */
    registerRedisServiceDi();
    registerTransactionWorker();
    registerTransactionQueueService();
    registerTransactionService();
  }
}
