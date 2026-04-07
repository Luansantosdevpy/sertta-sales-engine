import type { NextFunction, Request, Response } from 'express';
import type { Permission } from '../auth/permissions';
import { ForbiddenError, UnauthorizedError } from '../errors/application-errors';

export const requirePermission = (permission: Permission) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      next(new UnauthorizedError('Authentication is required'));
      return;
    }

    if (!req.auth.permissions?.includes(permission)) {
      next(new ForbiddenError('Missing required permission'));
      return;
    }

    next();
  };
};
