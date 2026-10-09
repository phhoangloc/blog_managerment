import { LikeService } from '../../src/services/LikeService';

const likes = { find: jest.fn(), set: jest.fn(), countsByBlog: jest.fn() };
const blogs = { findBySlug: jest.fn() };
const hub = { publish: jest.fn() };
const service = new LikeService(likes, blogs, hub);

const admin = { id: 1, role: 'admin' as const };
const alice = { id: 7, role: 'user' as const };

beforeEach(() => {
  jest.resetAllMocks();
  blogs.findBySlug.mockResolvedValue({ id: 3, slug: 'hello', draft: false });
  likes.countsByBlog.mockResolvedValue(new Map([[3, 4]]));
});

describe('LikeService', () => {
  it('stores the like, returns the new count and broadcasts it', async () => {
    const res = await service.set('hello', true, alice);
    expect(likes.set).toHaveBeenCalledWith(7, 3, true);
    expect(res).toEqual({ like: true, likeCount: 4 });
    expect(hub.publish).toHaveBeenCalledWith({ type: 'like:changed', slug: 'hello', likeCount: 4 });
  });

  it('unliking stores false', async () => {
    await service.set('hello', false, alice);
    expect(likes.set).toHaveBeenCalledWith(7, 3, false);
  });

  it('reports 0 when nobody has liked the blog', async () => {
    likes.countsByBlog.mockResolvedValue(new Map());
    await expect(service.set('hello', true, alice)).resolves.toMatchObject({ likeCount: 0 });
  });

  it('admins cannot like (403)', async () => {
    await expect(service.set('hello', true, admin)).rejects.toMatchObject({ statusCode: 403 });
    await expect(service.get('hello', admin)).rejects.toMatchObject({ statusCode: 403 });
    expect(likes.set).not.toHaveBeenCalled();
  });

  it('cannot like a draft or unknown blog (404)', async () => {
    blogs.findBySlug.mockResolvedValueOnce({ id: 3, slug: 'hello', draft: true });
    await expect(service.set('hello', true, alice)).rejects.toMatchObject({ statusCode: 404 });
    blogs.findBySlug.mockResolvedValueOnce(null);
    await expect(service.set('nope', true, alice)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('get returns whether the caller liked the blog', async () => {
    likes.find.mockResolvedValueOnce({ userId: 7, blogId: 3, like: true });
    await expect(service.get('hello', alice)).resolves.toEqual({ like: true });
    likes.find.mockResolvedValueOnce(null);
    await expect(service.get('hello', alice)).resolves.toEqual({ like: false });
  });
});
