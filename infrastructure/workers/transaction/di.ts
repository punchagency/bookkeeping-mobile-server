import { container } from "tsyringe";
import TransactionWorker from "./index";

export const registerTransactionWorker = () => {
  container.registerSingleton(TransactionWorker);
};
