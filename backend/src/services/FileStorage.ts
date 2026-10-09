import fs from 'fs/promises';
import path from 'path';

export interface FileStorage {
  save(filename: string, data: Buffer): Promise<void>;
  remove(filename: string): Promise<void>;
  rename(from: string, to: string): Promise<void>;
}

export class LocalFileStorage implements FileStorage {
  constructor(private readonly dir: string) {}

  async save(filename: string, data: Buffer) {
    await fs.mkdir(this.dir, { recursive: true });
    await fs.writeFile(path.join(this.dir, path.basename(filename)), data);
  }

  async remove(filename: string) {
    await fs.rm(path.join(this.dir, path.basename(filename)), { force: true });
  }

  async rename(from: string, to: string) {
    await fs.rename(path.join(this.dir, path.basename(from)), path.join(this.dir, path.basename(to)));
  }
}
