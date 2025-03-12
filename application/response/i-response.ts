import { Response } from "express";

export interface IApiResponse {
  Base(res: Response, code: number, message: string, data: any): any;

  Created(res: Response, message: string, data?: any): any;

  Ok(res: Response, message: string, data: any): any;

  BadRequest(
    res: Response,
    errors: any,
    message?: string,
    requestPath?: string
  ): any;

  Unauthorized(res: Response, message: string, data?: any): any;

  Forbidden(res: Response, message: string, data: any): any;

  NotFound(res: Response, message: string, data: any): any;

  InternalServerError(
    res: Response,
    message: string,
    data?: any,
    requestPath?: string
  ): any;

  Conflict(res: Response, message: string, data?: any): any;
}
