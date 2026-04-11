import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import { catalogRepository } from '../infrastructure/catalog.repository';

export const catalogService = {
  async create(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      itemType: 'product' | 'service';
      name: string;
      slug: string;
      description?: string;
      sku?: string;
      currency: string;
      priceCents: number;
      tags?: string[];
      attributes?: Record<string, string>;
    }
  ) {
    const scoped = requireTenantContext(tenantContext);
    const created = await catalogRepository.create(scoped.tenantId, {
      ...dto,
      createdByUserId: actorUserId
    });

    return created.toJSON();
  },

  async list(
    tenantContext: TenantContext | undefined,
    params: { itemType?: 'product' | 'service'; status?: 'active' | 'inactive' }
  ) {
    const scoped = requireTenantContext(tenantContext);
    const records = await catalogRepository.list(scoped.tenantId, params);
    return records.map((record) => record.toJSON());
  }
};
