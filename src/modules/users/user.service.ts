import { IUserRepository } from '@/core/ports/user-repository.port';
import { PrismaUserRepository } from '@/infra/repositories/prisma/prisma-user.repository';
import { UserProfile, UserStats, PredictionTicket } from '@/core/domain/types';

export class UserService {
  private static instance: UserService;
  private readonly repo: IUserRepository;

  constructor(repo?: IUserRepository) {
    this.repo = repo || new PrismaUserRepository();
  }

  public static getInstance(repo?: IUserRepository): UserService {
    if (!UserService.instance || repo) {
      UserService.instance = new UserService(repo);
    }
    return UserService.instance;
  }

  private getDefaultStats(): UserStats {
    return {
      totalPredictions: 0,
      correct: 0,
      incorrect: 0,
      pending: 0,
      accuracyRate: 0,
      totalPoints: 0,
    };
  }

  async getOrCreateUser(params: {
    id?: string;
    name: string;
    email?: string;
    avatarUrl?: string;
    provider?: 'google' | 'guest' | 'credentials';
  }): Promise<UserProfile> {
    if (params.id) {
      const existing = await this.repo.findById(params.id);
      if (existing) return existing;
    }

    if (params.email) {
      const existingByEmail = await this.repo.findByEmail(params.email);
      if (existingByEmail) return existingByEmail;
    }

    const newUser = await this.repo.create({
      id: params.id || 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: params.name || 'Aficionado UFC',
      email: params.email,
      avatarUrl:
        params.avatarUrl ||
        'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(params.name || 'UFC'),
      provider: params.provider || 'guest',
      stats: this.getDefaultStats(),
    });

    return newUser;
  }

  async getUser(id: string): Promise<UserProfile | null> {
    return this.repo.findById(id);
  }

  /**
   * Recalcula estadísticas a partir de una lista de boletos y actualiza en persistencia
   */
  async recalculateUserStatsFromTickets(userId: string, tickets: PredictionTicket[]): Promise<UserStats | null> {
    const user = await this.repo.findById(userId);
    if (!user) return null;

    let totalPicks = 0;
    let correct = 0;
    let incorrect = 0;
    let pending = 0;
    let totalPoints = 0;

    for (const ticket of tickets) {
      for (const pick of ticket.picks) {
        totalPicks++;
        if (pick.status === 'CORRECT') correct++;
        else if (pick.status === 'INCORRECT') incorrect++;
        else pending++;
      }
      if (ticket.status === 'WON') {
        totalPoints += ticket.pointsAwarded || 10;
      }
    }

    const resolvedCount = correct + incorrect;
    const accuracyRate = resolvedCount > 0 ? Math.round((correct / resolvedCount) * 100) : 0;

    const newStats: UserStats = {
      totalPredictions: totalPicks,
      correct,
      incorrect,
      pending,
      accuracyRate,
      totalPoints,
    };

    return this.repo.updateStats(userId, newStats);
  }
}
