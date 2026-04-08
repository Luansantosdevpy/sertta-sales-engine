import { z } from 'zod';
import { objectIdSchema } from '../../../shared/validation/common.schemas';

export const planParamsSchema = z.object({
  planId: objectIdSchema
});
