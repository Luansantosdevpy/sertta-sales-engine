import { createQueue } from './bullmq';
import { QUEUE_NAMES } from '../../shared/constants/queue-names';

export const webhookIngestionQueue = createQueue(QUEUE_NAMES.webhookIngestion);
export const automationDispatchQueue = createQueue(QUEUE_NAMES.automationDispatch);
export const usageAggregationQueue = createQueue(QUEUE_NAMES.usageAggregation);
