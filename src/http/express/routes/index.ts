import { Router } from 'express';
import { authRouter } from '../../../modules/auth/presentation/auth.routes';
import { automationInstancesRouter } from '../../../modules/automation-instances/presentation/automation-instances.routes';
import { automationTemplatesRouter } from '../../../modules/automation-templates/presentation/automation-templates.routes';
import { channelsRouter } from '../../../modules/channels/presentation/channels.routes';
import { executionsRouter } from '../../../modules/executions/presentation/executions.routes';
import { healthRouter } from '../../../modules/health/presentation/health.routes';
import { integrationsRouter } from '../../../modules/integrations/presentation/integrations.routes';
import { plansRouter } from '../../../modules/plans/presentation/plans.routes';
import { tenantsRouter } from '../../../modules/tenants/presentation/tenants.routes';
import { usageRouter } from '../../../modules/usage/presentation/usage.routes';
import { usersRouter } from '../../../modules/users/presentation/users.routes';
import { webhooksRouter } from '../../../modules/webhooks/presentation/webhooks.routes';

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(webhooksRouter);
apiRouter.use(authRouter);
apiRouter.use(usersRouter);
apiRouter.use(plansRouter);
apiRouter.use(tenantsRouter);
apiRouter.use(integrationsRouter);
apiRouter.use(channelsRouter);
apiRouter.use(automationTemplatesRouter);
apiRouter.use(automationInstancesRouter);
apiRouter.use(usageRouter);
apiRouter.use(executionsRouter);
