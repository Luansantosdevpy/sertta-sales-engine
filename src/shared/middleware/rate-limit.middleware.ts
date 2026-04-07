import rateLimit from 'express-rate-limit';
import { config } from '../../config';
import { ERROR_CODES } from '../errors/error-model';

export const apiRateLimitMiddleware = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: ERROR_CODES.rateLimited,
      message: 'Too many requests'
    }
  }
});
