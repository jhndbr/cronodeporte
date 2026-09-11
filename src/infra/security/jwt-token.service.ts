import { SignJWT, jwtVerify } from 'jose';
import { ITokenService, AuthTokenPayload } from '@/core/ports/security.port';

export class JwtTokenService implements ITokenService {
  private readonly secretKey: Uint8Array;

  constructor(secret?: string) {
    const rawSecret = secret || process.env.JWT_SECRET || 'cronodeporte_dev_secret_key_needs_32_characters!';
    this.secretKey = new TextEncoder().encode(rawSecret.padEnd(32, '0'));
  }

  async signToken(payload: AuthTokenPayload, expiresIn: string = '7d'): Promise<string> {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresIn)
      .sign(this.secretKey);
  }

  async verifyToken(token: string): Promise<AuthTokenPayload | null> {
    try {
      const { payload } = await jwtVerify(token, this.secretKey);
      return payload as unknown as AuthTokenPayload;
    } catch {
      return null;
    }
  }
}
