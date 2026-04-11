import { KnowledgeDocumentModel } from './knowledge-document.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const knowledgeRepository = {
  async create(
    tenantId: string,
    data: {
      title: string;
      sourceType: 'manual' | 'url' | 'file' | 'faq';
      content: string;
      status?: 'draft' | 'active' | 'archived';
      tags?: string[];
      externalId?: string;
      createdByUserId: string;
    }
  ) {
    return KnowledgeDocumentModel.create(
      withTenantScope(tenantId, {
        ...data,
        status: data.status ?? 'active'
      })
    );
  },

  async list(tenantId: string, status?: 'draft' | 'active' | 'archived') {
    return KnowledgeDocumentModel.find(withTenantScope(tenantId, { ...(status ? { status } : {}) }))
      .sort({ updatedAt: -1 })
      .limit(300);
  },

  async searchActive(tenantId: string, query: string) {
    return KnowledgeDocumentModel.find(
      withTenantScope(tenantId, {
        status: 'active',
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      })
    )
      .sort({ updatedAt: -1 })
      .limit(5);
  }
};
