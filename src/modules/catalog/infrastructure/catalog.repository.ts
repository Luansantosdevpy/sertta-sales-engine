import { CatalogItemModel } from './catalog-item.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const catalogRepository = {
  async create(
    tenantId: string,
    data: {
      itemType: 'product' | 'service';
      name: string;
      slug: string;
      description?: string;
      sku?: string;
      currency: string;
      priceCents: number;
      tags?: string[];
      attributes?: Record<string, string>;
      createdByUserId: string;
    }
  ) {
    return CatalogItemModel.create(
      withTenantScope(tenantId, {
        ...data,
        status: 'active'
      })
    );
  },

  async list(tenantId: string, params: { itemType?: 'product' | 'service'; status?: 'active' | 'inactive' }) {
    return CatalogItemModel.find(
      withTenantScope(tenantId, {
        ...(params.itemType ? { itemType: params.itemType } : {}),
        ...(params.status ? { status: params.status } : {})
      })
    )
      .sort({ createdAt: -1 })
      .limit(300);
  },

  async listActiveBySearch(tenantId: string, search?: string) {
    return CatalogItemModel.find(
      withTenantScope(tenantId, {
        status: 'active',
        ...(search
          ? {
              $or: [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
              ]
            }
          : {})
      })
    )
      .sort({ createdAt: -1 })
      .limit(20);
  }
};
