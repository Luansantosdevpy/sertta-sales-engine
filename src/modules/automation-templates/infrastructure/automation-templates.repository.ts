import { AutomationTemplateModel } from './automation-template.model';

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

  async createTenantTemplate(tenantId: string, data: {
    code: string;
    name: string;
    description?: string;
    triggerType: 'webhook_received' | 'lead_created' | 'message_received' | 'schedule' | 'manual';
    definition: Record<string, unknown>;
    createdByUserId: string;
  }) {
    return AutomationTemplateModel.create({
      scope: 'tenant',
      tenantId,
      ...data,
      status: 'draft'
    });
  },

  async listAvailable(tenantId: string) {
    return AutomationTemplateModel.find({
      $or: [{ scope: 'system', status: 'published' }, { scope: 'tenant', tenantId }]
    })
      .sort({ scope: 1, createdAt: -1 })
      ;
  }
};

