import { model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const catalogItemSchema = createTenantBaseSchema({
  itemType: {
    type: String,
    required: true,
    enum: ['product', 'service']
  },
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 160 },
  slug: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    minlength: 2,
    maxlength: 100,
    match: /^[a-z0-9_-]+$/
  },
  description: { type: String, trim: true, maxlength: 4000 },
  sku: { type: String, trim: true, maxlength: 80 },
  currency: { type: String, trim: true, uppercase: true, minlength: 3, maxlength: 3, default: 'USD' },
  priceCents: { type: Number, required: true, min: 0 },
  status: { type: String, required: true, enum: ['active', 'inactive'], default: 'active' },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  attributes: { type: Map, of: String },
  createdByUserId: { type: String, required: true }
});

catalogItemSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
catalogItemSchema.index({ tenantId: 1, itemType: 1, status: 1, createdAt: -1 });
catalogItemSchema.index({ tenantId: 1, slug: 1 }, { unique: true });
catalogItemSchema.index({ tenantId: 1, sku: 1 }, { unique: true, sparse: true });
catalogItemSchema.index({ tenantId: 1, name: 1 });

export type CatalogItemDocument = InferSchemaType<typeof catalogItemSchema>;
export const CatalogItemModel = model<CatalogItemDocument>('CatalogItem', catalogItemSchema);
