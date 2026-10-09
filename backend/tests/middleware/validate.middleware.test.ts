import { validateBody } from '../../src/middleware/validate.middleware';
import { createBlogSchema, createUserSchema, loginSchema, updateBlogSchema, uploadFileSchema } from '../../src/validators/schemas';

const run = (schema: any, body: any) => {
  const req: any = { body };
  const next = jest.fn();
  validateBody(schema)(req, {} as any, next);
  return { req, next };
};

describe('validateBody', () => {
  it('accepts a valid user', () => {
    const { next } = run(createUserSchema, { username: 'someuser', password: 'secret1', email: 'a@b.com' });
    expect(next).toHaveBeenCalledWith();
  });

  it.each([
    [{ username: 'short', password: 'secret1', email: 'a@b.com' }, 'username'],
    [{ username: 'someuser', password: '12345', email: 'a@b.com' }, 'password'],
    [{ username: 'someuser', password: 'secret1', email: 'not-an-email' }, 'email'],
  ])('rejects %j with 400', (body, field) => {
    const { next } = run(createUserSchema, body);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.message).toContain(field);
  });

  it('requires a valid role on login', () => {
    const { next } = run(loginSchema, { role: 'root', username: 'someuser', password: 'secret1' });
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
  });

  it('rejects unsafe file names and defaults detail', () => {
    expect(run(uploadFileSchema, { name: '../evil' }).next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
    const ok = run(uploadFileSchema, { name: 'good-name' });
    expect(ok.req.body).toEqual({ name: 'good-name', detail: '' });
  });

  it('blog create applies defaults (draft true, category General) and requires a title', () => {
    const ok = run(createBlogSchema, { title: ' My post ' });
    expect(ok.req.body).toMatchObject({ title: 'My post', draft: true, category: 'General', detail: '' });
    expect(run(createBlogSchema, { title: '' }).next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
  });

  it('blog slug must be lowercase dashed; update needs at least one field', () => {
    expect(run(createBlogSchema, { title: 'x', slug: 'Bad Slug' }).next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
    expect(run(updateBlogSchema, {}).next.mock.calls[0][0]).toMatchObject({ statusCode: 400 });
    expect(run(updateBlogSchema, { draft: false, coverId: null }).next).toHaveBeenCalledWith();
  });
});
