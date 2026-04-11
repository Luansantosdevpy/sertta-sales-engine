import { model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const knowledgeDocumentSchema = createTenantBaseSchema({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 180 },
  sourceType: { type: String, required: true, enum: ['manual', 'url', 'file', 'faq'], default: 'manual' },
  content: { type: String, required: true, trim: true, maxlength: 50000 },
  status: { type: String, required: true, enum: ['draft', 'active', 'archived'], default: 'active' },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  externalId: { type: String, trim: true, maxlength: 120 },
  createdByUserId: { type: String, required: true }
});

knowledgeDocumentSchema.index({ tenantId: 1, status: 1, updatedAt: -1 });
knowledgeDocumentSchema.index({ tenantId: 1, sourceType: 1, createdAt: -1 });
knowledgeDocumentSchema.index({ tenantId: 1, externalId: 1 }, { unique: true, sparse: true });
knowledgeDocumentSchema.index({ tenantId: 1, title: 1 });

export type KnowledgeDocument = InferSchemaType<typeof knowledgeDocumentSchema>;
export const KnowledgeDocumentModel = model<KnowledgeDocument>('KnowledgeDocument', knowledgeDocumentSchema);
