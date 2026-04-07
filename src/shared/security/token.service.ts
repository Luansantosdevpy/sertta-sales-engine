import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../../config';

export interface AccessTokenClaims {
  sub: string;
  tenantId: string;
  role: string;
}

export const tokenService = {
  signAccessToken(claims: AccessTokenClaims): string {
    const expiresIn = config.jwt.accessExpiresIn as NonNullable<SignOptions['expiresIn']>;

    return jwt.sign(claims, config.jwt.secret, {
      expiresIn
    });
  },

  verifyAccessToken(token: string): AccessTokenClaims {
    return jwt.verify(token, config.jwt.secret) as AccessTokenClaims;
  }
};
