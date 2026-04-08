import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { automationTemplatesRepository } from '../infrastructure/automation-templates.repository';

export const automationTemplatesService = {
  async createTenantTemplate(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      code: string;
      name: string;
      description?: string;
      triggerType: 'webhook_received' | 'lead_created' | 'message_received' | 'schedule' | 'manual';
      definition: Record<string, unknown>;
    }
  ) {
    const scoped = requireTenantContext(tenantContext);

    const created = await automationTemplatesRepository.createTenantTemplate(scoped.tenantId, {
      ...dto,
      createdByUserId: actorUserId
    });

    return created.toJSON();
  },

  async listAvailable(tenantContext: TenantContext | undefined) {
    const scoped = requireTenantContext(tenantContext);
    return automationTemplatesRepository.listAvailable(scoped.tenantId);
  }
};
