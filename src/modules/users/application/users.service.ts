import { ConflictError, NotFoundError } from '../../../shared/errors/application-errors';
import { hashPassword } from '../../../shared/security/password.service';
import { usersRepository } from '../infrastructure/users.repository';
import type { CreateUserDto } from './users.dto';

export const usersService = {
  async createUser(dto: CreateUserDto) {
    const existing = await usersRepository.findByEmail(dto.email);

    if (existing) {
      throw new ConflictError('Email already in use');
    }

    const passwordHash = await hashPassword(dto.password);

    const created = await usersRepository.create({
      email: dto.email,
      fullName: dto.fullName,
      passwordHash,
      ...(dto.phoneNumber ? { phoneNumber: dto.phoneNumber } : {})
    });

    return {
      id: String(created['_id']),
      email: String(created['email']),
      fullName: String(created['fullName']),
      status: String(created['status'])
    };
  },

  async getMe(userId: string) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: String(user['_id']),
      email: String(user['email']),
      fullName: String(user['fullName']),
      status: String(user['status']),
      lastLoginAt: user['lastLoginAt']
    };
  }
};
