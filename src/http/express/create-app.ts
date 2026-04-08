import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { config } from '../../config';
import { apiRouter } from './routes';
import { errorHandlerMiddleware } from '../../shared/errors/error-handler.middleware';
import { notFoundMiddleware } from '../../shared/middleware/not-found.middleware';
import { apiRateLimitMiddleware } from '../../shared/middleware/rate-limit.middleware';
import { requestContextMiddleware } from '../../shared/middleware/request-context.middleware';
import { requestLoggerMiddleware } from '../../shared/middleware/request-logger.middleware';
import { tenantContextMiddleware } from '../../shared/middleware/tenant-context.middleware';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');

  app.use(helmet());

  app.use(
    cors({
      origin: config.http.corsOrigins
    })
  );

  app.use(requestContextMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(apiRateLimitMiddleware);
  app.use(
    express.json({
      limit: '1mb',
      verify: (req, _res, buffer) => {
        (req as typeof req & { rawBody?: Buffer }).rawBody = Buffer.from(buffer);
      }
    })
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(tenantContextMiddleware);

  app.use(config.app.apiPrefix, apiRouter);

  app.use(notFoundMiddleware);
  app.use(errorHandlerMiddleware);

  return app;
};
