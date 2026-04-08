import { Router } from 'express';
import { asyncHandler } from '../../../shared/http/async-handler';
import { validateMiddleware } from '../../../shared/middleware/validate.middleware';
import { getPlanHandler, listPlansHandler } from './plans.controller';
import { planParamsSchema } from './plans.schemas';

export const plansRouter = Router();

plansRouter.get('/plans', asyncHandler(listPlansHandler));
plansRouter.get('/plans/:planId', validateMiddleware({ params: planParamsSchema }), asyncHandler(getPlanHandler));
