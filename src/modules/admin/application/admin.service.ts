import { BadRequestError } from '../../../shared/errors/application-errors';
import { adminRepository } from '../infrastructure/admin.repository';

const normalizePagination = (page?: number, limit?: number) => {
  const normalizedPage = page && page > 0 ? page : 1;
  const normalizedLimit = limit && limit > 0 ? Math.min(limit, 100) : 20;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  };
};

export const adminService = {
  async listTenants(input: { status?: string; page?: number; limit?: number }) {
    const pagination = normalizePagination(input.page, input.limit);

    const result = await adminRepository.listTenants({
      ...(input.status ? { status: input.status } : {}),
      skip: pagination.skip,
      limit: pagination.limit
    });

    return {
      data: result.items.map((tenant) => tenant.toJSON()),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / pagination.limit))
      }
    };
  },

  async listUsers(input: { status?: string; page?: number; limit?: number }) {
    const pagination = normalizePagination(input.page, input.limit);

    const result = await adminRepository.listUsers({
      ...(input.status ? { status: input.status } : {}),
      skip: pagination.skip,
      limit: pagination.limit
    });

    return {
      data: result.items.map((user) => ({
        id: String(user['_id']),
        email: String(user['email']),
        fullName: String(user['fullName']),
        status: String(user['status']),
        createdAt: user['createdAt'],
        updatedAt: user['updatedAt']
      })),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / pagination.limit))
      }
    };
  },

  async listTenantMemberships(input: { tenantId?: string; page?: number; limit?: number }) {
    const pagination = normalizePagination(input.page, input.limit);

    const result = await adminRepository.listTenantMemberships({
      ...(input.tenantId ? { tenantId: input.tenantId } : {}),
      skip: pagination.skip,
      limit: pagination.limit
    });

    return {
      data: result.items.map((item) => item.toJSON()),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / pagination.limit))
      }
    };
  },

  assertSystemAdmin(role?: string) {
    if (role !== 'system_admin') {
      throw new BadRequestError('System admin context is required');
    }
  }
};
