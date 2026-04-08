import type { Job } from 'bullmq';
import type { JobEnvelope } from './job-envelope';
import { requestContext } from '../../shared/context/request-context';

export const runJobWithContext = async <TPayload, TResult>(
  job: Job<JobEnvelope<TPayload>>,
  callback: () => Promise<TResult>
): Promise<TResult> => {
  return requestContext.run(
    {
      requestId: `job:${job.id ?? 'unknown'}`,
      correlationId: job.data.correlationId,
      tenantId: job.data.tenantId
    },
    callback
  );
};
