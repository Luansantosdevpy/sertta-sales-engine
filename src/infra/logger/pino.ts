import pino from 'pino';
import { config } from '../../config';
import { requestContext } from '../../shared/context/request-context';

export const logger = pino({
  level: config.logger.level,
  base: null,
  mixin() {
    const context = requestContext.get();

    if (!context) {
      return {};
    }

    return {
      requestId: context.requestId,
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      userId: context.userId
    };
  },
  redact: ['req.headers.authorization', 'authorization', 'password', 'token', '*.token']
});
