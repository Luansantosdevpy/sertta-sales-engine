import { AppError } from './app-error';
import { ERROR_CODES } from './error-model';

export class BadRequestError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ message, details, statusCode: 400, code: ERROR_CODES.badRequest });
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: unknown) {
    super({ message, details, statusCode: 400, code: ERROR_CODES.validationFailed });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', details?: unknown) {
    super({ message, details, statusCode: 401, code: ERROR_CODES.unauthorized });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', details?: unknown) {
    super({ message, details, statusCode: 403, code: ERROR_CODES.forbidden });
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', details?: unknown) {
    super({ message, details, statusCode: 404, code: ERROR_CODES.notFound });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ message, details, statusCode: 409, code: ERROR_CODES.conflict });
  }
}

export class TenantScopeError extends AppError {
  constructor(message: string, details?: unknown) {
    super({ message, details, statusCode: 403, code: ERROR_CODES.tenantScopeViolation });
  }
}

export class IdempotencyConflictError extends AppError {
  constructor(message = 'Idempotency key is already in use', details?: unknown) {
    super({ message, details, statusCode: 409, code: ERROR_CODES.idempotencyConflict });
  }
}
