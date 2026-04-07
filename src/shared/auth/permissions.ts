import { ROLES, type Role } from './roles';

export const PERMISSIONS = {
  tenantRead: 'tenant:read',
  tenantWrite: 'tenant:write',
  memberRead: 'member:read',
  memberWrite: 'member:write',
  integrationRead: 'integration:read',
  integrationWrite: 'integration:write',
  automationRead: 'automation:read',
  automationWrite: 'automation:write',
  executionRead: 'execution:read',
  executionWrite: 'execution:write',
  usageRead: 'usage:read',
  billingRead: 'billing:read',
  billingWrite: 'billing:write',
  adminRead: 'admin:read',
  adminWrite: 'admin:write'
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const rolePermissionsMap: Record<Role, Permission[]> = {
  [ROLES.systemAdmin]: Object.values(PERMISSIONS),
  [ROLES.tenantOwner]: [
    PERMISSIONS.tenantRead,
    PERMISSIONS.tenantWrite,
    PERMISSIONS.memberRead,
    PERMISSIONS.memberWrite,
    PERMISSIONS.integrationRead,
    PERMISSIONS.integrationWrite,
    PERMISSIONS.automationRead,
    PERMISSIONS.automationWrite,
    PERMISSIONS.executionRead,
    PERMISSIONS.executionWrite,
    PERMISSIONS.usageRead,
    PERMISSIONS.billingRead,
    PERMISSIONS.billingWrite
  ],
  [ROLES.tenantAdmin]: [
    PERMISSIONS.tenantRead,
    PERMISSIONS.memberRead,
    PERMISSIONS.memberWrite,
    PERMISSIONS.integrationRead,
    PERMISSIONS.integrationWrite,
    PERMISSIONS.automationRead,
    PERMISSIONS.automationWrite,
    PERMISSIONS.executionRead,
    PERMISSIONS.executionWrite,
    PERMISSIONS.usageRead,
    PERMISSIONS.billingRead
  ],
  [ROLES.manager]: [
    PERMISSIONS.memberRead,
    PERMISSIONS.integrationRead,
    PERMISSIONS.integrationWrite,
    PERMISSIONS.automationRead,
    PERMISSIONS.automationWrite,
    PERMISSIONS.executionRead,
    PERMISSIONS.executionWrite,
    PERMISSIONS.usageRead
  ],
  [ROLES.operator]: [
    PERMISSIONS.integrationRead,
    PERMISSIONS.automationRead,
    PERMISSIONS.executionRead,
    PERMISSIONS.executionWrite
  ],
  [ROLES.viewer]: [
    PERMISSIONS.tenantRead,
    PERMISSIONS.memberRead,
    PERMISSIONS.integrationRead,
    PERMISSIONS.automationRead,
    PERMISSIONS.executionRead,
    PERMISSIONS.usageRead
  ]
};

export const getRolePermissions = (role: Role): Permission[] => rolePermissionsMap[role] ?? [];

export const hasPermission = (role: Role, permission: Permission): boolean => {
  return getRolePermissions(role).includes(permission);
};
