import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import { channelsRepository } from '../infrastructure/channels.repository';

export const channelsService = {
  async create(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      name: string;
      kind: 'whatsapp' | 'email' | 'sms' | 'webchat' | 'voice';
      integrationId: string;
      externalChannelId?: string;
      endpoint?: string;
    }
  ) {
    const scoped = requireTenantContext(tenantContext);
    const created = await channelsRepository.create(scoped.tenantId, {
      ...dto,
      createdByUserId: actorUserId
    });

    return created.toJSON();
  },

  async list(tenantContext: TenantContext | undefined, status?: string) {
    const scoped = requireTenantContext(tenantContext);
    return channelsRepository.list(scoped.tenantId, status);
  }
};
