import { WebhookEventModel } from './webhook-event.model';
import type { NormalizedWebhookEvent } from '../domain/webhook-event.types';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const webhooksRepository = {
  async findDuplicate(tenantId: string, provider: string, externalEventId?: string, idempotencyKey?: string) {
    const filters: Record<string, unknown>[] = [];

    if (externalEventId) {
      filters.push(withTenantScope(tenantId, { provider, externalEventId }));
    }

    if (idempotencyKey) {
      filters.push(withTenantScope(tenantId, { idempotencyKey }));
    }

    if (filters.length === 0) {
      return null;
    }

    return WebhookEventModel.findOne({ $or: filters });
  },

  async createReceivedEvent(input: NormalizedWebhookEvent, correlationId: string) {
    return WebhookEventModel.create(
      withTenantScope(input.tenantId, {
        provider: input.provider,
        eventType: input.eventType,
        status: 'received',
        externalEventId: input.externalEventId,
        idempotencyKey: input.idempotencyKey,
        normalizationVersion: 1,
        correlationId,
        payload: input.payload,
        normalized: input.normalized,
        receivedAt: new Date()
      })
    );
  },

  async markQueued(eventId: string) {
    return WebhookEventModel.findByIdAndUpdate(
      eventId,
      {
        status: 'queued',
        queuedAt: new Date()
      },
      { new: true }
    );
  },

  async findById(eventId: string) {
    return WebhookEventModel.findById(eventId);
  },

  async markProcessed(eventId: string) {
    return WebhookEventModel.findByIdAndUpdate(
      eventId,
      {
        status: 'processed',
        processedAt: new Date(),
        $inc: { processingAttempts: 1 },
        errorMessage: undefined
      },
      { new: true }
    );
  },

  async markIgnored(eventId: string, reason: string) {
    return WebhookEventModel.findByIdAndUpdate(
      eventId,
      {
        status: 'ignored',
        processedAt: new Date(),
        $inc: { processingAttempts: 1 },
        errorMessage: reason
      },
      { new: true }
    );
  },

  async markFailed(eventId: string, errorMessage: string) {
    return WebhookEventModel.findByIdAndUpdate(
      eventId,
      {
        status: 'failed',
        failedAt: new Date(),
        $inc: { processingAttempts: 1 },
        errorMessage
      },
      { new: true }
    );
  }
};
