export interface JobEnvelope<TPayload = Record<string, unknown>> {
  tenantId: string;
  correlationId: string;
  idempotencyKey?: string;
  requestedAt: string;
  version: number;
  payload: TPayload;
}
