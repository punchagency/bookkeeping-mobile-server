import { Router } from "express";
import { inject, injectable } from "tsyringe";
import { ConversationController } from "./controller";
import { useAuth } from "./../../infrastructure/middlewares";

@injectable()
export default class ConversationRoute {
  public readonly router: Router;
  private readonly _conversationController: ConversationController;
  constructor(
    @inject(ConversationController)
    conversationController: ConversationController
  ) {
    this.router = Router();
    this._conversationController = conversationController;

    this.registerRoutes();
  }

  private registerRoutes() {
    this.router.post("/", [useAuth], (req, res) =>
      this._conversationController.createConversation(req, res)
    );

    this.router.get("/", [useAuth], (req, res) =>
      this._conversationController.getConversations(req, res)
    );

    this.router.get("/:id/suggest-questions", [useAuth], (req, res) =>
      this._conversationController.suggestQuestions(req, res)
    );

    this.router.post("/completions", [useAuth], (req, res) =>
      this._conversationController.getCompletions(req, res)
    );

    this.router.patch("/save-completions", [useAuth], (req, res) =>
      this._conversationController.saveCompletions(req, res)
    );

    this.router.patch("/:id", [useAuth], (req, res) =>
      this._conversationController.editConversation(req, res)
    );

    this.router.delete("/:id", [useAuth], (req, res) =>
      this._conversationController.deleteConversation(req, res)
    );
  }
}
 