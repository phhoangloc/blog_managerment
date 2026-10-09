import path from 'path';
import { FileEntity, IFileRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { Role } from '../utils/tokenService';
import { FileStorage } from './FileStorage';

export const UPLOAD_URL_PREFIX = '/public/upload';

export const fileUrlOf = (filename: string) => `${UPLOAD_URL_PREFIX}/${encodeURIComponent(filename)}`;

export interface Actor {
  id: number;
  role: Role;
}

// Admins can view/edit/delete every file; users only the files they own
const canAccess = (file: FileEntity, actor: Actor) => actor.role === 'admin' || file.userId === actor.id;

export class FileService {
  constructor(
    private readonly files: IFileRepository,
    private readonly storage: FileStorage,
    private readonly users: { findAll(): Promise<{ id: number; username: string }[]> },
  ) {}

  async list(actor: Actor) {
    const all = await this.files.findAll();
    return this.decorate(actor.role === 'admin' ? all : all.filter((f) => f.userId === actor.id));
  }

  // only users upload; the owner is always the logged-in user
  async upload(input: { name: string; detail: string; originalName: string; buffer: Buffer }, actor: Actor) {
    if (actor.role !== 'user') throw new AppError(403, 'Only users can upload files');
    if (await this.files.findByName(input.name)) throw new AppError(409, 'File name already exists');
    // The URL is built from the name; the original extension is kept
    const filename = `${input.name}${path.extname(input.originalName).toLowerCase()}`;
    await this.storage.save(filename, input.buffer);
    try {
      const created = await this.files.create({ name: input.name, detail: input.detail, filename, userId: actor.id });
      return (await this.decorate([created]))[0];
    } catch (err) {
      await this.storage.remove(filename);
      throw err;
    }
  }

  async get(id: number, actor: Actor) {
    return (await this.decorate([await this.find(id, actor)]))[0];
  }

  async update(
    id: number,
    input: { name?: string; detail?: string; replacement?: { originalName: string; buffer: Buffer } },
    actor: Actor,
  ) {
    const file = await this.find(id, actor);

    const name = input.name ?? file.name;
    if (name !== file.name) {
      const clash = await this.files.findByName(name);
      if (clash && clash.id !== id) throw new AppError(409, 'File name already exists');
    }
    const ext = path.extname(input.replacement ? input.replacement.originalName : file.filename).toLowerCase();
    const filename = `${name}${ext}`;
    const renamed = filename !== file.filename;

    if (input.replacement) await this.storage.save(filename, input.replacement.buffer);
    else if (renamed) await this.storage.rename(file.filename, filename);

    try {
      const updated = await this.files.update(id, { name, filename, detail: input.detail ?? file.detail });
      // the old stored file is superseded once the record points at the new one
      if (input.replacement && renamed) await this.storage.remove(file.filename);
      return (await this.decorate([updated]))[0];
    } catch (err) {
      if (input.replacement) {
        if (renamed) await this.storage.remove(filename);
      } else if (renamed) {
        await this.storage.rename(filename, file.filename);
      }
      throw err;
    }
  }

  async remove(id: number, actor: Actor) {
    const file = await this.find(id, actor);
    await this.files.delete(id);
    await this.storage.remove(file.filename);
  }

  private async find(id: number, actor: Actor) {
    const file = await this.files.findById(id);
    if (!file) throw new AppError(404, 'File not found');
    if (!canAccess(file, actor)) throw new AppError(403, 'Forbidden');
    return file;
  }

  // adds url and the owner's username for display
  private async decorate(rows: FileEntity[]) {
    const names = new Map<number, string>();
    if (rows.some((f) => f.userId != null)) (await this.users.findAll()).forEach((u) => names.set(u.id, u.username));
    return rows.map((f) => ({
      ...f,
      url: fileUrlOf(f.filename),
      userName: f.userId != null ? (names.get(f.userId) ?? 'Unknown') : null,
    }));
  }
}
