import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import { appointmentsRepository } from '../infrastructure/appointments.repository';

export const appointmentsService = {
  async create(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      contactId?: string;
      conversationId?: string;
      title: string;
      notes?: string;
      scheduledFor: string;
      timezone: string;
      channelId?: string;
      status?: 'pending_confirmation' | 'confirmed' | 'completed' | 'canceled';
    }
  ) {
    const scoped = requireTenantContext(tenantContext);

    const created = await appointmentsRepository.create(scoped.tenantId, {
      ...dto,
      scheduledFor: new Date(dto.scheduledFor),
      createdBy: actorUserId
    });

    return created.toJSON();
  },

  async list(
    tenantContext: TenantContext | undefined,
    status?: 'pending_confirmation' | 'confirmed' | 'completed' | 'canceled'
  ) {
    const scoped = requireTenantContext(tenantContext);
    const records = await appointmentsRepository.list(scoped.tenantId, status);
    return records.map((record) => record.toJSON());
  }
};
