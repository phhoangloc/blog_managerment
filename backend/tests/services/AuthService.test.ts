import { AuthService } from '../../src/services/AuthService';
import { AppError } from '../../src/utils/AppError';

const hasher = {
  hash: jest.fn(async (p: string) => `h:${p}`),
  compare: jest.fn(async (p: string, h: string) => h === `h:${p}`),
};
const tokens = { sign: jest.fn(() => 'tok'), verify: jest.fn() };
const admins = { findByUsername: jest.fn() } as any;
const users = { findByUsername: jest.fn() } as any;

const service = new AuthService(admins, users, hasher, tokens);

beforeEach(() => jest.clearAllMocks());

describe('AuthService.login', () => {
  it('logs an admin in against the admin repository', async () => {
    admins.findByUsername.mockResolvedValue({ id: 1, username: 'adminuser', password: 'h:secret1', email: 'a@a.com' });
    const res = await service.login('admin', 'adminuser', 'secret1');
    expect(res).toEqual({ token: 'tok', role: 'admin' });
    expect(tokens.sign).toHaveBeenCalledWith({ id: 1, role: 'admin' });
    expect(users.findByUsername).not.toHaveBeenCalled();
  });

  it('logs a user in against the user repository', async () => {
    users.findByUsername.mockResolvedValue({ id: 7, username: 'someuser', password: 'h:secret1', email: 'u@u.com' });
    await service.login('user', 'someuser', 'secret1');
    expect(tokens.sign).toHaveBeenCalledWith({ id: 7, role: 'user' });
  });

  it('rejects an unknown account', async () => {
    users.findByUsername.mockResolvedValue(null);
    await expect(service.login('user', 'nobody1', 'secret1')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a wrong password', async () => {
    admins.findByUsername.mockResolvedValue({ id: 1, username: 'adminuser', password: 'h:secret1', email: 'a@a.com' });
    await expect(service.login('admin', 'adminuser', 'wrong12')).rejects.toBeInstanceOf(AppError);
  });
});