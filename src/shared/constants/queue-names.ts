export const QUEUE_NAMES = {
  webhookIngestion: 'webhook-ingestion',
  inboundEvents: 'inbound-events',
  automationDispatch: 'automation-dispatch',
  outboundMessages: 'outbound-messages',
  scheduledReminders: 'scheduled-reminders',
  leadFollowUp: 'lead-follow-up',
  billingReminders: 'billing-reminders',
  webhookRetries: 'webhook-retries',
  aiTasks: 'ai-tasks',
  usageAggregation: 'usage-aggregation'
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];
