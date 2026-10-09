import { AvatarResolver } from '../../src/services/AvatarResolver';
import { UserService } from '../../src/services/UserService';

const hasher = {
  hash: jest.fn(async (p: string) => `h:${p}`),
  compare: jest.fn(),
};
const repo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const fileRepo = { findById: jest.fn(), findAll: jest.fn() };
const service = new UserService(repo, hasher, new AvatarResolver(fileRepo));

const row = { id: 1, username: 'someuser', password: 'h:secret1', email: 'u@u.com' };

beforeEach(() => {
  jest.resetAllMocks();
  hasher.hash.mockImplementation(async (p: string) => `h:${p}`);
});

describe('UserService', () => {
  it('create hashes the password and never returns it', async () => {
    repo.findByUsername.mockResolvedValue(null);
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(row);
    const res = await service.create({ username: 'someuser', password: 'secret1', email: 'u@u.com' });
    expect(repo.create).toHaveBeenCalledWith({ username: 'someuser', password: 'h:secret1', email: 'u@u.com' });
    expect(res).not.toHaveProperty('password');
  });

  it('create rejects duplicate username (409)', async () => {
    repo.findByUsername.mockResolvedValue(row);
    await expect(service.create({ username: 'someuser', password: 'secret1', email: 'x@x.com' })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('create rejects duplicate email (409)', async () => {
    repo.findByUsername.mockResolvedValue(null);
    repo.findByEmail.mockResolvedValue(row);
    await expect(service.create({ username: 'another1', password: 'secret1', email: 'u@u.com' })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('get throws 404 when missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.get(5)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('list strips passwords', async () => {
    repo.findAll.mockResolvedValue([row]);
    const res = await service.list();
    expect(res[0]).not.toHaveProperty('password');
  });

  it('update hashes a new password and allows keeping own username', async () => {
    repo.findById.mockResolvedValue(row);
    repo.findByUsername.mockResolvedValue(row);
    repo.update.mockResolvedValue(row);
    await service.update(1, { username: 'someuser', password: 'newpass1' });
    expect(repo.update).toHaveBeenCalledWith(1, { username: 'someuser', password: 'h:newpass1' });
  });

  it('update throws 404 when missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.update(9, { email: 'a@a.com' })).rejects.toMatchObject({ statusCode: 404 });
  });

  it('remove deletes an existing user and 404s otherwise', async () => {
    repo.findById.mockResolvedValueOnce(row);
    await service.remove(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
    repo.findById.mockResolvedValueOnce(null);
    await expect(service.remove(2)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('create rejects an avatar that is not an existing file (400)', async () => {
    repo.findByUsername.mockResolvedValue(null);
    repo.findByEmail.mockResolvedValue(null);
    fileRepo.findById.mockResolvedValue(null);
    await expect(
      service.create({ username: 'someuser', password: 'secret1', email: 'u@u.com', avatarId: 99 }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('get returns avatarUrl built from the avatar file', async () => {
    repo.findById.mockResolvedValue({ ...row, avatarId: 4 });
    fileRepo.findAll.mockResolvedValue([{ id: 4, filename: 'me.png' }]);
    const res = await service.get(1);
    expect(res.avatarUrl).toBe('/public/upload/me.png');
    expect(res).not.toHaveProperty('password');
  });

  it('update can clear the avatar with null without checking files', async () => {
    repo.findById.mockResolvedValue({ ...row, avatarId: 4 });
    repo.update.mockResolvedValue({ ...row, avatarId: null });
    const res = await service.update(1, { avatarId: null });
    expect(fileRepo.findById).not.toHaveBeenCalled();
    expect(res.avatarUrl).toBeNull();
  });
});
