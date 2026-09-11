import { AuthService } from './auth.service';
import { PrismaUserRepository } from '@/infra/repositories/prisma/prisma-user.repository';
import { BcryptHasherService } from '@/infra/security/bcrypt-hasher.service';
import { JwtTokenService } from '@/infra/security/jwt-token.service';
import { cookies } from 'next/headers';
import { UserProfile } from '@/core/domain/types';

let authServiceInstance: AuthService | null = null;

export function getAuthService(): AuthService {
  if (!authServiceInstance) {
    const userRepo = new PrismaUserRepository();
    const passwordHasher = new BcryptHasherService(10);
    const tokenService = new JwtTokenService();
    authServiceInstance = new AuthService(userRepo, passwordHasher, tokenService);
  }
  return authServiceInstance;
}

export async function getCurrentUserFromRequest(request?: Request): Promise<UserProfile | null> {
  const authService = getAuthService();

  // 1. Intentar leer desde Authorization header (Bearer <token>)
  if (request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const user = await authService.verifySession(token);
      if (user) return user;
    }
  }

  // 2. Intentar leer desde cookies HTTP
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('crono_session')?.value;
    if (token) {
      const user = await authService.verifySession(token);
      if (user) return user;
    }
  } catch {
    // Si cookies() falla en un contexto no-request
  }

  return null;
}
