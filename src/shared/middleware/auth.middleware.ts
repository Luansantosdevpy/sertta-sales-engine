import type { NextFunction, Request, Response } from 'express';
import { getRolePermissions } from '../auth/permissions';
import type { Role } from '../auth/roles';
import { requestContext } from '../context/request-context';
import { UnauthorizedError } from '../errors/application-errors';
import { extractBearerToken } from '../security/extract-bearer-token';
import { tokenService } from '../security/token.service';

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req);
    const claims = tokenService.verifyAccessToken(token);

    if (claims.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    const role = claims.role as Role;

    req.auth = {
      userId: claims.sub,
      tenantId: claims.tenantId,
      role,
      permissions: getRolePermissions(role)
    };

    requestContext.setActor({
      userId: claims.sub,
      role
    });

    next();
  } catch (error) {
    next(error);
  }
};
