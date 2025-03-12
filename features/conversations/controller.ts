import { Request, Response } from "express";
import { inject, injectable } from "tsyringe";

import GetCompletionsHandler from "./get-completions/handler";
import GetConversationHandler from "./get-conversation/handler";
import ApiResponse from "./../../application/response/response";
import SaveCompletionsHandler from "./save-completions/handler";
import EditConversationHandler from "./edit-conversation/handler";
import SuggestQuestionsHandler from "./suggest-questions/handler";
import CreateConversationHandler from "./create-conversation/handler";
import DeleteConversationHandler from "./delete-conversation/handler";
import { IApiResponse } from "./../../application/response/i-response";
@injectable()
export class ConversationController {
  private readonly _apiResponse: IApiResponse;
  private readonly _getCompletionsHandler: GetCompletionsHandler;
  private readonly _saveCompletionsHandler: SaveCompletionsHandler;
  private readonly _getConversationHandler: GetConversationHandler;
  private readonly _editConversationHandler: EditConversationHandler;
  private readonly _suggestQuestionsHandler: SuggestQuestionsHandler;
  private readonly _createConversationHandler: CreateConversationHandler;
  private readonly _deleteConversationHandler: DeleteConversationHandler;

  constructor(
    @inject(ApiResponse) apiResponse: IApiResponse,
    @inject(GetCompletionsHandler)
    getCompletionsHandler: GetCompletionsHandler,
    @inject(SaveCompletionsHandler)
    saveCompletionsHandler: SaveCompletionsHandler,
    @inject(CreateConversationHandler)
    createConversationHandler: CreateConversationHandler,
    @inject(GetConversationHandler)
    getConversationHandler: GetConversationHandler,
    @inject(EditConversationHandler)
    editConversationHandler: EditConversationHandler,
    @inject(SuggestQuestionsHandler)
    suggestQuestionsHandler: SuggestQuestionsHandler,
    @inject(DeleteConversationHandler)
    deleteConversationHandler: DeleteConversationHandler
  ) {
    this._apiResponse = apiResponse;
    this._getCompletionsHandler = getCompletionsHandler;
    this._saveCompletionsHandler = saveCompletionsHandler;
    this._getConversationHandler = getConversationHandler;
    this._editConversationHandler = editConversationHandler;
    this._suggestQuestionsHandler = suggestQuestionsHandler;
    this._createConversationHandler = createConversationHandler;
    this._deleteConversationHandler = deleteConversationHandler;
  }

  public async createConversation(req: Request, res: Response) {
    const result = await this._createConversationHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Created(res, "Conversation created successfully");
  }

  public async getConversations(req: Request, res: Response) {
    const result = await this._getConversationHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Conversion fetched successfully",
      result.value
    );
  }

  public async editConversation(req: Request, res: Response) {
    const result = await this._editConversationHandler.handle(req, res);

    if (result.isFailure) {
      if (result.metadata?.context?.statusCode == 404) {
        return this._apiResponse.NotFound(
          res,
          "Conversation with given id not found",
          result.errors
        );
      } else if (result.metadata?.context.statusCode == 403) {
        return this._apiResponse.Forbidden(
          res,
          "You are not allowed to edit this conversation",
          result.errors
        );
      } else {
        return this._apiResponse.BadRequest(res, result.errors);
      }
    }

    return this._apiResponse.Ok(
      res,
      "Conversation updated successfully",
      result.value
    );
  }

  public async suggestQuestions(req: Request, res: Response) {
    const result = await this._suggestQuestionsHandler.handle(req, res);

    if (result.isFailure) {
      const statusCode = result.metadata?.context?.statusCode;

      if (statusCode == 404) {
        return this._apiResponse.NotFound(
          res,
          "Conversation requested was not found",
          null
        );
      } else {
        return this._apiResponse.BadRequest(res, result.errors);
      }
    }

    return this._apiResponse.Ok(
      res,
      "Questions suggestions retrieved successfully",
      result.value
    );
  }

  public async getCompletions(req: Request, res: Response) {
    const result = await this._getCompletionsHandler.handle(req, res);

    if (result.isFailure) {
      return this._apiResponse.BadRequest(res, result.errors);
    }

    return this._apiResponse.Ok(
      res,
      "Completions retrieved successfully",
      result.value
    );
  }

  public async saveCompletions(req: Request, res: Response) {
    const result = await this._saveCompletionsHandler.handle(req, res);

    if (result.isFailure) {
      const statusCode = result.metadata?.context?.statusCode;

      if (statusCode == 404) {
        return this._apiResponse.NotFound(
          res,
          "Conversation with given id not found",
          result.errors
        );
      } else if (statusCode == 403) {
        return this._apiResponse.Forbidden(
          res,
          "You are not allowed to save completions for this conversation",
          result.errors
        );
      } else {
        return this._apiResponse.BadRequest(res, result.errors);
      }
    }

    return this._apiResponse.Ok(
      res,
      "Completions saved successfully",
      result.value
    );
  }

  public async deleteConversation(req: Request, res: Response) {
    const result = await this._deleteConversationHandler.handle(req, res);

    if (result.isFailure) {
      const statusCode = result.metadata.context?.statusCode;

      switch (statusCode) {
        case 404:
          return this._apiResponse.NotFound(
            res,
            "Conversation with given id not found",
            result.errors
          );

        case 403:
          return this._apiResponse.Forbidden(
            res,
            "You are not allowed to delete this conversation",
            result.errors
          );

        default:
          return this._apiResponse.BadRequest(res, result.errors);
      }
    }

    return this._apiResponse.Ok(
      res,
      "Conversation deleted successfully",
      result.value
    );
  }
}
