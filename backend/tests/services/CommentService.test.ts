import { CommentService } from '../../src/services/CommentService';

const repo = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  countsByBlog: jest.fn(),
};
const blogs = { findBySlug: jest.fn(), findAll: jest.fn() };
const users = { findAll: jest.fn() };
const avatars = { toPublic: jest.fn() };
const hub = { publish: jest.fn() };
const service = new CommentService(repo, blogs, users, avatars, hub);

const admin = { id: 1, role: 'admin' as const };
const alice = { id: 7, role: 'user' as const };
const bob = { id: 8, role: 'user' as const };

const blog = (over = {}) => ({ id: 3, title: 'Hello', slug: 'hello', draft: false, authorId: 7, ...over });
const comment = (over = {}) => ({ id: 11, userId: 7, blogId: 3, content: 'Nice', hidden: false, ...over });

beforeEach(() => {
  jest.resetAllMocks();
  blogs.findBySlug.mockResolvedValue(blog());
  blogs.findAll.mockResolvedValue([blog()]);
  users.findAll.mockResolvedValue([{ id: 7, username: 'alice_user', password: 'x', avatarId: null }]);
  avatars.toPublic.mockImplementation(async (rows: any[]) => rows.map((r) => ({ id: r.id, username: r.username, avatarUrl: null })));
  repo.create.mockImplementation(async (d) => ({ id: 11, hidden: false, ...d }));
  repo.update.mockImplementation(async (id, d) => ({ ...comment(), id, ...d }));
  repo.findAll.mockResolvedValue([comment()]);
});

describe('CommentService', () => {
  describe('create', () => {
    it('stores the comment for the caller and broadcasts it with the new count', async () => {
      const res = await service.create('hello', 'Nice', alice);
      expect(repo.create).toHaveBeenCalledWith({ userId: 7, blogId: 3, content: 'Nice' });
      expect(res).toMatchObject({ userName: 'alice_user', blogSlug: 'hello' });
      expect(hub.publish).toHaveBeenCalledWith(expect.objectContaining({ type: 'comment:created', slug: 'hello', commentCount: 1 }));
    });

    it('refuses admins (403)', async () => {
      await expect(service.create('hello', 'Hi', admin)).rejects.toMatchObject({ statusCode: 403 });
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('treats drafts and unknown blogs as 404', async () => {
      blogs.findBySlug.mockResolvedValueOnce(blog({ draft: true }));
      await expect(service.create('hello', 'Hi', alice)).rejects.toMatchObject({ statusCode: 404 });
      blogs.findBySlug.mockResolvedValueOnce(null);
      await expect(service.create('nope', 'Hi', alice)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('listPublic', () => {
    it('only asks for visible comments of a published blog', async () => {
      await service.listPublic('hello');
      expect(repo.findAll).toHaveBeenCalledWith({ blogId: 3, hidden: false });
    });

    it('404s for a draft', async () => {
      blogs.findBySlug.mockResolvedValue(blog({ draft: true }));
      await expect(service.listPublic('hello')).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('list / get', () => {
    it('admin sees every comment, a user only their own', async () => {
      await service.list(admin);
      expect(repo.findAll).toHaveBeenLastCalledWith(undefined);
      await service.list(alice);
      expect(repo.findAll).toHaveBeenLastCalledWith({ userId: 7 });
    });

    it('a user cannot read another user comment (403)', async () => {
      repo.findById.mockResolvedValue(comment());
      await expect(service.get(11, bob)).rejects.toMatchObject({ statusCode: 403 });
      await expect(service.get(11, admin)).resolves.toMatchObject({ id: 11 });
    });

    it('404s when the comment does not exist', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.get(99, admin)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('update', () => {
    it('lets the owner edit the content and broadcasts an update', async () => {
      repo.findById.mockResolvedValue(comment());
      await service.update(11, { content: 'Edited' }, alice);
      expect(repo.update).toHaveBeenCalledWith(11, { content: 'Edited' });
      expect(hub.publish).toHaveBeenCalledWith(expect.objectContaining({ type: 'comment:updated', slug: 'hello' }));
    });

    it('does not let a user change hidden (403)', async () => {
      repo.findById.mockResolvedValue(comment());
      await expect(service.update(11, { hidden: true }, alice)).rejects.toMatchObject({ statusCode: 403 });
      expect(repo.update).not.toHaveBeenCalled();
    });

    it('does not let another user edit it (403)', async () => {
      repo.findById.mockResolvedValue(comment());
      await expect(service.update(11, { content: 'x' }, bob)).rejects.toMatchObject({ statusCode: 403 });
    });

    it('lets an admin hide a comment, which the public sees as a delete', async () => {
      repo.findById.mockResolvedValue(comment());
      repo.findAll.mockResolvedValue([]);
      await service.update(11, { hidden: true }, admin);
      expect(hub.publish).toHaveBeenCalledWith({ type: 'comment:deleted', slug: 'hello', id: 11, commentCount: 0 });
    });

    it('un-hiding is announced as a new comment', async () => {
      repo.findById.mockResolvedValue(comment({ hidden: true }));
      await service.update(11, { hidden: false }, admin);
      expect(hub.publish).toHaveBeenCalledWith(expect.objectContaining({ type: 'comment:created', slug: 'hello' }));
    });

    it('stays quiet when a hidden comment is edited', async () => {
      repo.findById.mockResolvedValue(comment({ hidden: true }));
      repo.update.mockResolvedValue(comment({ hidden: true, content: 'x' }));
      await service.update(11, { content: 'x' }, admin);
      expect(hub.publish).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deletes for the owner and for an admin, and broadcasts', async () => {
      repo.findById.mockResolvedValue(comment());
      await service.remove(11, alice);
      expect(repo.delete).toHaveBeenCalledWith(11);
      expect(hub.publish).toHaveBeenCalledWith(expect.objectContaining({ type: 'comment:deleted', id: 11 }));
      await service.remove(11, admin);
      expect(repo.delete).toHaveBeenCalledTimes(2);
    });

    it('refuses another user (403) and does not delete', async () => {
      repo.findById.mockResolvedValue(comment());
      await expect(service.remove(11, bob)).rejects.toMatchObject({ statusCode: 403 });
      expect(repo.delete).not.toHaveBeenCalled();
    });

    it('does not broadcast when the deleted comment was hidden', async () => {
      repo.findById.mockResolvedValue(comment({ hidden: true }));
      await service.remove(11, admin);
      expect(hub.publish).not.toHaveBeenCalled();
    });
  });
});
