import { IFileRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { fileUrlOf } from './FileService';

type WithAvatar = { password: string; avatarId?: number | null };
export type PublicAccount<T extends WithAvatar> = Omit<T, 'password'> & { avatarUrl: string | null };

// Validates avatar references and turns account rows into public responses (no password, avatarUrl added)
export class AvatarResolver {
  constructor(private readonly files: Pick<IFileRepository, 'findById' | 'findAll'>) {}

  async assertExists(avatarId?: number | null) {
    if (avatarId == null) return;
    if (!(await this.files.findById(avatarId))) throw new AppError(400, 'Avatar file not found');
  }

  async toPublic<T extends WithAvatar>(accounts: T[]): Promise<PublicAccount<T>[]> {
    const needsFiles = accounts.some((a) => a.avatarId != null);
    const byId = new Map<number, string>();
    if (needsFiles) (await this.files.findAll()).forEach((f) => byId.set(f.id, f.filename));
    return accounts.map(({ password: _password, ...rest }) => ({
      ...rest,
      avatarUrl: rest.avatarId != null && byId.has(rest.avatarId) ? fileUrlOf(byId.get(rest.avatarId)!) : null,
    }));
  }
}
