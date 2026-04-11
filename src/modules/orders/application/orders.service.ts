import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import { ordersRepository } from '../infrastructure/orders.repository';

export const ordersService = {
  async create(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      contactId?: string;
      conversationId?: string;
      status?: 'draft' | 'pending_payment' | 'paid' | 'canceled';
      currency: string;
      items: Array<{
        itemId?: string;
        itemName: string;
        quantity: number;
        unitPriceCents: number;
      }>;
      discountCents?: number;
      externalOrderId?: string;
      notes?: string;
    }
  ) {
    const scoped = requireTenantContext(tenantContext);

    const items = dto.items.map((item) => ({
      ...item,
      totalPriceCents: item.quantity * item.unitPriceCents
    }));

    const subtotalCents = items.reduce((total, item) => total + item.totalPriceCents, 0);
    const discountCents = dto.discountCents ?? 0;
    const totalCents = Math.max(0, subtotalCents - discountCents);

    const created = await ordersRepository.create(scoped.tenantId, {
      ...dto,
      items,
      subtotalCents,
      discountCents,
      totalCents,
      createdBy: actorUserId
    });

    return created.toJSON();
  },

  async list(tenantContext: TenantContext | undefined, status?: 'draft' | 'pending_payment' | 'paid' | 'canceled') {
    const scoped = requireTenantContext(tenantContext);
    const items = await ordersRepository.list(scoped.tenantId, status);
    return items.map((item) => item.toJSON());
  }
};
