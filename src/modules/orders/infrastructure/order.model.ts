import { Schema, model, type InferSchemaType } from 'mongoose';
import { createTenantBaseSchema } from '../../../database/mongoose/base/tenant-base.schema';

const orderSchema = createTenantBaseSchema({
  contactId: { type: Schema.Types.ObjectId, ref: 'Contact' },
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
  status: {
    type: String,
    required: true,
    enum: ['draft', 'pending_payment', 'paid', 'canceled'],
    default: 'draft'
  },
  currency: { type: String, required: true, trim: true, uppercase: true, minlength: 3, maxlength: 3, default: 'USD' },
  items: [
    {
      itemId: { type: Schema.Types.ObjectId, ref: 'CatalogItem' },
      itemName: { type: String, required: true, trim: true, maxlength: 180 },
      quantity: { type: Number, required: true, min: 1 },
      unitPriceCents: { type: Number, required: true, min: 0 },
      totalPriceCents: { type: Number, required: true, min: 0 }
    }
  ],
  subtotalCents: { type: Number, required: true, min: 0 },
  discountCents: { type: Number, required: true, min: 0, default: 0 },
  totalCents: { type: Number, required: true, min: 0 },
  externalOrderId: { type: String, trim: true, maxlength: 120 },
  notes: { type: String, trim: true, maxlength: 3000 },
  createdBy: { type: String, required: true }
});

orderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
orderSchema.index({ tenantId: 1, contactId: 1, createdAt: -1 }, { sparse: true });
orderSchema.index({ tenantId: 1, conversationId: 1, createdAt: -1 }, { sparse: true });
orderSchema.index({ tenantId: 1, externalOrderId: 1 }, { unique: true, sparse: true });

export type OrderDocument = InferSchemaType<typeof orderSchema>;
export const OrderModel = model<OrderDocument>('Order', orderSchema);
