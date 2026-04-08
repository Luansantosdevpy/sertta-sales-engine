import type { Job } from 'bullmq';
import { logger } from '../../infra/logger/pino';
import type { JobEnvelope } from '../../infra/queue/job-envelope';
import { ExecutionLogModel } from '../../modules/executions/infrastructure/execution-log.model';
import { JobRecordModel } from '../../modules/executions/infrastructure/job-record.model';

const buildPayloadRef = <TPayload>(payload: TPayload): string => {
  if (typeof payload === 'object' && payload !== null && 'webhookEventId' in (payload as Record<string, unknown>)) {
    return String((payload as Record<string, unknown>)['webhookEventId']);
  }

  return '';
};

const extractAutomationInstanceId = (payload: unknown): string | null => {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const candidate = (payload as Record<string, unknown>)['automationInstanceId'];
  return typeof candidate === 'string' ? candidate : null;
};

const writeExecutionLogIfApplicable = async (params: {
  jobRecordId: string;
  tenantId: string;
  correlationId: string;
  status: 'started' | 'step_success' | 'step_failed';
  level: 'info' | 'error';
  message: string;
  payload: unknown;
  errorCode?: string;
}) => {
  const automationInstanceId = extractAutomationInstanceId(params.payload);

  if (!automationInstanceId) {
    return;
  }

  await ExecutionLogModel.create({
    tenantId: params.tenantId,
    automationInstanceId,
    jobRecordId: params.jobRecordId,
    level: params.level,
    status: params.status,
    message: params.message,
    correlationId: params.correlationId,
    ...(params.errorCode ? { errorCode: params.errorCode } : {}),
    payload: params.payload
  });
};

export const jobLifecycleService = {
  async onEnqueued<TPayload>(job: Job<JobEnvelope<TPayload>>) {
    const data = job.data;

    await JobRecordModel.findOneAndUpdate(
      {
        tenantId: data.tenantId,
        queueJobId: String(job.id)
      },
      {
        tenantId: data.tenantId,
        queueName: job.queueName,
        jobName: job.name,
        eventType: data.eventType,
        queueJobId: String(job.id),
        status: 'queued',
        correlationId: data.correlationId,
        ...(data.idempotencyKey ? { idempotencyKey: data.idempotencyKey } : {}),
        attemptsMade: 0,
        maxAttempts: job.opts.attempts ?? 1,
        payloadRef: buildPayloadRef(data.payload)
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );
  },

  async onActive<TPayload>(job: Job<JobEnvelope<TPayload>>) {
    const record = await JobRecordModel.findOneAndUpdate(
      {
        tenantId: job.data.tenantId,
        queueJobId: String(job.id)
      },
      {
        status: 'processing',
        startedAt: new Date(),
        attemptsMade: job.attemptsMade
      },
      { new: true }
    );

    if (!record) {
      return;
    }

    await writeExecutionLogIfApplicable({
      jobRecordId: String(record['_id']),
      tenantId: job.data.tenantId,
      correlationId: job.data.correlationId,
      status: 'started',
      level: 'info',
      message: `Job ${job.name} started`,
      payload: job.data.payload
    });
  },

  async onCompleted<TPayload>(job: Job<JobEnvelope<TPayload>>) {
    const record = await JobRecordModel.findOneAndUpdate(
      {
        tenantId: job.data.tenantId,
        queueJobId: String(job.id)
      },
      {
        status: 'completed',
        completedAt: new Date(),
        attemptsMade: job.attemptsMade
      },
      { new: true }
    );

    if (!record) {
      return;
    }

    await writeExecutionLogIfApplicable({
      jobRecordId: String(record['_id']),
      tenantId: job.data.tenantId,
      correlationId: job.data.correlationId,
      status: 'step_success',
      level: 'info',
      message: `Job ${job.name} completed`,
      payload: job.data.payload
    });
  },

  async onFailed<TPayload>(job: Job<JobEnvelope<TPayload>> | undefined, error: Error) {
    if (!job) {
      logger.error({ err: error }, 'Job failed before job reference was available');
      return;
    }

    const maxAttempts = job.opts.attempts ?? 1;
    const isDeadLetter = job.attemptsMade >= maxAttempts;

    const record = await JobRecordModel.findOneAndUpdate(
      {
        tenantId: job.data.tenantId,
        queueJobId: String(job.id)
      },
      {
        status: isDeadLetter ? 'dead_letter' : 'failed',
        failedAt: new Date(),
        attemptsMade: job.attemptsMade,
        errorMessage: error.message,
        ...(isDeadLetter
          ? {
              deadLetteredAt: new Date(),
              deadLetterReason: error.message
            }
          : {})
      },
      { new: true }
    );

    if (!record) {
      return;
    }

    await writeExecutionLogIfApplicable({
      jobRecordId: String(record['_id']),
      tenantId: job.data.tenantId,
      correlationId: job.data.correlationId,
      status: 'step_failed',
      level: 'error',
      message: `Job ${job.name} failed`,
      payload: job.data.payload,
      errorCode: isDeadLetter ? 'dead_letter' : 'job_failed'
    });
  }
};
