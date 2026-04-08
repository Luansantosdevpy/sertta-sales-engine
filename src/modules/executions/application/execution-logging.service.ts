import { ExecutionLogModel } from '../infrastructure/execution-log.model';

export const executionLoggingService = {
  async writeWebhookLog(params: {
    tenantId: string;
    webhookEventId: string;
    correlationId: string;
    level: 'info' | 'warn' | 'error';
    status: 'started' | 'step_success' | 'step_failed' | 'finished';
    message: string;
    stepKey: string;
    payload?: Record<string, unknown>;
    errorCode?: string;
  }) {
    await ExecutionLogModel.create({
      tenantId: params.tenantId,
      webhookEventId: params.webhookEventId,
      level: params.level,
      status: params.status,
      message: params.message,
      stepKey: params.stepKey,
      correlationId: params.correlationId,
      ...(params.errorCode ? { errorCode: params.errorCode } : {}),
      ...(params.payload ? { payload: params.payload } : {})
    });
  }
};
