import type { Logger } from 'pino';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      log: Logger;
      auth?: {
        userId: string;
        tenantId: string;
        role: string;
      };
    }
  }
}

export {};
