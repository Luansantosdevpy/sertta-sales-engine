import { IntegrationModel } from './integration.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const integrationsRepository = {
  async create(tenantId: string, data: {
    name: string;
    provider: 'whatsapp' | 'crm' | 'email' | 'sms' | 'custom_webhook';
    externalAccountId?: string;
    credentialsRef?: string;
    createdByUserId: string;
  }) {
    return IntegrationModel.create(
      withTenantScope(tenantId, {
        ...data,
        status: 'active'
      })
    );
  },

  async list(tenantId: string, status?: string) {
    return IntegrationModel.find(
      withTenantScope(tenantId, {
        ...(status ? { status } : {})
      })
    )
      .sort({ createdAt: -1 })
      ;
  }
};

