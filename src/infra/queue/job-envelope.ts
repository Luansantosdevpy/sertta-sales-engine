import { requestContext } from '../../shared/context/request-context';

export interface JobEnvelope<TPayload = Record<string, unknown>> {
  tenantId: string;
  correlationId: string;
  idempotencyKey?: string;
  requestedAt: string;
  version: number;
  payload: TPayload;
}

export const createJobEnvelope = <TPayload extends Record<string, unknown>>(params: {
  tenantId: string;
  payload: TPayload;
  idempotencyKey?: string;
  version?: number;
}): JobEnvelope<TPayload> => {
  const context = requestContext.get();

  return {
    tenantId: params.tenantId,
    correlationId: context?.correlationId ?? context?.requestId ?? 'system',
    ...(params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : {}),
    requestedAt: new Date().toISOString(),
    version: params.version ?? 1,
    payload: params.payload
  };
};
