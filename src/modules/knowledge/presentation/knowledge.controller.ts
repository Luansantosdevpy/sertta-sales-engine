import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { knowledgeService } from '../application/knowledge.service';

export const createKnowledgeDocumentHandler: RequestHandler = async (req, res) => {
  const result = await knowledgeService.create(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listKnowledgeDocumentsHandler: RequestHandler = async (req, res) => {
  const status = req.query['status'];
  const result = await knowledgeService.list(
    req.tenantContext,
    typeof status === 'string' ? (status as 'draft' | 'active' | 'archived') : undefined
  );
  return apiResponse.success(res, { data: result });
};
