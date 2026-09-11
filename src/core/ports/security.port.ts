export interface AuthTokenPayload {
  userId: string;
  name: string;
  email?: string;
  provider: string;
  [key: string]: unknown;
}

export interface IPasswordHasher {
  hash(plainText: string): Promise<string>;
  compare(plainText: string, hash: string): Promise<boolean>;
}

export interface ITokenService {
  signToken(payload: AuthTokenPayload, expiresIn?: string): Promise<string>;
  verifyToken(token: string): Promise<AuthTokenPayload | null>;
}
