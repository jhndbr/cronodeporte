import { IUserRepository, UserEntity } from '@/core/ports/user-repository.port';
import { IPasswordHasher, ITokenService, AuthTokenPayload } from '@/core/ports/security.port';
import { UserProfile } from '@/core/domain/types';

export interface AuthResult {
  user: UserProfile;
  token: string;
}

export class AuthService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenService: ITokenService
  ) {}

  async register(params: { email: string; password: string; name: string; avatarUrl?: string }): Promise<AuthResult> {
    const cleanEmail = params.email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Email inválido.');
    }

    if (!params.password || params.password.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres.');
    }

    const cleanName = params.name.trim() || 'Aficionado UFC';

    const existing = await this.userRepo.findByEmail(cleanEmail);
    if (existing) {
      throw new Error('El correo electrónico ya está registrado.');
    }

    const passwordHash = await this.passwordHasher.hash(params.password);
    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const user = await this.userRepo.create({
      id: userId,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      avatarUrl:
        params.avatarUrl ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      provider: 'credentials',
      stats: {
        totalPredictions: 0,
        correct: 0,
        incorrect: 0,
        pending: 0,
        accuracyRate: 0,
        totalPoints: 0,
      },
    });

    const token = await this.tokenService.signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
    });

    return { user: this.sanitizeUser(user), token };
  }

  async login(params: { email: string; password: string }): Promise<AuthResult> {
    const cleanEmail = params.email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(cleanEmail);

    if (!user || !user.passwordHash) {
      throw new Error('Credenciales inválidas.');
    }

    const isValid = await this.passwordHasher.compare(params.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Credenciales inválidas.');
    }

    const token = await this.tokenService.signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      provider: user.provider,
    });

    return { user: this.sanitizeUser(user), token };
  }

  async guestLogin(name?: string): Promise<AuthResult> {
    const chosenName = name?.trim() || 'Peleador_' + Math.floor(1000 + Math.random() * 9000);
    const userId = 'usr-guest-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const user = await this.userRepo.create({
      id: userId,
      name: chosenName,
      provider: 'guest',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(chosenName)}`,
      stats: {
        totalPredictions: 0,
        correct: 0,
        incorrect: 0,
        pending: 0,
        accuracyRate: 0,
        totalPoints: 0,
      },
    });

    const token = await this.tokenService.signToken({
      userId: user.id,
      name: user.name,
      provider: 'guest',
    });

    return { user: this.sanitizeUser(user), token };
  }

  async googleLogin(profile: { id?: string; email?: string; name: string; avatarUrl?: string }): Promise<AuthResult> {
    let user: UserEntity | null = null;

    if (profile.email) {
      user = await this.userRepo.findByEmail(profile.email.toLowerCase());
    }

    if (!user) {
      const userId = profile.id || 'usr-g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
      user = await this.userRepo.create({
        id: userId,
        name: profile.name || 'Aficionado UFC',
        email: profile.email?.toLowerCase(),
        avatarUrl:
          profile.avatarUrl ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.name || 'UFC')}`,
        provider: 'google',
        stats: {
          totalPredictions: 0,
          correct: 0,
          incorrect: 0,
          pending: 0,
          accuracyRate: 0,
          totalPoints: 0,
        },
      });
    }

    const token = await this.tokenService.signToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      provider: 'google',
    });

    return { user: this.sanitizeUser(user), token };
  }

  async verifySession(token: string): Promise<UserProfile | null> {
    const payload = await this.tokenService.verifyToken(token);
    if (!payload || !payload.userId) {
      return null;
    }

    const user = await this.userRepo.findById(payload.userId);
    if (!user) return null;

    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: UserEntity): UserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      provider: user.provider,
      createdAt: user.createdAt,
      stats: user.stats,
    };
  }
}
