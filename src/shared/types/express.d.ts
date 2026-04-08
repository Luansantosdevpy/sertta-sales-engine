import type { Logger } from 'pino';
import type { Permission } from '../auth/permissions';
import type { Role } from '../auth/roles';
import type { TenantContext } from '../tenancy/tenant-context';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      correlationId: string;
      rawBody?: Buffer;
      log: Logger;
      auth?: {
        userId: string;
        tenantId: string;
        role: Role;
        permissions?: Permission[];
      };
      tenantContext?: TenantContext;
    }
  }
}

export {};
