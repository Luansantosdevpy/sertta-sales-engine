import { Schema, type SchemaDefinition, type SchemaOptions } from 'mongoose';
import { createBaseSchema } from './base.schema';
import { applyTenantPlugin, type TenantScopedDocument } from '../plugins/tenant.plugin';

export const createTenantBaseSchema = <TDefinition extends SchemaDefinition>(
  definition: TDefinition,
  options?: SchemaOptions
): Schema => {
  const schema = createBaseSchema(
    {
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true,
        index: true
      },
      ...definition
    },
    options
  );

  applyTenantPlugin(schema);
  return schema;
};

export type { TenantScopedDocument };
