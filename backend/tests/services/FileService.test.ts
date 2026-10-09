import { FileService } from '../../src/services/FileService';

const repo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const storage = { save: jest.fn(), remove: jest.fn(), rename: jest.fn() };
const users = { findAll: jest.fn() };
const service = new FileService(repo, storage, users);

const input = { name: 'report', detail: 'q1', originalName: 'Report.PDF', buffer: Buffer.from('x') };
const admin = { id: 1, role: 'admin' as const };
const alice = { id: 7, role: 'user' as const };
const bob = { id: 8, role: 'user' as const };
const owned = { id: 3, name: 'report', detail: 'old', filename: 'report.pdf', userId: 7 };

beforeEach(() => {
  jest.resetAllMocks();
  users.findAll.mockResolvedValue([{ id: 7, username: 'alice_user' }]);
});

describe('FileService', () => {
  describe('upload', () => {
    it('stores the file under name + extension, owned by the user, with a name-based url', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockImplementation(async (d) => ({ id: 3, ...d }));
      const res = await service.upload(input, alice);
      expect(storage.save).toHaveBeenCalledWith('report.pdf', input.buffer);
      expect(res.url).toBe('/public/upload/report.pdf');
      expect(res.userName).toBe('alice_user');
      expect(repo.create).toHaveBeenCalledWith({ name: 'report', detail: 'q1', filename: 'report.pdf', userId: 7 });
    });

    it('admins cannot upload (403) and storage is untouched', async () => {
      await expect(service.upload(input, admin)).rejects.toMatchObject({ statusCode: 403 });
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('rejects a duplicate name without touching storage', async () => {
      repo.findByName.mockResolvedValue({ id: 1 });
      await expect(service.upload(input, alice)).rejects.toMatchObject({ statusCode: 409 });
      expect(storage.save).not.toHaveBeenCalled();
    });

    it('removes the stored file if the db insert fails', async () => {
      repo.findByName.mockResolvedValue(null);
      repo.create.mockRejectedValue(new Error('db down'));
      await expect(service.upload(input, alice)).rejects.toThrow('db down');
      expect(storage.remove).toHaveBeenCalledWith('report.pdf');
    });
  });

  describe('list', () => {
    const rows = [owned, { ...owned, id: 4, userId: 8 }, { ...owned, id: 5, userId: null }];

    it('admin sees every file (including legacy ones without an owner)', async () => {
      repo.findAll.mockResolvedValue(rows);
      const res = await service.list(admin);
      expect(res.map((f) => f.id)).toEqual([3, 4, 5]);
      expect(res[2].userName).toBeNull();
    });

    it('a user sees only their own files', async () => {
      repo.findAll.mockResolvedValue(rows);
      expect((await service.list(alice)).map((f) => f.id)).toEqual([3]);
    });
  });

  describe('get / update', () => {
    it('get returns the file with url for the owner and for admin, 404 when missing', async () => {
      repo.findById.mockResolvedValue(owned);
      expect((await service.get(3, alice)).url).toBe('/public/upload/report.pdf');
      await expect(service.get(3, admin)).resolves.toBeDefined();
      repo.findById.mockResolvedValueOnce(null);
      await expect(service.get(9, alice)).rejects.toMatchObject({ statusCode: 404 });
    });

    it("another user gets 403 on get, update and remove", async () => {
      repo.findById.mockResolvedValue(owned);
      await expect(service.get(3, bob)).rejects.toMatchObject({ statusCode: 403 });
      await expect(service.update(3, { detail: 'x' }, bob)).rejects.toMatchObject({ statusCode: 403 });
      await expect(service.remove(3, bob)).rejects.toMatchObject({ statusCode: 403 });
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('update with only detail does not touch storage', async () => {
      repo.findById.mockResolvedValue(owned);
      repo.update.mockImplementation(async (_id, d) => ({ ...owned, ...d }));
      await service.update(3, { detail: 'new' }, alice);
      expect(repo.update).toHaveBeenCalledWith(3, { name: 'report', filename: 'report.pdf', detail: 'new' });
      expect(storage.save).not.toHaveBeenCalled();
      expect(storage.rename).not.toHaveBeenCalled();
    });

    it('update renames the stored file when the name changes', async () => {
      repo.findById.mockResolvedValue(owned);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockImplementation(async (_id, d) => ({ ...owned, ...d }));
      const res = await service.update(3, { name: 'summary' }, alice);
      expect(storage.rename).toHaveBeenCalledWith('report.pdf', 'summary.pdf');
      expect(res.url).toBe('/public/upload/summary.pdf');
    });

    it('update rejects a name used by another file (409)', async () => {
      repo.findById.mockResolvedValue(owned);
      repo.findByName.mockResolvedValue({ id: 8 });
      await expect(service.update(3, { name: 'taken' }, alice)).rejects.toMatchObject({ statusCode: 409 });
      expect(storage.rename).not.toHaveBeenCalled();
    });

    it('update with a replacement saves the new file and removes the old one', async () => {
      repo.findById.mockResolvedValue(owned);
      repo.update.mockImplementation(async (_id, d) => ({ ...owned, ...d }));
      const buffer = Buffer.from('img');
      await service.update(3, { replacement: { originalName: 'photo.PNG', buffer } }, alice);
      expect(storage.save).toHaveBeenCalledWith('report.png', buffer);
      expect(storage.remove).toHaveBeenCalledWith('report.pdf');
    });

    it('update rolls the rename back when the db update fails', async () => {
      repo.findById.mockResolvedValue(owned);
      repo.findByName.mockResolvedValue(null);
      repo.update.mockRejectedValue(new Error('db down'));
      await expect(service.update(3, { name: 'summary' }, alice)).rejects.toThrow('db down');
      expect(storage.rename).toHaveBeenLastCalledWith('summary.pdf', 'report.pdf');
    });

    it('update 404s when missing', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update(9, { detail: 'x' }, alice)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('remove', () => {
    it('owner and admin can delete the record and the stored file; 404 when missing', async () => {
      repo.findById.mockResolvedValue(owned);
      await service.remove(3, alice);
      expect(repo.delete).toHaveBeenCalledWith(3);
      expect(storage.remove).toHaveBeenCalledWith('report.pdf');
      await expect(service.remove(3, admin)).resolves.toBeUndefined();
      repo.findById.mockResolvedValueOnce(null);
      await expect(service.remove(4, alice)).rejects.toMatchObject({ statusCode: 404 });
    });

    it('admin can delete a legacy file that has no owner', async () => {
      repo.findById.mockResolvedValue({ ...owned, userId: null });
      await expect(service.remove(3, admin)).resolves.toBeUndefined();
      await expect(service.remove(3, alice)).rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
