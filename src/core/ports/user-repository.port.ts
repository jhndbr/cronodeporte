import { UserProfile, UserStats } from '../domain/types';

export interface UserEntity extends UserProfile {
  passwordHash?: string;
  updatedAt?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(user: Omit<UserEntity, 'createdAt'> & { createdAt?: string }): Promise<UserEntity>;
  update(id: string, data: Partial<UserEntity>): Promise<UserEntity>;
  updateStats(userId: string, stats: UserStats): Promise<UserStats>;
  getAll(): Promise<UserEntity[]>;
}
