import { TenantModel } from './tenant.model';
import { TenantMemberModel } from '../../tenant-memberships/infrastructure/tenant-member.model';
import { withTenantScope } from '../../../shared/tenancy/tenant-scope';

export const tenantsRepository = {
  async create(data: {
    name: string;
    slug: string;
    planId: string;
    ownerUserId: string;
    effectiveLimits: {
      maxUsers: number;
      maxChannels: number;
      maxAutomations: number;
      monthlyMessages: number;
    };
  }) {
    return TenantModel.create({
      ...data,
      planVersion: 1,
      status: 'active',
      billingStatus: 'pending'
    });
  },

  async findById(tenantId: string) {
    return TenantModel.findById(tenantId);
  },

  async findBySlug(slug: string) {
    return TenantModel.findOne({ slug });
  },

  async listForUser(userId: string) {
    const memberships = await TenantMemberModel.find({ userId, status: 'active' });
    const tenantIds = memberships.map((membership) => membership['tenantId']);

    return TenantModel.find({ _id: { $in: tenantIds }, status: 'active' }).sort({ createdAt: -1 });
  },

  async createOwnerMembership(tenantId: string, userId: string) {
    return TenantMemberModel.create(
      withTenantScope(tenantId, {
        userId,
        role: 'tenant_owner',
        status: 'active',
        invitedAt: new Date(),
        acceptedAt: new Date()
      })
    );
  }
};
