import { OrderModel } from './order.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const ordersRepository = {
  async create(
    tenantId: string,
    data: {
      contactId?: string;
      conversationId?: string;
      status?: 'draft' | 'pending_payment' | 'paid' | 'canceled';
      currency: string;
      items: Array<{
        itemId?: string;
        itemName: string;
        quantity: number;
        unitPriceCents: number;
        totalPriceCents: number;
      }>;
      subtotalCents: number;
      discountCents: number;
      totalCents: number;
      externalOrderId?: string;
      notes?: string;
      createdBy: string;
    }
  ) {
    return OrderModel.create(
      withTenantScope(tenantId, {
        ...data,
        status: data.status ?? 'draft'
      })
    );
  },

  async list(tenantId: string, status?: 'draft' | 'pending_payment' | 'paid' | 'canceled') {
    return OrderModel.find(withTenantScope(tenantId, { ...(status ? { status } : {}) }))
      .sort({ createdAt: -1 })
      .limit(300);
  }
};
