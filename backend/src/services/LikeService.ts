import { IBlogRepository, ILikeRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { Role } from '../utils/tokenService';
import { Broadcaster } from './RealtimeHub';

export interface Actor {
  id: number;
  role: Role;
}

export class LikeService {
  constructor(
    private readonly likes: ILikeRepository,
    private readonly blogs: Pick<IBlogRepository, 'findBySlug'>,
    private readonly hub: Broadcaster,
  ) {}

  // has the logged-in user liked this blog?
  async get(slug: string, actor: Actor) {
    this.assertUser(actor);
    const blog = await this.publishedBlog(slug);
    return { like: (await this.likes.find(actor.id, blog.id))?.like ?? false };
  }

  async set(slug: string, like: boolean, actor: Actor) {
    this.assertUser(actor);
    const blog = await this.publishedBlog(slug);
    await this.likes.set(actor.id, blog.id, like);
    const likeCount = (await this.likes.countsByBlog()).get(blog.id) ?? 0;
    this.hub.publish({ type: 'like:changed', slug, likeCount });
    return { like, likeCount };
  }

  // admins cannot like
  private assertUser(actor: Actor) {
    if (actor.role !== 'user') throw new AppError(403, 'Only users can like blogs');
  }

  private async publishedBlog(slug: string) {
    const blog = await this.blogs.findBySlug(slug);
    if (!blog || blog.draft) throw new AppError(404, 'Blog not found');
    return blog;
  }
}
