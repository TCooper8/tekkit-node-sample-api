import { IMiddleware } from "koa-router";
import { AppError, ErrorCode, InternalError } from "../../errors";
import * as uuid from 'uuid';

export const internalErrorResponse = (err: Error): [ number, object ] => {
  const errorId = uuid.v4();
  console.log('internal-error error-code:%s error:%s', errorId, err);

  return [ 500, {
    code: ErrorCode.InternalError,
    errorId,
  }];
}

export const appErrorResponse = (err: AppError): [ number, object ] => {
  switch (err.code) {
    case ErrorCode.BadRequest:
      return [ 400, err ];

    case ErrorCode.Unauthorized:
      return [ 401, err ];

    case ErrorCode.NotFound:
      return [ 404, err ];

    case ErrorCode.Conflict:
      return [ 409, err ];

    case ErrorCode.InternalError:
      return internalErrorResponse((err as InternalError).error);
  }

  return internalErrorResponse(err);
}

export const errorResponse = (err: Error): [ number, object ] => {
  if (err instanceof AppError) return appErrorResponse(err);

  return appErrorResponse(new InternalError(err));
}

export const ErrorMiddleware = (): IMiddleware => {
  return async (ctx, next) => {
    try {
      return! await next();
    }
    catch (err) {
      const [ code, body ] = errorResponse(err);
      ctx.status = code;
      ctx.body = body;
    }
  }
}