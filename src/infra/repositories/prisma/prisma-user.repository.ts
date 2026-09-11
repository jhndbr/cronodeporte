import { prisma } from '@/infra/database/prisma';
import { IUserRepository, UserEntity } from '@/core/ports/user-repository.port';
import { UserStats } from '@/core/domain/types';

export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { stats: true },
    });
    if (!user) return null;

    return this.mapToEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { stats: true },
    });
    if (!user) return null;

    return this.mapToEntity(user);
  }

  async create(data: Omit<UserEntity, 'createdAt'> & { createdAt?: string }): Promise<UserEntity> {
    const user = await prisma.user.create({
      data: {
        id: data.id,
        name: data.name,
        email: data.email?.toLowerCase(),
        passwordHash: data.passwordHash,
        avatarUrl: data.avatarUrl,
        provider: data.provider || 'guest',
        stats: {
          create: {
            totalPredictions: data.stats?.totalPredictions || 0,
            correct: data.stats?.correct || 0,
            incorrect: data.stats?.incorrect || 0,
            pending: data.stats?.pending || 0,
            accuracyRate: data.stats?.accuracyRate || 0,
            totalPoints: data.stats?.totalPoints || 0,
          },
        },
      },
      include: { stats: true },
    });

    return this.mapToEntity(user);
  }

  async update(id: string, data: Partial<UserEntity>): Promise<UserEntity> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.email && { email: data.email.toLowerCase() }),
        ...(data.passwordHash && { passwordHash: data.passwordHash }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        ...(data.provider && { provider: data.provider }),
      },
      include: { stats: true },
    });

    return this.mapToEntity(user);
  }

  async updateStats(userId: string, stats: UserStats): Promise<UserStats> {
    const updated = await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalPredictions: stats.totalPredictions,
        correct: stats.correct,
        incorrect: stats.incorrect,
        pending: stats.pending,
        accuracyRate: stats.accuracyRate,
        totalPoints: stats.totalPoints,
      },
      create: {
        userId,
        totalPredictions: stats.totalPredictions,
        correct: stats.correct,
        incorrect: stats.incorrect,
        pending: stats.pending,
        accuracyRate: stats.accuracyRate,
        totalPoints: stats.totalPoints,
      },
    });

    return {
      totalPredictions: updated.totalPredictions,
      correct: updated.correct,
      incorrect: updated.incorrect,
      pending: updated.pending,
      accuracyRate: updated.accuracyRate,
      totalPoints: updated.totalPoints,
    };
  }

  async getAll(): Promise<UserEntity[]> {
    const users = await prisma.user.findMany({
      include: { stats: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map((u) => this.mapToEntity(u));
  }

  private mapToEntity(user: any): UserEntity {
    return {
      id: user.id,
      name: user.name,
      email: user.email ?? undefined,
      passwordHash: user.passwordHash ?? undefined,
      avatarUrl: user.avatarUrl ?? undefined,
      provider: user.provider as 'google' | 'guest' | 'credentials',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt?.toISOString(),
      stats: {
        totalPredictions: user.stats?.totalPredictions ?? 0,
        correct: user.stats?.correct ?? 0,
        incorrect: user.stats?.incorrect ?? 0,
        pending: user.stats?.pending ?? 0,
        accuracyRate: user.stats?.accuracyRate ?? 0,
        totalPoints: user.stats?.totalPoints ?? 0,
      },
    };
  }
}
