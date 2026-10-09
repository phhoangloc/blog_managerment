import { IUserRepository, UserInput } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { PasswordHasher } from '../utils/passwordHasher';
import { AvatarResolver } from './AvatarResolver';

export class UserService {
  constructor(
    private readonly users: IUserRepository,
    private readonly hasher: PasswordHasher,
    private readonly avatars: AvatarResolver,
  ) {}

  async list() {
    return this.avatars.toPublic(await this.users.findAll());
  }

  async get(id: number) {
    const user = await this.users.findById(id);
    if (!user) throw new AppError(404, 'User not found');
    return (await this.avatars.toPublic([user]))[0];
  }

  async create(data: UserInput) {
    await this.assertUnique(data.username, data.email);
    await this.avatars.assertExists(data.avatarId);
    const user = await this.users.create({ ...data, password: await this.hasher.hash(data.password) });
    return (await this.avatars.toPublic([user]))[0];
  }

  async update(id: number, data: Partial<UserInput>) {
    if (!(await this.users.findById(id))) throw new AppError(404, 'User not found');
    await this.assertUnique(data.username, data.email, id);
    await this.avatars.assertExists(data.avatarId);
    const patch = { ...data };
    if (patch.password) patch.password = await this.hasher.hash(patch.password);
    const user = await this.users.update(id, patch);
    return (await this.avatars.toPublic([user]))[0];
  }

  async remove(id: number) {
    if (!(await this.users.findById(id))) throw new AppError(404, 'User not found');
    await this.users.delete(id);
  }

  private async assertUnique(username?: string, email?: string, exceptId?: number) {
    if (username) {
      const found = await this.users.findByUsername(username);
      if (found && found.id !== exceptId) throw new AppError(409, 'Username already exists');
    }
    if (email) {
      const found = await this.users.findByEmail(email);
      if (found && found.id !== exceptId) throw new AppError(409, 'Email already exists');
    }
  }
}
