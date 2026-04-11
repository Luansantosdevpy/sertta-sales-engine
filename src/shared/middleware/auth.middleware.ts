import type { NextFunction, Request, Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { TenantMemberModel } from '../../modules/tenant-memberships/infrastructure/tenant-member.model';
import { getRolePermissions } from '../auth/permissions';
import { ROLES, type Role } from '../auth/roles';
import { requestContext } from '../context/request-context';
import { ForbiddenError, UnauthorizedError } from '../errors/application-errors';
import { extractBearerToken } from '../security/extract-bearer-token';
import { tokenService } from '../security/token.service';
import { resolveTenantContext } from '../tenancy/tenant-context';
import { assertTenantMatchesAuth, resolveTenantIdForRequest } from '../tenancy/tenant-resolution';

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractBearerToken(req);
    const claims = tokenService.verifyAccessToken(token);

    if (claims.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    const tokenRole = claims.role as Role;
    const resolvedTenantId = resolveTenantIdForRequest(req) ?? claims.tenantId;

    let effectiveRole: Role = tokenRole;

    if (tokenRole !== ROLES.systemAdmin) {
      assertTenantMatchesAuth(claims.tenantId, resolvedTenantId);

      const membership = await TenantMemberModel.findOne({
        tenantId: resolvedTenantId,
        userId: claims.sub,
        status: 'active'
      });

      if (!membership) {
        throw new ForbiddenError('No active tenant membership for this tenant', {
          tenantId: resolvedTenantId,
          userId: claims.sub
        });
      }

      effectiveRole = String(membership['role']) as Role;
    }

    req.auth = {
      userId: claims.sub,
      tenantId: resolvedTenantId,
      role: effectiveRole,
      permissions: getRolePermissions(effectiveRole)
    };

    req.tenantContext = resolveTenantContext({
      tenantId: resolvedTenantId,
      actorUserId: claims.sub,
      actorRole: effectiveRole
    });

    requestContext.setActor({
      userId: claims.sub,
      role: effectiveRole
    });
    requestContext.setTenant(resolvedTenantId);

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new UnauthorizedError('Access token expired'));
      return;
    }

    if (error instanceof JsonWebTokenError) {
      next(new UnauthorizedError('Invalid access token'));
      return;
    }

    next(error);
  }
};
