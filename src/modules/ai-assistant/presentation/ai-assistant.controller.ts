import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import { aiAssistantService } from '../application/ai-assistant.service';

export const getAssistantProfileHandler: RequestHandler = async (req, res) => {
  const scoped = requireTenantContext(req.tenantContext);
  const result = await aiAssistantService.getProfile(scoped.tenantId);
  return apiResponse.success(res, { data: result });
};

export const upsertAssistantProfileHandler: RequestHandler = async (req, res) => {
  const scoped = requireTenantContext(req.tenantContext);
  const result = await aiAssistantService.upsertProfile(scoped.tenantId, req.auth!.userId, req.body);
  return apiResponse.success(res, { data: result });
};

export const listAssistantRunsHandler: RequestHandler = async (req, res) => {
  const scoped = requireTenantContext(req.tenantContext);
  const result = await aiAssistantService.listRuns(scoped.tenantId);
  return apiResponse.success(res, { data: result });
};
