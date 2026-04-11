import { TenantModel } from '../../tenants/infrastructure/tenant.model';
import { UserModel } from '../../users/infrastructure/user.model';
import { TenantMemberModel } from '../../tenant-memberships/infrastructure/tenant-member.model';

export const adminRepository = {
  async listTenants(params: { status?: string; skip: number; limit: number }) {
    const filter = {
      ...(params.status ? { status: params.status } : {})
    };

    const [items, total] = await Promise.all([
      TenantModel.find(filter).sort({ createdAt: -1 }).skip(params.skip).limit(params.limit),
      TenantModel.countDocuments(filter)
    ]);

    return { items, total };
  },

  async listUsers(params: { status?: string; skip: number; limit: number }) {
    const filter = {
      ...(params.status ? { status: params.status } : {})
    };

    const [items, total] = await Promise.all([
      UserModel.find(filter).sort({ createdAt: -1 }).skip(params.skip).limit(params.limit),
      UserModel.countDocuments(filter)
    ]);

    return { items, total };
  },

  async listTenantMemberships(params: { tenantId?: string; skip: number; limit: number }) {
    const filter = {
      ...(params.tenantId ? { tenantId: params.tenantId } : {})
    };

    const [items, total] = await Promise.all([
      TenantMemberModel.find(filter).sort({ createdAt: -1 }).skip(params.skip).limit(params.limit),
      TenantMemberModel.countDocuments(filter)
    ]);

    return { items, total };
  }
};
