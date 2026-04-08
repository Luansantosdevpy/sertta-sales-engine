import { UserModel } from './user.model';

export const usersRepository = {
  async create(params: { email: string; fullName: string; passwordHash: string; phoneNumber?: string }) {
    return UserModel.create(params);
  },

  async findById(userId: string) {
    return UserModel.findById(userId);
  },

  async findByEmail(email: string) {
    return UserModel.findOne({ email });
  }
};

