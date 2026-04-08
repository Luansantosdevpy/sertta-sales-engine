import { requestContext } from '../../shared/context/request-context';

export interface JobEnvelope<TPayload = Record<string, unknown>> {
  tenantId: string;
  correlationId: string;
  eventType: string;
  idempotencyKey?: string;
  version: number;
  timestamps: {
    requestedAt: string;
    enqueuedAt?: string;
  };
  payload: TPayload;
  meta: {
    producer: string;
  };
}

export const createJobEnvelope = <TPayload>(params: {
  tenantId: string;
  eventType: string;
  payload: TPayload;
  idempotencyKey?: string;
  version?: number;
  producer?: string;
}): JobEnvelope<TPayload> => {
  const context = requestContext.get();

  return {
    tenantId: params.tenantId,
    correlationId: context?.correlationId ?? context?.requestId ?? 'system',
    eventType: params.eventType,
    ...(params.idempotencyKey ? { idempotencyKey: params.idempotencyKey } : {}),
    version: params.version ?? 1,
    timestamps: {
      requestedAt: new Date().toISOString()
    },
    payload: params.payload,
    meta: {
      producer: params.producer ?? 'api'
    }
  };
};
