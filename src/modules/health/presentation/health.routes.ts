import { Router } from 'express';
import { livenessHandler, readinessHandler } from './health.controller';

export const healthRouter = Router();

healthRouter.get('/health', livenessHandler);
healthRouter.get('/health/ready', readinessHandler);
