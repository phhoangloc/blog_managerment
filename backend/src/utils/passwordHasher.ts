import bcrypt from 'bcryptjs';

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hashed: string): Promise<boolean>;
}

export class BcryptPasswordHasher implements PasswordHasher {
  hash(plain: string) {
    return bcrypt.hash(plain, 10);
  }
  compare(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
  }
}
