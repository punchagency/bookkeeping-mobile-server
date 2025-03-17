import { Types } from "mongoose";

export interface ILoginResponse {
  accessToken: string;
  user: {
    _id: Types.ObjectId;
    email: string;
    firstName: string;
    lastName: string;
    avatar: string;
  };
}
