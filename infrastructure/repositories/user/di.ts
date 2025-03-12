import { container } from "tsyringe";

import { UserRepository } from "./user-repository";
import { IUserRepository } from "./i-user-repository";

export const registerUserRepositoryDi = () => {
  container.register<IUserRepository>(UserRepository.name, {
    useClass: UserRepository,
  });
};
