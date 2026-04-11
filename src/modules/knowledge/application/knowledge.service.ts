import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import { knowledgeRepository } from '../infrastructure/knowledge.repository';

export const knowledgeService = {
  async create(
    tenantContext: TenantContext | undefined,
    actorUserId: string,
    dto: {
      title: string;
      sourceType: 'manual' | 'url' | 'file' | 'faq';
      content: string;
      status?: 'draft' | 'active' | 'archived';
      tags?: string[];
      externalId?: string;
    }
  ) {
    const scoped = requireTenantContext(tenantContext);
    const created = await knowledgeRepository.create(scoped.tenantId, {
      ...dto,
      createdByUserId: actorUserId
    });

    return created.toJSON();
  },

  async list(tenantContext: TenantContext | undefined, status?: 'draft' | 'active' | 'archived') {
    const scoped = requireTenantContext(tenantContext);
    const items = await knowledgeRepository.list(scoped.tenantId, status);
    return items.map((item) => item.toJSON());
  }
};
