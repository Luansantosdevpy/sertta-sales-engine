import { createQueue } from './queue-factory';
import { QUEUE_NAMES } from '../../shared/constants/queue-names';

export const webhookIngestionQueue = createQueue(QUEUE_NAMES.webhookIngestion);
export const inboundEventsQueue = createQueue(QUEUE_NAMES.inboundEvents);
export const automationDispatchQueue = createQueue(QUEUE_NAMES.automationDispatch);
export const outboundMessagesQueue = createQueue(QUEUE_NAMES.outboundMessages);
export const scheduledRemindersQueue = createQueue(QUEUE_NAMES.scheduledReminders);
export const leadFollowUpQueue = createQueue(QUEUE_NAMES.leadFollowUp);
export const billingRemindersQueue = createQueue(QUEUE_NAMES.billingReminders);
export const webhookRetriesQueue = createQueue(QUEUE_NAMES.webhookRetries);
export const aiTasksQueue = createQueue(QUEUE_NAMES.aiTasks);
export const usageAggregationQueue = createQueue(QUEUE_NAMES.usageAggregation);
