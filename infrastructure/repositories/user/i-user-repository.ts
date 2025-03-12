import { IRepository } from "../i-repository";
import { User } from "../../../domain/entities/user";

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;
  updatePassword(userId: string, hashedPassword: string): Promise<User | null>;
  findQualifiedUsers(): Promise<User[]>;
}
