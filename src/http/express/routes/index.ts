import { Router } from 'express';
import { healthRouter } from '../../../modules/health/presentation/health.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
