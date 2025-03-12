
import { Response } from "express";
import { injectable, inject } from "tsyringe";

import { IApiResponse } from "./i-response";
import HttpConstants from "./../constants/http";

@injectable()
class ApiResponse implements IApiResponse {
  private readonly httpConstants: HttpConstants;
  private readonly httpStatusText = {
    100: "Continue",
    101: "Switching Protocols",
    102: "Processing",
    103: "Early Hints",
    200: "OK",
    201: "Created",
    202: "Accepted",
    203: "Non-Authoritative Information",
    204: "No Content",
    205: "Reset Content",
    206: "Partial Content",
    207: "Multi-Status",
    208: "Already Reported",
    226: "IM Used",
    300: "Multiple Choices",
    301: "Moved Permanently",
    302: "Found",
    303: "See Other",
    304: "Not Modified",
    305: "Use Proxy",
    306: "(Unused)",
    307: "Temporary Redirect",
    308: "Permanent Redirect",
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a Teapot",
    421: "Misdirected Request",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
  };

  constructor(@inject(HttpConstants) httpConstants: HttpConstants) {
    this.httpConstants = new HttpConstants();
  }

  Base(res: Response, code: number, message: string, data: any = {}) {
    const statusText = this.httpStatusText[code] || "Unknown Status";
    const success = code >= 200 && code < 300;

    return res.status(code).json({
      code: code,
      status: statusText,
      success: success,
      message: message,
      data: data,
    });
  }

  Created(
    res: Response,
    message: string = this.httpConstants.CREATED,
    data?: any
  ) {
    return this.Base(res, 201, message, data);
  }
  Ok(res: Response, message: string = this.httpConstants.OK, data?: any) {
    return this.Base(res, 200, message, data);
  }
  BadRequest(
    res: Response,
    errors: any,
    message: string = this.httpConstants.BAD_REQUEST,
    requestPath?: string
  ) {
    return res.status(400).json({
      code: 400,
      status: this.httpStatusText[400],
      success: false,
      message: message,
      requestPath: requestPath,
      errors: errors,
    });
  }
  Unauthorized(
    res: Response,
    message: string = this.httpConstants.UNAUTHORIZED,
    data?: any
  ) {
    return this.Base(res, 401, message, data);
  }
  Forbidden(
    res: Response,
    message: string = this.httpConstants.FORBIDDEN,
    data: any
  ) {
    return this.Base(res, 403, message, data);
  }
  NotFound(
    res: Response,
    message: string = this.httpConstants.NOT_FOUND,
    data?: any
  ) {
    return this.Base(res, 404, message, data);
  }
  InternalServerError(
    res: Response,
    message: string = this.httpConstants.INTERNAL_SERVER_ERROR,
    requestPath?: string
  ) {
    return res.status(500).json({
      code: 500,
      status: this.httpStatusText[500],
      success: false,
      message: message,
      requestPath: requestPath,
      data: {},
    });
  }
  Conflict(
    res: Response,
    message: string = this.httpConstants.CONFLICT,
    data?: any
  ) {
    return this.Base(res, 409, message, data);
  }
}

export default ApiResponse;
