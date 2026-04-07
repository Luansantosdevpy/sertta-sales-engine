import type { Response } from 'express';
import type { PaginationMeta } from '../pagination/pagination';

interface ApiSuccessOptions<TData> {
  statusCode?: number;
  data: TData;
  meta?: Record<string, unknown>;
}

export const apiResponse = {
  success<TData>(res: Response, options: ApiSuccessOptions<TData>) {
    const statusCode = options.statusCode ?? 200;

    return res.status(statusCode).json({
      data: options.data,
      meta: options.meta,
      requestId: res.req.requestId
    });
  },

  paginated<TData>(res: Response, data: TData, pagination: PaginationMeta) {
    return res.status(200).json({
      data,
      meta: {
        pagination
      },
      requestId: res.req.requestId
    });
  },

  noContent(res: Response) {
    return res.status(204).send();
  }
};
