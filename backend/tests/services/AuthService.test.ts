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

describe('AuthService.loginWithGoogle', () => {
  const googleUsers = { findByEmail: jest.fn(), findByUsername: jest.fn(), create: jest.fn() } as any;
  const verifier = { verify: jest.fn() };
  const google = new AuthService(admins, googleUsers, hasher, tokens, verifier);

  beforeEach(() => {
    verifier.verify.mockResolvedValue({ email: 'Jane.Doe@Gmail.com', emailVerified: true, name: 'Jane' });
    googleUsers.findByEmail.mockResolvedValue(null);
    googleUsers.findByUsername.mockResolvedValue(null);
    googleUsers.create.mockImplementation(async (d: any) => ({ id: 21, ...d }));
  });

  it('creates a user on the first Google login with a random hashed password', async () => {
    const res = await google.loginWithGoogle('id-token');
    expect(verifier.verify).toHaveBeenCalledWith('id-token');
    const created = googleUsers.create.mock.calls[0][0];
    expect(created).toMatchObject({ email: 'jane.doe@gmail.com', username: 'janedoe' });
    expect(created.password).toMatch(/^h:[0-9a-f]{64}$/); // 32 random bytes, hashed
    expect(res).toEqual({ token: 'tok', role: 'user' });
    expect(tokens.sign).toHaveBeenCalledWith({ id: 21, role: 'user' });
  });

  it('uses a different password for every new account', async () => {
    await google.loginWithGoogle('a');
    await google.loginWithGoogle('b');
    const [a, b] = googleUsers.create.mock.calls.map((c: any) => c[0].password);
    expect(a).not.toBe(b);
  });

  it('logs in the existing user that owns the email without creating one', async () => {
    googleUsers.findByEmail.mockResolvedValue({ id: 7, username: 'someuser', email: 'jane.doe@gmail.com' });
    await google.loginWithGoogle('id-token');
    expect(googleUsers.create).not.toHaveBeenCalled();
    expect(tokens.sign).toHaveBeenCalledWith({ id: 7, role: 'user' });
  });

  it('makes the username at least 6 characters and unique', async () => {
    verifier.verify.mockResolvedValue({ email: 'al@x.com', emailVerified: true });
    await google.loginWithGoogle('t');
    expect(googleUsers.create.mock.calls[0][0].username).toMatch(/^al\d{4}$/);

    verifier.verify.mockResolvedValue({ email: 'jane.doe@gmail.com', emailVerified: true });
    googleUsers.findByUsername.mockImplementation(async (u: string) => (u === 'janedoe' ? { id: 1 } : null));
    await google.loginWithGoogle('t');
    expect(googleUsers.create.mock.calls[1][0].username).toBe('janedoe2');
  });

  it('drops characters that are not allowed from the username', async () => {
    verifier.verify.mockResolvedValue({ email: 'max+news.letter@x.com', emailVerified: true });
    await google.loginWithGoogle('t');
    expect(googleUsers.create.mock.calls[0][0].username).toBe('maxnewsletter');
  });

  it('rejects an invalid token (401) and creates nothing', async () => {
    verifier.verify.mockRejectedValue(new Error('bad signature'));
    await expect(google.loginWithGoogle('x')).rejects.toMatchObject({ statusCode: 401 });
    expect(googleUsers.create).not.toHaveBeenCalled();
  });

  it('rejects an unverified Google email (401)', async () => {
    verifier.verify.mockResolvedValue({ email: 'jane@gmail.com', emailVerified: false });
    await expect(google.loginWithGoogle('x')).rejects.toMatchObject({ statusCode: 401 });
    expect(googleUsers.findByEmail).not.toHaveBeenCalled();
  });

  it('answers 503 when Google login is not configured', async () => {
    const off = new AuthService(admins, googleUsers, hasher, tokens);
    await expect(off.loginWithGoogle('x')).rejects.toMatchObject({ statusCode: 503 });
  });
});
