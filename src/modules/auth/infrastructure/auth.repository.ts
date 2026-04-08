import { UserModel } from '../../users/infrastructure/user.model';
import { TenantMemberModel } from '../../tenant-memberships/infrastructure/tenant-member.model';

export const authRepository = {
  async findUserByEmail(email: string) {
    return UserModel.findOne({ email });
  },

  async findActiveMembership(tenantId: string, userId: string) {
    return TenantMemberModel.findOne({ tenantId, userId, status: 'active' });
  }
};

