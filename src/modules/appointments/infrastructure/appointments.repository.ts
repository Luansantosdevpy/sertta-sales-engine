import { AppointmentModel } from './appointment.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const appointmentsRepository = {
  async create(
    tenantId: string,
    data: {
      contactId?: string;
      conversationId?: string;
      title: string;
      notes?: string;
      scheduledFor: Date;
      timezone: string;
      channelId?: string;
      createdBy: string;
      status?: 'pending_confirmation' | 'confirmed' | 'completed' | 'canceled';
    }
  ) {
    return AppointmentModel.create(
      withTenantScope(tenantId, {
        ...data,
        ...(data.status ? { status: data.status } : {})
      })
    );
  },

  async list(tenantId: string, status?: 'pending_confirmation' | 'confirmed' | 'completed' | 'canceled') {
    return AppointmentModel.find(withTenantScope(tenantId, { ...(status ? { status } : {}) }))
      .sort({ scheduledFor: 1 })
      .limit(300);
  }
};
