import { NotFoundError } from '../../../shared/errors/application-errors';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { automationInstancesRepository } from '../infrastructure/automation-instances.repository';

export const automationInstancesService = {
  async create(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      name: string;
      templateId: string;
      templateVersion: number;
      triggerConfig?: Record<string, unknown>;
      runtimeConfig?: Record<string, unknown>;
      channelId?: string;
      integrationId?: string;
    }
  ) {
    const scoped = requireTenantContext(tenantContext);

    const created = await automationInstancesRepository.create(scoped.tenantId, {
      ...dto,
      createdByUserId: actorUserId
    });

    return created.toJSON();
  },

  async list(tenantContext: TenantContext | undefined, status?: string) {
    const scoped = requireTenantContext(tenantContext);
    return automationInstancesRepository.list(scoped.tenantId, status);
  },

  async setStatus(
    tenantContext: TenantContext | undefined,
    instanceId: string,
    status: 'active' | 'paused' | 'archived'
  ) {
    const scoped = requireTenantContext(tenantContext);

    const updated = await automationInstancesRepository.updateStatus(scoped.tenantId, instanceId, status);

    if (!updated) {
      throw new NotFoundError('Automation instance not found');
    }

    return updated;
  }
};
