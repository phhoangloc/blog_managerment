import { BlogService } from '../../src/services/BlogService';

const repo = {
  findAll: jest.fn(),
  findBySlug: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};
const files = { findById: jest.fn(), findAll: jest.fn() };
const users = { findAll: jest.fn() };
const service = new BlogService(repo, files, users);

const admin = { id: 1, role: 'admin' as const };
const alice = { id: 7, role: 'user' as const };
const bob = { id: 8, role: 'user' as const };

const blog = (over = {}) => ({
  id: 1, title: 'Hello', slug: 'hello', detail: '', category: 'General', draft: true,
  coverId: null, authorId: 7, ...over,
});

beforeEach(() => {
  jest.resetAllMocks();
  users.findAll.mockResolvedValue([{ id: 7, username: 'alice_user' }]);
  repo.create.mockImplementation(async (d) => ({ id: 5, ...d }));
  repo.update.mockImplementation(async (id, d) => ({ ...blog(), id, ...d }));
});

describe('BlogService', () => {
  describe('create', () => {
    it('generates the slug from the title, defaults to draft, and records the author', async () => {
      repo.findBySlug.mockResolvedValue(null);
      const res = await service.create({ title: 'Một tuần ở Đà Lạt' }, alice);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ slug: 'mot-tuan-o-da-lat', draft: true, category: 'General', authorId: 7 }),
      );
      expect(res.authorName).toBe('alice_user');
    });

    it('appends a number when the slug is taken', async () => {
      repo.findBySlug.mockImplementation(async (s: string) => (s === 'hello' || s === 'hello-2' ? blog() : null));
      await service.create({ title: 'Hello' }, alice);
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ slug: 'hello-3' }));
    });

    it('rejects an explicit slug that already exists (409)', async () => {
      repo.findBySlug.mockResolvedValue(blog());
      await expect(service.create({ title: 'X', slug: 'hello' }, alice)).rejects.toMatchObject({ statusCode: 409 });
    });

    it('rejects a missing cover file (400)', async () => {
      repo.findBySlug.mockResolvedValue(null);
      files.findById.mockResolvedValue(null);
      await expect(service.create({ title: 'X', coverId: 9 }, alice)).rejects.toMatchObject({ statusCode: 400 });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('admins cannot create blogs (403)', async () => {
      await expect(service.create({ title: 'Admin post' }, admin)).rejects.toMatchObject({ statusCode: 403 });
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('admin sees all blogs, user only their own', async () => {
      repo.findAll.mockResolvedValue([]);
      await service.list(admin);
      expect(repo.findAll).toHaveBeenLastCalledWith(undefined);
      await service.list(alice);
      expect(repo.findAll).toHaveBeenLastCalledWith({ authorId: 7 });
    });

    it('adds coverUrl from the cover file', async () => {
      repo.findAll.mockResolvedValue([blog({ coverId: 3 })]);
      files.findAll.mockResolvedValue([{ id: 3, filename: 'cover.png' }]);
      const [b] = await service.list(admin);
      expect(b.coverUrl).toBe('/public/upload/cover.png');
    });
  });

  describe('permissions', () => {
    it('owner can get, update and delete', async () => {
      repo.findBySlug.mockResolvedValue(blog());
      await expect(service.get('hello', alice)).resolves.toMatchObject({ slug: 'hello' });
      await service.update('hello', { draft: false }, alice);
      expect(repo.update).toHaveBeenCalledWith(1, { draft: false });
      await service.remove('hello', alice);
      expect(repo.delete).toHaveBeenCalledWith(1);
    });

    it("another user gets 403 on read, update and delete", async () => {
      repo.findBySlug.mockResolvedValue(blog());
      await expect(service.get('hello', bob)).rejects.toMatchObject({ statusCode: 403 });
      await expect(service.update('hello', { draft: false }, bob)).rejects.toMatchObject({ statusCode: 403 });
      await expect(service.remove('hello', bob)).rejects.toMatchObject({ statusCode: 403 });
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('an admin can read, edit and delete any blog', async () => {
      repo.findBySlug.mockResolvedValue(blog());
      await expect(service.get('hello', admin)).resolves.toBeDefined();
      await service.update('hello', { category: 'News' }, admin);
      expect(repo.update).toHaveBeenCalledWith(1, { category: 'News' });
      await expect(service.remove('hello', admin)).resolves.toBeUndefined();
    });

    it('404 when the blog does not exist', async () => {
      repo.findBySlug.mockResolvedValue(null);
      await expect(service.get('nope', admin)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('update slug', () => {
    it('rejects a slug used by another blog but allows keeping its own', async () => {
      repo.findBySlug.mockImplementation(async (s: string) => (s === 'hello' ? blog() : s === 'taken' ? blog({ id: 2 }) : null));
      await expect(service.update('hello', { slug: 'taken' }, alice)).rejects.toMatchObject({ statusCode: 409 });
      await expect(service.update('hello', { slug: 'hello', title: 'New' }, alice)).resolves.toBeDefined();
    });

    it('allows clearing the cover with null without checking files', async () => {
      repo.findBySlug.mockResolvedValue(blog({ coverId: 3 }));
      await service.update('hello', { coverId: null }, alice);
      expect(files.findById).not.toHaveBeenCalled();
    });
  });

  describe('public (published only)', () => {
    it('listPublished asks the repository for non-draft blogs only', async () => {
      repo.findAll.mockResolvedValue([blog({ draft: false })]);
      const res = await service.listPublished();
      expect(repo.findAll).toHaveBeenCalledWith({ draft: false });
      expect(res[0].authorName).toBe('alice_user');
    });

    it('getPublished returns a published blog', async () => {
      repo.findBySlug.mockResolvedValue(blog({ draft: false }));
      await expect(service.getPublished('hello')).resolves.toMatchObject({ slug: 'hello' });
    });

    it('getPublished hides drafts and unknown slugs (404)', async () => {
      repo.findBySlug.mockResolvedValueOnce(blog({ draft: true }));
      await expect(service.getPublished('hello')).rejects.toMatchObject({ statusCode: 404 });
      repo.findBySlug.mockResolvedValueOnce(null);
      await expect(service.getPublished('nope')).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
