import { config } from '../../../config';
import { ROLES, type Role } from '../../../shared/auth/roles';
import { UnauthorizedError } from '../../../shared/errors/application-errors';
import { verifyPassword } from '../../../shared/security/password.service';
import { tokenService } from '../../../shared/security/token.service';
import { authRepository } from '../infrastructure/auth.repository';
import type { LoginDto, RefreshTokenDto } from './auth.dto';

const PLATFORM_TENANT_ID = 'platform';

const isConfiguredSystemAdminEmail = (email: string): boolean => {
  return config.auth.systemAdminEmails.includes(email.trim().toLowerCase());
};

export const authService = {
  async login(dto: LoginDto) {
    const user = (await authRepository.findUserByEmail(dto.email)) as Record<string, unknown> | null;

    if (!user || user['status'] !== 'active') {
      throw new UnauthorizedError('Invalid credentials');
    }

    const passwordHash = String(user['passwordHash'] ?? '');
    const passwordOk = await verifyPassword(dto.password, passwordHash);

    if (!passwordOk) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const userId = String(user['_id']);
    const normalizedEmail = String(user['email']).toLowerCase();

    const canUseSystemAdminLogin = isConfiguredSystemAdminEmail(normalizedEmail);

    if (!dto.tenantId) {
      if (!canUseSystemAdminLogin) {
        throw new UnauthorizedError('tenantId is required for non-system-admin users');
      }

      const role: Role = ROLES.systemAdmin;

      const accessToken = tokenService.signAccessToken({
        sub: userId,
        tenantId: PLATFORM_TENANT_ID,
        role
      });

      const refreshToken = tokenService.signRefreshToken({
        sub: userId,
        tenantId: PLATFORM_TENANT_ID,
        role
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: userId,
          email: String(user['email']),
          fullName: String(user['fullName'])
        },
        membership: {
          role,
          tenantId: PLATFORM_TENANT_ID
        }
      };
    }

    const membership = (await authRepository.findActiveMembership(dto.tenantId, userId)) as Record<string, unknown> | null;

    if (!membership) {
      throw new UnauthorizedError('User does not belong to the specified tenant');
    }

    const role = String(membership['role']) as Role;

    const accessToken = tokenService.signAccessToken({
      sub: userId,
      tenantId: dto.tenantId,
      role
    });

    const refreshToken = tokenService.signRefreshToken({
      sub: userId,
      tenantId: dto.tenantId,
      role
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        email: String(user['email']),
        fullName: String(user['fullName'])
      },
      membership: {
        role,
        tenantId: dto.tenantId
      }
    };
  },

  async refresh(dto: RefreshTokenDto) {
    const payload = tokenService.verifyRefreshToken(dto.refreshToken);

    const accessToken = tokenService.signAccessToken({
      sub: payload.sub,
      tenantId: payload.tenantId,
      role: payload.role
    });

    return {
      accessToken
    };
  }
};
