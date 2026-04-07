export const ERROR_CODES = {
  badRequest: 'bad_request',
  unauthorized: 'unauthorized',
  forbidden: 'forbidden',
  notFound: 'not_found',
  conflict: 'conflict',
  validationFailed: 'validation_failed',
  tenantScopeRequired: 'tenant_scope_required',
  tenantScopeViolation: 'tenant_scope_violation',
  idempotencyConflict: 'idempotency_conflict',
  rateLimited: 'rate_limited',
  internalError: 'internal_error'
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export interface ErrorResponseBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
  };
  requestId: string;
}
