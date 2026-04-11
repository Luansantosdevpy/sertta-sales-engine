import type { RequestHandler } from 'express';
import { apiResponse } from '../../../shared/http/api-response';
import { appointmentsService } from '../application/appointments.service';

export const createAppointmentHandler: RequestHandler = async (req, res) => {
  const result = await appointmentsService.create(req.tenantContext, req.auth!.userId, req.body);
  return apiResponse.success(res, { statusCode: 201, data: result });
};

export const listAppointmentsHandler: RequestHandler = async (req, res) => {
  const status = req.query['status'];
  const result = await appointmentsService.list(
    req.tenantContext,
    typeof status === 'string'
      ? (status as 'pending_confirmation' | 'confirmed' | 'completed' | 'canceled')
      : undefined
  );

  return apiResponse.success(res, { data: result });
};
