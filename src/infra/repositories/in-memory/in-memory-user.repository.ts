import { IUserRepository, UserEntity } from '@/core/ports/user-repository.port';
import { UserStats } from '@/core/domain/types';

export class InMemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  async findById(id: string): Promise<UserEntity | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    for (const user of this.users.values()) {
      if (user.email && user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  async create(user: Omit<UserEntity, 'createdAt'> & { createdAt?: string }): Promise<UserEntity> {
    const fullUser: UserEntity = {
      ...user,
      createdAt: user.createdAt || new Date().toISOString(),
      stats: user.stats || {
        totalPredictions: 0,
        correct: 0,
        incorrect: 0,
        pending: 0,
        accuracyRate: 0,
        totalPoints: 0,
      },
    };
    this.users.set(fullUser.id, fullUser);
    return fullUser;
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const existing = this.users.get(id);
    if (!existing) {
      throw new Error(`User with id ${id} not found`);
    }
    const updated: UserEntity = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.users.set(id, updated);
    return updated;
  }

  async updateStats(userId: string, stats: UserStats): Promise<UserStats> {
    const user = this.users.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    user.stats = { ...stats };
    this.users.set(userId, user);
    return user.stats;
  }

  async getAll(): Promise<UserEntity[]> {
    return Array.from(this.users.values());
  }

  clear(): void {
    this.users.clear();
  }
}
