import { ChannelModel } from './channel.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const channelsRepository = {
  async create(
    tenantId: string,
    data: {
      name: string;
      kind: 'whatsapp' | 'email' | 'sms' | 'webchat' | 'voice';
      integrationId: string;
      externalChannelId?: string;
      endpoint?: string;
      createdByUserId: string;
    }
  ) {
    return ChannelModel.create(
      withTenantScope(tenantId, {
        ...data,
        status: 'active'
      })
    );
  },

  async list(tenantId: string, status?: string) {
    return ChannelModel.find(withTenantScope(tenantId, { ...(status ? { status } : {}) }))
      .sort({ createdAt: -1 })
      ;
  }
};

