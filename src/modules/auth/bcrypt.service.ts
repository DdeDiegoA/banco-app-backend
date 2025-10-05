import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  private readonly pepper = process.env.BCRYPT_PEPPER;
  private readonly saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

  constructor() {
    if (!this.pepper) {
      throw new Error('BCRYPT_PEPPER is not defined');
    }
    if (!this.saltRounds) {
      throw new Error('BCRYPT_SALT_ROUNDS is not defined');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const pwd = password + this.pepper;
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(pwd, salt);
  }

  async comparePasswords(hash: string, password: string): Promise<boolean> {
    const pwd = password + this.pepper;
    return await bcrypt.compare(pwd, hash);
  }
}
