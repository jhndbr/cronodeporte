import bcrypt from 'bcryptjs';
import { IPasswordHasher } from '@/core/ports/security.port';

export class BcryptHasherService implements IPasswordHasher {
  private readonly saltRounds: number;

  constructor(saltRounds: number = 10) {
    this.saltRounds = saltRounds;
  }

  async hash(plainText: string): Promise<string> {
    return bcrypt.hash(plainText, this.saltRounds);
  }

  async compare(plainText: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plainText, hash);
  }
}
