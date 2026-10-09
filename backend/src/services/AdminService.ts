import { AdminEntity, AdminInput, IAdminRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { PasswordHasher } from '../utils/passwordHasher';

export type PublicAdmin = Omit<AdminEntity, 'password'>;

const toPublic = ({ password: _password, ...rest }: AdminEntity): PublicAdmin => rest;

export class AdminService {
  constructor(
    private readonly admins: IAdminRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async list() {
    return (await this.admins.findAll()).map(toPublic);
  }

  async get(id: number) {
    const admin = await this.admins.findById(id);
    if (!admin) throw new AppError(404, 'Admin not found');
    return toPublic(admin);
  }

  async create(data: AdminInput) {
    await this.assertUnique(data.username, data.email);
    const admin = await this.admins.create({ ...data, password: await this.hasher.hash(data.password) });
    return toPublic(admin);
  }

  async update(id: number, data: Partial<AdminInput>) {
    if (!(await this.admins.findById(id))) throw new AppError(404, 'Admin not found');
    await this.assertUnique(data.username, data.email, id);
    const patch = { ...data };
    if (patch.password) patch.password = await this.hasher.hash(patch.password);
    return toPublic(await this.admins.update(id, patch));
  }

  async remove(id: number, currentAdminId: number) {
    if (id === currentAdminId) throw new AppError(400, 'You cannot delete your own account');
    if (!(await this.admins.findById(id))) throw new AppError(404, 'Admin not found');
    await this.admins.delete(id);
  }

  private async assertUnique(username?: string, email?: string, exceptId?: number) {
    if (username) {
      const found = await this.admins.findByUsername(username);
      if (found && found.id !== exceptId) throw new AppError(409, 'Username already exists');
    }
    if (email) {
      const found = await this.admins.findByEmail(email);
      if (found && found.id !== exceptId) throw new AppError(409, 'Email already exists');
    }
  }
}
