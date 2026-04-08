import { ConflictError, NotFoundError } from '../../../shared/errors/application-errors';
import type { TenantContext } from '../../../shared/tenancy/tenant-context';
import { requireTenantContext } from '../../../shared/tenancy/tenant-scope';
import { PlanModel } from '../../plans/infrastructure/plan.model';
import { tenantsRepository } from '../infrastructure/tenants.repository';
import type { CreateTenantDto } from './tenants.dto';

export const tenantsService = {
  async createTenant(dto: CreateTenantDto) {
    const existing = await tenantsRepository.findBySlug(dto.slug);

    if (existing) {
      throw new ConflictError('Tenant slug already exists');
    }

    const plan = await PlanModel.findById(dto.planId);

    if (!plan || plan['status'] !== 'active') {
      throw new NotFoundError('Plan not found or inactive');
    }

    const limits = plan['limits'] as {
      maxUsers: number;
      maxChannels: number;
      maxAutomations: number;
      monthlyMessages: number;
    };

    const created = await tenantsRepository.create({
      name: dto.name,
      slug: dto.slug,
      planId: dto.planId,
      ownerUserId: dto.ownerUserId,
      effectiveLimits: limits
    });

    await tenantsRepository.createOwnerMembership(String(created['_id']), dto.ownerUserId);

    return {
      id: String(created['_id']),
      name: String(created['name']),
      slug: String(created['slug']),
      status: String(created['status']),
      planId: String(created['planId'])
    };
  },

  async getTenantById(tenantContext: TenantContext | undefined, tenantId: string) {
    const scoped = requireTenantContext(tenantContext);

    if (scoped.tenantId !== tenantId) {
      throw new NotFoundError('Tenant not found');
    }

    const tenant = await tenantsRepository.findById(tenantId);

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    return tenant;
  },

  async listUserTenants(userId: string) {
    const tenants = await tenantsRepository.listForUser(userId);

    return tenants.map((tenant) => ({
      id: String(tenant['_id']),
      name: String(tenant['name']),
      slug: String(tenant['slug']),
      status: String(tenant['status']),
      planId: String(tenant['planId'])
    }));
  }
};
