import type { Request } from 'express';
import { UnauthorizedError } from '../errors/application-errors';

export const extractBearerToken = (req: Request): string => {
  const authorization = req.header('authorization');

  if (!authorization) {
    throw new UnauthorizedError('Missing authorization header');
  }

  const [scheme, token] = authorization.split(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    throw new UnauthorizedError('Invalid authorization header format');
  }

  return token;
};
