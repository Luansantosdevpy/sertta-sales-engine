import type { Schema } from 'mongoose';

export interface TenantScopedDocument {
  tenantId: string;
}

export const applyTenantPlugin = (schema: Schema): void => {
  schema.index({ tenantId: 1, createdAt: -1 });
};
