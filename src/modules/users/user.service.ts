import { FileSportRepository } from '@/infra/storage/file-sport-repository';
import { UserProfile, UserStats } from '@/core/domain/types';

export class UserService {
  private static instance: UserService;
  private repo: FileSportRepository;

  private constructor() {
    this.repo = FileSportRepository.getInstance();
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
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
    const users = await this.repo.getUsers();

    if (params.id) {
      const existing = users.find((u) => u.id === params.id);
      if (existing) return existing;
    }

    if (params.email) {
      const existingByEmail = users.find((u) => u.email === params.email);
      if (existingByEmail) return existingByEmail;
    }

    const newUser: UserProfile = {
      id: params.id || 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: params.name || 'Aficionado UFC',
      email: params.email,
      avatarUrl:
        params.avatarUrl ||
        'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(params.name || 'UFC'),
      provider: params.provider || 'guest',
      createdAt: new Date().toISOString(),
      stats: this.getDefaultStats(),
    };

    await this.repo.saveUser(newUser);
    return newUser;
  }

  async getUser(id: string): Promise<UserProfile | null> {
    return this.repo.getUserById(id);
  }

  async updateUserStats(userId: string): Promise<UserProfile | null> {
    const user = await this.repo.getUserById(userId);
    if (!user) return null;

    const tickets = await this.repo.getTicketsByUserId(userId);
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

    user.stats = {
      totalPredictions: totalPicks,
      correct,
      incorrect,
      pending,
      accuracyRate,
      totalPoints,
    };

    await this.repo.saveUser(user);
    return user;
  }
}
