export const WEBHOOK_PROVIDERS = ['whatsapp', 'stripe', 'hubspot', 'custom'] as const;
export type WebhookProvider = (typeof WEBHOOK_PROVIDERS)[number];

export interface NormalizedWebhookEvent {
  provider: WebhookProvider;
  tenantId: string;
  eventType: string;
  externalEventId?: string;
  idempotencyKey?: string;
  occurredAt: string;
  payload: Record<string, unknown>;
  normalized: {
    topic: string;
    resourceId?: string;
    action?: string;
    data: Record<string, unknown>;
  };
}

export interface WebhookQueuePayload extends Record<string, unknown> {
  webhookEventId: string;
  provider: WebhookProvider;
  tenantId: string;
  eventType: string;
  occurredAt: string;
  externalEventId?: string;
  idempotencyKey?: string;
}

export interface InboundEventQueuePayload extends Record<string, unknown> {
  webhookEventId: string;
  tenantId: string;
  provider: WebhookProvider;
  eventType: string;
  occurredAt: string;
}

export interface AiTaskQueuePayload extends Record<string, unknown> {
  webhookEventId: string;
  tenantId: string;
  provider: WebhookProvider;
  messageText: string;
  recipient: string;
  channelId?: string;
  integrationId?: string;
}
