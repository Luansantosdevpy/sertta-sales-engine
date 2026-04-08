import { QUEUE_NAMES, type QueueName } from '../../shared/constants/queue-names';

export interface QueueRuntimeConfig {
  concurrency: number;
  attempts: number;
  backoffDelayMs: number;
  description: string;
  limiterMax?: number;
  limiterDurationMs?: number;
}

export const QUEUE_CONFIG: Record<QueueName, QueueRuntimeConfig> = {
  [QUEUE_NAMES.webhookIngestion]: {
    concurrency: 20,
    attempts: 8,
    backoffDelayMs: 2000,
    description: 'Normalize and process inbound webhook events',
    limiterMax: 200,
    limiterDurationMs: 1000
  },
  [QUEUE_NAMES.inboundEvents]: {
    concurrency: 20,
    attempts: 6,
    backoffDelayMs: 1500,
    description: 'Process inbound platform events'
  },
  [QUEUE_NAMES.automationDispatch]: {
    concurrency: 15,
    attempts: 6,
    backoffDelayMs: 1200,
    description: 'Dispatch automation executions'
  },
  [QUEUE_NAMES.outboundMessages]: {
    concurrency: 15,
    attempts: 7,
    backoffDelayMs: 1500,
    description: 'Deliver outbound customer messages',
    limiterMax: 120,
    limiterDurationMs: 1000
  },
  [QUEUE_NAMES.scheduledReminders]: {
    concurrency: 10,
    attempts: 5,
    backoffDelayMs: 2000,
    description: 'Execute scheduled reminders'
  },
  [QUEUE_NAMES.leadFollowUp]: {
    concurrency: 10,
    attempts: 5,
    backoffDelayMs: 1800,
    description: 'Run lead follow-up automations'
  },
  [QUEUE_NAMES.billingReminders]: {
    concurrency: 8,
    attempts: 5,
    backoffDelayMs: 3000,
    description: 'Send billing reminder notifications'
  },
  [QUEUE_NAMES.webhookRetries]: {
    concurrency: 10,
    attempts: 10,
    backoffDelayMs: 3000,
    description: 'Retry failed webhook downstream deliveries',
    limiterMax: 60,
    limiterDurationMs: 1000
  },
  [QUEUE_NAMES.aiTasks]: {
    concurrency: 5,
    attempts: 4,
    backoffDelayMs: 2500,
    description: 'AI and enrichment tasks',
    limiterMax: 10,
    limiterDurationMs: 1000
  },
  [QUEUE_NAMES.usageAggregation]: {
    concurrency: 8,
    attempts: 4,
    backoffDelayMs: 2000,
    description: 'Aggregate usage counters'
  }
};
