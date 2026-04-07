import type { Schema } from 'mongoose';

export const applyToJsonPlugin = (schema: Schema): void => {
  schema.set('toJSON', {
    virtuals: true,
    transform: (_doc, ret: Record<string, unknown>) => {
      const transformed: Record<string, unknown> = { ...ret };
      transformed['id'] = transformed['_id'] ? String(transformed['_id']) : undefined;
      transformed['_id'] = undefined;
      transformed['__v'] = undefined;
      return transformed;
    }
  });
};
