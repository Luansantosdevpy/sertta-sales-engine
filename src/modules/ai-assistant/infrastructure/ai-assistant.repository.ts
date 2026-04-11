import { AssistantProfileModel } from './assistant-profile.model';
import { AssistantRunModel } from './assistant-run.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const aiAssistantRepository = {
  async upsertProfile(
    tenantId: string,
    data: {
      name: string;
      tone: 'friendly' | 'formal' | 'sales';
      language: string;
      handoffEnabled: boolean;
      handoffThreshold: number;
      policy: {
        canCreateOrders: boolean;
        canCreateAppointments: boolean;
      };
      knowledgeMode: 'none' | 'basic';
      createdByUserId: string;
    }
  ) {
    return AssistantProfileModel.findOneAndUpdate(withTenantScope(tenantId), data, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true
    });
  },

  async getProfile(tenantId: string) {
    return AssistantProfileModel.findOne(withTenantScope(tenantId));
  },

  async listRuns(tenantId: string) {
    return AssistantRunModel.find(withTenantScope(tenantId)).sort({ createdAt: -1 }).limit(300);
  },

  async findRunByWebhookEvent(tenantId: string, webhookEventId: string) {
    return AssistantRunModel.findOne(withTenantScope(tenantId, { sourceWebhookEventId: webhookEventId }));
  },

  async createRun(
    tenantId: string,
    data: {
      sourceWebhookEventId: string;
      intent: string;
      confidence: number;
      actionType: string;
      inputMessage: string;
      outputMessage: string;
      actionResult?: Record<string, unknown>;
      correlationId: string;
    }
  ) {
    return AssistantRunModel.create(withTenantScope(tenantId, data));
  }
};
