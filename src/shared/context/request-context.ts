import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextData {
  requestId: string;
  correlationId: string;
  tenantId?: string;
  userId?: string;
  role?: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContextData>();

export const requestContext = {
  run<T>(context: RequestContextData, callback: () => T): T {
    return requestContextStorage.run(context, callback);
  },

  get(): RequestContextData | undefined {
    return requestContextStorage.getStore();
  },

  setTenant(tenantId: string): void {
    const current = requestContextStorage.getStore();
    if (!current) {
      return;
    }

    current.tenantId = tenantId;
  },

  setActor(actor: { userId: string; role: string }): void {
    const current = requestContextStorage.getStore();
    if (!current) {
      return;
    }

    current.userId = actor.userId;
    current.role = actor.role;
  }
};
