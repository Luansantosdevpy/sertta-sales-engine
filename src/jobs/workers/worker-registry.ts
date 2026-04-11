import type { Processor } from 'bullmq';
import type { JobEnvelope } from '../../infra/queue/job-envelope';
import { QUEUE_NAMES, type QueueName } from '../../shared/constants/queue-names';
import { aiTaskProcessor } from '../processors/ai-task.processor';
import { baseProcessor } from '../processors/base.processor';
import { inboundEventProcessor } from '../processors/inbound-event.processor';
import { outboundMessageProcessor } from '../processors/outbound-message.processor';
import { webhookProcessor } from '../processors/webhook.processor';

type GenericJobProcessor = Processor<JobEnvelope<unknown>>;

const asGenericProcessor = <T>(processor: Processor<JobEnvelope<T>>): GenericJobProcessor => {
  return processor as unknown as GenericJobProcessor;
};

export interface WorkerRegistration {
  queueName: QueueName;
  processor: GenericJobProcessor;
}

export const workerRegistrations: WorkerRegistration[] = [
  { queueName: QUEUE_NAMES.webhookIngestion, processor: asGenericProcessor(webhookProcessor) },
  { queueName: QUEUE_NAMES.inboundEvents, processor: asGenericProcessor(inboundEventProcessor) },
  { queueName: QUEUE_NAMES.automationDispatch, processor: asGenericProcessor(baseProcessor) },
  { queueName: QUEUE_NAMES.outboundMessages, processor: asGenericProcessor(outboundMessageProcessor) },
  { queueName: QUEUE_NAMES.scheduledReminders, processor: asGenericProcessor(baseProcessor) },
  { queueName: QUEUE_NAMES.leadFollowUp, processor: asGenericProcessor(baseProcessor) },
  { queueName: QUEUE_NAMES.billingReminders, processor: asGenericProcessor(baseProcessor) },
  { queueName: QUEUE_NAMES.webhookRetries, processor: asGenericProcessor(baseProcessor) },
  { queueName: QUEUE_NAMES.aiTasks, processor: asGenericProcessor(aiTaskProcessor) },
  { queueName: QUEUE_NAMES.usageAggregation, processor: asGenericProcessor(baseProcessor) }
];
