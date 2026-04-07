import jwt, { type SignOptions, type VerifyOptions } from 'jsonwebtoken';
import { config } from '../../config';
import type { Role } from '../auth/roles';

export interface AccessTokenClaims {
  sub: string;
  tenantId: string;
  role: Role;
  type: 'access';
}

export interface RefreshTokenClaims {
  sub: string;
  tenantId: string;
  type: 'refresh';
}

const baseSignOptions: SignOptions = {
  issuer: config.jwt.issuer,
  audience: config.jwt.audience
};

const baseVerifyOptions: VerifyOptions = {
  issuer: config.jwt.issuer,
  audience: config.jwt.audience
};

export const tokenService = {
  signAccessToken(claims: Omit<AccessTokenClaims, 'type'>): string {
    const expiresIn = config.jwt.accessExpiresIn as NonNullable<SignOptions['expiresIn']>;

    return jwt.sign(
      {
        ...claims,
        type: 'access'
      },
      config.jwt.secret,
      {
        ...baseSignOptions,
        expiresIn
      }
    );
  },

  signRefreshToken(claims: Omit<RefreshTokenClaims, 'type'>): string {
    const expiresIn = config.jwt.refreshExpiresIn as NonNullable<SignOptions['expiresIn']>;

    return jwt.sign(
      {
        ...claims,
        type: 'refresh'
      },
      config.jwt.secret,
      {
        ...baseSignOptions,
        expiresIn
      }
    );
  },

  verifyAccessToken(token: string): AccessTokenClaims {
    return jwt.verify(token, config.jwt.secret, baseVerifyOptions) as unknown as AccessTokenClaims;
  },

  verifyRefreshToken(token: string): RefreshTokenClaims {
    return jwt.verify(token, config.jwt.secret, baseVerifyOptions) as unknown as RefreshTokenClaims;
  }
};
