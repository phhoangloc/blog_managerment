import { AdminService } from '../../src/services/AdminService';

const hasher = { hash: jest.fn(), compare: jest.fn() };
const repo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const service = new AdminService(repo, hasher);

const row = { id: 1, username: 'adminuser', password: 'h:secret1', email: 'a@a.com' };

beforeEach(() => {
  jest.resetAllMocks();
  hasher.hash.mockImplementation(async (p: string) => `h:${p}`);
});

describe('AdminService', () => {
  it('create hashes the password and never returns it', async () => {
    repo.findByUsername.mockResolvedValue(null);
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(row);
    const res = await service.create({ username: 'adminuser', password: 'secret1', email: 'a@a.com' });
    expect(repo.create).toHaveBeenCalledWith({ username: 'adminuser', password: 'h:secret1', email: 'a@a.com' });
    expect(res).not.toHaveProperty('password');
  });

  it('create rejects duplicate username and email (409)', async () => {
    repo.findByUsername.mockResolvedValueOnce(row);
    await expect(service.create({ username: 'adminuser', password: 'secret1', email: 'x@x.com' })).rejects.toMatchObject({
      statusCode: 409,
    });
    repo.findByUsername.mockResolvedValueOnce(null);
    repo.findByEmail.mockResolvedValueOnce(row);
    await expect(service.create({ username: 'another1', password: 'secret1', email: 'a@a.com' })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  it('list and get strip passwords; get 404s when missing', async () => {
    repo.findAll.mockResolvedValue([row]);
    const list = await service.list();
    expect(list[0]).not.toHaveProperty('password');
    expect(list[0]).not.toHaveProperty('avatarUrl');
    repo.findById.mockResolvedValueOnce(row);
    expect(await service.get(1)).not.toHaveProperty('password');
    repo.findById.mockResolvedValueOnce(null);
    await expect(service.get(9)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('update hashes a new password and allows keeping own username', async () => {
    repo.findById.mockResolvedValue(row);
    repo.findByUsername.mockResolvedValue(row);
    repo.update.mockResolvedValue(row);
    await service.update(1, { username: 'adminuser', password: 'newpass1' });
    expect(repo.update).toHaveBeenCalledWith(1, { username: 'adminuser', password: 'h:newpass1' });
  });

  it('update 404s when missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.update(9, { email: 'a@a.com' })).rejects.toMatchObject({ statusCode: 404 });
  });

  it('remove refuses to delete the current admin (400)', async () => {
    await expect(service.remove(1, 1)).rejects.toMatchObject({ statusCode: 400 });
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('remove deletes another admin and 404s when missing', async () => {
    repo.findById.mockResolvedValueOnce({ ...row, id: 2 });
    await service.remove(2, 1);
    expect(repo.delete).toHaveBeenCalledWith(2);
    repo.findById.mockResolvedValueOnce(null);
    await expect(service.remove(3, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});
