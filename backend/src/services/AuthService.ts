import { IAdminRepository, IUserRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { PasswordHasher } from '../utils/passwordHasher';
import { Role, TokenService } from '../utils/tokenService';

export class AuthService {
  constructor(
    private readonly admins: IAdminRepository,
    private readonly users: IUserRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
  ) {}

  async login(role: Role, username: string, password: string) {
    const repo = role === 'admin' ? this.admins : this.users;
    const account = await repo.findByUsername(username);
    if (!account || !(await this.hasher.compare(password, account.password))) {
      throw new AppError(401, 'Invalid username or password');
    }
    return { token: this.tokens.sign({ id: account.id, role }), role };
  }
}
