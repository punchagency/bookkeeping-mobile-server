import { Types } from "mongoose";

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
      _id: Types.ObjectId;
    email: string;
    fullName: string;
    avatar: string;
  };
}
