import pino from 'pino';
import { config } from '../../config';

export const logger = pino({
  level: config.logger.level,
  base: null,
  redact: ['req.headers.authorization', 'authorization', 'password', 'token', '*.token']
});
