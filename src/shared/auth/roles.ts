export const ROLES = {
  systemAdmin: 'system_admin',
  tenantOwner: 'tenant_owner',
  tenantAdmin: 'tenant_admin',
  manager: 'manager',
  operator: 'operator',
  viewer: 'viewer'
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
