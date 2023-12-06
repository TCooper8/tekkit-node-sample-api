export enum ErrorCode {
  BadRequest = "bad-request",
  Unauthorized = 'unauthorized',
  NotFound = 'not-found',
  Conflict = 'conflict',
  InternalError = 'internal-error',
}

export type Issue = Record<string, any>;

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
  ) {
    super('app-error:' + code);
  }
}

export class BadRequestError extends AppError {
  constructor(
    public issues: Issue[]
  ) {
    super(ErrorCode.BadRequest);
  }
}

export class UnauthorizedError extends AppError {
  constructor(
    public issue: string,
  ) {
    super(ErrorCode.Unauthorized);
  }
}

export class ConflictError extends AppError {
  constructor(
    public conflictingField: string,
  ) {
    super(ErrorCode.Conflict);
  }
}

export class InternalError extends AppError {
  constructor(
    public error: Error,
  ) {
    super(ErrorCode.InternalError);
  }
}