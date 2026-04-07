import type { ErrorCode } from './error-model';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(params: {
    message: string;
    statusCode: number;
    code: ErrorCode;
    details?: unknown;
    isOperational?: boolean;
  }) {
    super(params.message);
    this.name = 'AppError';
    this.statusCode = params.statusCode;
    this.code = params.code;
    this.details = params.details;
    this.isOperational = params.isOperational ?? true;
  }
}
