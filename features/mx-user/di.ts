import { container } from "tsyringe";

import MxUserRoute from "./route";
import MXUserController from "./controller";
import CreateMxUserHandler from "./create-user/handler";
import DeleteMxUserHandler from "./delete-user/handler";
import GetAllMxUsersHandler from "./get-all-users/handler";
import GetStatementsHandler from "./get-statements/handler";

export const registerMxUserDi = () => {
  container.register(MXUserController.name, { useClass: MXUserController });
  container.register(CreateMxUserHandler.name, {
    useClass: CreateMxUserHandler,
  });

  container.register(DeleteMxUserHandler.name, {
    useClass: DeleteMxUserHandler,
  });

  container.register(MxUserRoute.name, {
    useClass: MxUserRoute,
  });

  container.register(GetAllMxUsersHandler.name, {
    useClass: GetAllMxUsersHandler,
  });

  container.register(GetStatementsHandler.name, {
    useClass: GetStatementsHandler,
  });
};
