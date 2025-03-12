import { container } from "tsyringe";
import ApiResponse from "./response";
import { IApiResponse } from "./i-response";

export const registerApiResponseDi = () => {
  container.register<IApiResponse>(ApiResponse.name, { useClass: ApiResponse });
};
