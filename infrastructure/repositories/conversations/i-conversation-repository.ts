import { IRepository } from "../i-repository";
import { Conversation } from "../../../domain/entities/conversations";

export interface IConversationRepository extends IRepository<Conversation> {
  findConversationsByUserId(userId: string): Promise<Conversation[] | null>;
}
