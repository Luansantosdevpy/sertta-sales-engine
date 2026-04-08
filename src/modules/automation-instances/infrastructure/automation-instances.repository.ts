import { AutomationInstanceModel } from './automation-instance.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const automationInstancesRepository = {
  async create(tenantId: string, data: {
    name: string;
    templateId: string;
    templateVersion: number;
    triggerConfig?: Record<string, unknown>;
    runtimeConfig?: Record<string, unknown>;
    channelId?: string;
    integrationId?: string;
    createdByUserId: string;
  }) {
    return AutomationInstanceModel.create(withTenantScope(tenantId, { ...data, status: 'active' }));
  },

  async list(tenantId: string, status?: string) {
    return AutomationInstanceModel.find(withTenantScope(tenantId, { ...(status ? { status } : {}) }))
      .sort({ createdAt: -1 })
      ;
  },

  async updateStatus(tenantId: string, instanceId: string, status: 'active' | 'paused' | 'archived') {
    return AutomationInstanceModel.findOneAndUpdate(
      withTenantScope(tenantId, { _id: instanceId }),
      { status },
      { new: true }
    );
  }
};

