import { AutomationTemplateModel } from './automation-template.model';
import { platformScope, withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const automationTemplatesRepository = {
  async createSystemTemplate(data: {
    code: string;
    name: string;
    description?: string;
    triggerType: 'webhook_received' | 'lead_created' | 'message_received' | 'schedule' | 'manual';
    definition: Record<string, unknown>;
    createdByUserId: string;
  }) {
    return AutomationTemplateModel.create({
      scope: 'system',
      ...data,
      status: 'draft'
    });
  },

  async createTenantTemplate(
    tenantId: string,
    data: {
      code: string;
      name: string;
      description?: string;
      triggerType: 'webhook_received' | 'lead_created' | 'message_received' | 'schedule' | 'manual';
      definition: Record<string, unknown>;
      createdByUserId: string;
    }
  ) {
    return AutomationTemplateModel.create(
      withTenantScope(tenantId, {
        scope: 'tenant',
        ...data,
        status: 'draft'
      })
    );
  },

  async listPlatformTemplates() {
    return AutomationTemplateModel.find(platformScope({ scope: 'system', status: 'published' })).sort({ createdAt: -1 });
  },

  async listTenantTemplates(tenantId: string) {
    return AutomationTemplateModel.find(withTenantScope(tenantId, { scope: 'tenant' })).sort({ createdAt: -1 });
  }
};
