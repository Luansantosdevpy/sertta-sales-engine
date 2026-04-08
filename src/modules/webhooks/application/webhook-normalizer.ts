import { createHash } from 'node:crypto';
import type { WebhookProvider } from '../domain/webhook-event.types';
import type { NormalizedWebhookEvent } from '../domain/webhook-event.types';

interface NormalizeInput {
  provider: WebhookProvider;
  tenantId: string;
  payload: Record<string, unknown>;
  idempotencyKeyHeader: string | undefined;
}

const hashPayload = (payload: Record<string, unknown>): string => {
  const raw = JSON.stringify(payload);
  return createHash('sha256').update(raw).digest('hex');
};

export const normalizeWebhookEvent = (input: NormalizeInput): NormalizedWebhookEvent => {
  const providerEventType = String(input.payload['eventType'] ?? input.payload['type'] ?? 'unknown');
  const providerExternalId = input.payload['eventId'] ?? input.payload['id'] ?? input.payload['externalEventId'];
  const externalEventId = providerExternalId ? String(providerExternalId) : undefined;

  const idempotencyKey =
    input.idempotencyKeyHeader ??
    externalEventId ??
    `${input.provider}:${input.tenantId}:${providerEventType}:${hashPayload(input.payload)}`;

  return {
    provider: input.provider,
    tenantId: input.tenantId,
    eventType: providerEventType,
    ...(externalEventId ? { externalEventId } : {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
    occurredAt: new Date().toISOString(),
    payload: input.payload,
    normalized: {
      topic: providerEventType,
      ...(input.payload['action'] ? { action: String(input.payload['action']) } : {}),
      ...(input.payload['resourceId'] ? { resourceId: String(input.payload['resourceId']) } : {}),
      data: input.payload
    }
  };
};
