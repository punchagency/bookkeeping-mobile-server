import { container } from "tsyringe";
import { TokenRepository } from "./token-repository";
import { ITokenRepository } from "./i-token-repository";

export const registerTokenRepositoryDi = () => {
  container.register<ITokenRepository>(TokenRepository.name, {
    useClass: TokenRepository,
  });
};
