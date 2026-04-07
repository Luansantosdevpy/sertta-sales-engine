import type { IndexDefinition, IndexOptions } from 'mongoose';

export const createTenantUniqueIndex = (
  fields: Record<string, 1 | -1>,
  options?: IndexOptions
): [IndexDefinition, IndexOptions] => {
  return [
    {
      tenantId: 1,
      ...fields
    },
    {
      unique: true,
      ...options
    }
  ];
};
