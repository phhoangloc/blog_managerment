import { randomBytes } from 'crypto';
import { IAdminRepository, IUserRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { PasswordHasher } from '../utils/passwordHasher';
import { Role, TokenService } from '../utils/tokenService';
import { GoogleIdentityVerifier } from './GoogleVerifier';

const MIN_USERNAME = 6;

export class AuthService {
  constructor(
    private readonly admins: IAdminRepository,
    private readonly users: IUserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    // undefined when GOOGLE_CLIENT_ID is not configured
    private readonly google?: GoogleIdentityVerifier,
  ) {}

  async login(role: Role, username: string, password: string) {
    const repo = role === 'admin' ? this.admins : this.users;
    const account = await repo.findByUsername(username);
    if (!account || !(await this.hasher.compare(password, account.password))) {
      throw new AppError(401, 'Invalid username or password');
    }
    return { token: this.tokens.sign({ id: account.id, role }), role };
  }

  // Google proves the email: log in the user that owns it, or create one on the first login
  async loginWithGoogle(idToken: string) {
    if (!this.google) throw new AppError(503, 'Google login is not configured');

    let identity;
    try {
      identity = await this.google.verify(idToken);
    } catch {
      throw new AppError(401, 'Invalid Google token');
    }
    if (!identity.emailVerified) throw new AppError(401, 'Google email is not verified');

    const email = identity.email.toLowerCase();
    const user = (await this.users.findByEmail(email)) ?? (await this.createFromGoogle(email));
    return { token: this.tokens.sign({ id: user.id, role: 'user' }), role: 'user' as const };
  }

  // random password: nobody knows it, so the account is reachable only through Google until an admin sets one
  private async createFromGoogle(email: string) {
    const password = await this.hasher.hash(randomBytes(32).toString('hex'));
    return this.users.create({ username: await this.uniqueUsername(email), email, password });
  }

  // from the email local part: lowercase letters, digits and _, at least 6 characters, unique
  private async uniqueUsername(email: string) {
    let base = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    while (base.length < MIN_USERNAME) base += Math.floor(Math.random() * 10);
    for (let n = 1; n < 100; n++) {
      const candidate = n === 1 ? base : `${base}${n}`;
      if (!(await this.users.findByUsername(candidate))) return candidate;
    }
    return `${base}${randomBytes(3).toString('hex')}`;
  }
}
