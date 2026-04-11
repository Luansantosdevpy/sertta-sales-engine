import type { Processor } from 'bullmq';
import { enqueue } from '../../infra/queue/bullmq';
import { createJobEnvelope, type JobEnvelope } from '../../infra/queue/job-envelope';
import { aiTasksQueue } from '../../infra/queue/queues';
import { runJobWithContext } from '../../infra/queue/job-context';
import { logger } from '../../infra/logger/pino';
import type { AiTaskQueuePayload, InboundEventQueuePayload } from '../../modules/webhooks/domain/webhook-event.types';
import { webhooksRepository } from '../../modules/webhooks/infrastructure/webhooks.repository';

const parseInboundMessageData = (payload: Record<string, unknown>) => {
  const textCandidate = payload['text'] ?? payload['message'] ?? payload['body'];
  const fromCandidate = payload['from'] ?? payload['sender'] ?? payload['phone'];

  return {
    messageText: typeof textCandidate === 'string' && textCandidate.trim().length > 0 ? textCandidate.trim() : 'Oi',
    recipient: typeof fromCandidate === 'string' && fromCandidate.trim().length > 0 ? fromCandidate.trim() : 'unknown-recipient'
  };
};

export const inboundEventProcessor: Processor<JobEnvelope<InboundEventQueuePayload>> = async (job) => {
  await runJobWithContext(job, async () => {
    const event = await webhooksRepository.findById(job.data.payload.webhookEventId);

    if (!event) {
      logger.warn({ webhookEventId: job.data.payload.webhookEventId }, 'Webhook event missing for inbound routing');
      return;
    }

    const normalized = (event['normalized'] as Record<string, unknown> | undefined) ?? {};
    const normalizedData = (normalized['data'] as Record<string, unknown> | undefined) ?? {};
    const parsed = parseInboundMessageData(normalizedData);

    const aiPayload: AiTaskQueuePayload = {
      webhookEventId: job.data.payload.webhookEventId,
      tenantId: job.data.tenantId,
      provider: job.data.payload.provider,
      messageText: parsed.messageText,
      recipient: parsed.recipient,
      ...(event['channelId'] ? { channelId: String(event['channelId']) } : {}),
      ...(event['integrationId'] ? { integrationId: String(event['integrationId']) } : {})
    };

    await enqueue(
      aiTasksQueue,
      'ai.assistant.handle-message',
      createJobEnvelope({
        tenantId: job.data.tenantId,
        eventType: 'ai.assistant.message.received',
        payload: aiPayload,
        idempotencyKey: `${job.data.payload.webhookEventId}:ai-task`,
        producer: 'inbound-events.processor'
      })
    );

    logger.info(
      {
        tenantId: job.data.tenantId,
        webhookEventId: job.data.payload.webhookEventId,
        correlationId: job.data.correlationId
      },
      'Inbound event routed to AI tasks queue'
    );
  });
};
