export const QUEUE_NAMES = {
  webhookIngestion: 'webhook-ingestion',
  automationDispatch: 'automation-dispatch',
  usageAggregation: 'usage-aggregation'
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
