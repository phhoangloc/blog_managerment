import { authenticate, requireRole } from '../../src/middleware/auth.middleware';

const run = (mw: any, req: any) => {
  const next = jest.fn();
  mw(req, {}, next);
  return next;
};

describe('authenticate', () => {
  const tokens = {
    sign: jest.fn(),
    verify: jest.fn((t: string) => {
      if (t !== 'good') throw new Error('bad');
      return { id: 1, role: 'admin' as const };
    }),
  };
  const mw = authenticate(tokens);

  it('rejects a missing header with 401', () => {
    const next = run(mw, { headers: {} });
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it('rejects an invalid token with 401', () => {
    const next = run(mw, { headers: { authorization: 'Bearer nope' } });
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });

  it('sets req.auth for a valid token', () => {
    const req: any = { headers: { authorization: 'Bearer good' } };
    const next = run(mw, req);
    expect(next).toHaveBeenCalledWith();
    expect(req.auth).toEqual({ id: 1, role: 'admin' });
  });
});

describe('requireRole', () => {
  it('401 when unauthenticated', () => {
    expect(run(requireRole('admin'), {}).mock.calls[0][0]).toMatchObject({ statusCode: 401 });
  });
  it('403 for a wrong role', () => {
    const next = run(requireRole('admin'), { auth: { id: 2, role: 'user' } });
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 403 });
  });
  it('passes for an allowed role', () => {
    expect(run(requireRole('admin'), { auth: { id: 1, role: 'admin' } })).toHaveBeenCalledWith();
  });
});
