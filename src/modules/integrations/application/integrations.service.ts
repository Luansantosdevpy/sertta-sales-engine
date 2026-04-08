import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { integrationsRepository } from '../infrastructure/integrations.repository';

export const integrationsService = {
  async create(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      name: string;
      provider: 'whatsapp' | 'crm' | 'email' | 'sms' | 'custom_webhook';
      externalAccountId?: string;
      credentialsRef?: string;
    }
  ) {
    const scoped = requireTenantContext(tenantContext);

    const created = await integrationsRepository.create(scoped.tenantId, {
      ...dto,
      createdByUserId: actorUserId
    });

    return created.toJSON();
  },

  async list(tenantContext: TenantContext | undefined, status?: string) {
    const scoped = requireTenantContext(tenantContext);
    return integrationsRepository.list(scoped.tenantId, status);
  }
};
