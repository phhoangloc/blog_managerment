import { CommentEntity, IBlogRepository, ICommentRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { Role } from '../utils/tokenService';
import { AvatarResolver } from './AvatarResolver';
import { Broadcaster } from './RealtimeHub';

export interface Actor {
  id: number;
  role: Role;
}

type UserRow = { id: number; username: string; password: string; avatarId?: number | null };

// Admins can view/edit/delete every comment; users only their own
const canAccess = (c: CommentEntity, actor: Actor) => actor.role === 'admin' || c.userId === actor.id;

export class CommentService {
  constructor(
    private readonly comments: ICommentRepository,
    private readonly blogs: Pick<IBlogRepository, 'findBySlug' | 'findAll'>,
    private readonly users: { findAll(): Promise<UserRow[]> },
    private readonly avatars: Pick<AvatarResolver, 'toPublic'>,
    private readonly hub: Broadcaster,
  ) {}

  // public reader site: visible comments of a published blog
  async listPublic(slug: string) {
    const blog = await this.publishedBlog(slug);
    return this.decorate(await this.comments.findAll({ blogId: blog.id, hidden: false }));
  }

  // only users comment; the author is always the logged-in user
  async create(slug: string, content: string, actor: Actor) {
    if (actor.role !== 'user') throw new AppError(403, 'Only users can comment');
    const blog = await this.publishedBlog(slug);
    const created = await this.comments.create({ userId: actor.id, blogId: blog.id, content });
    const [view] = await this.decorate([created]);
    this.hub.publish({ type: 'comment:created', slug, comment: view, commentCount: await this.visibleCount(blog.id) });
    return view;
  }

  async list(actor: Actor) {
    return this.decorate(await this.comments.findAll(actor.role === 'admin' ? undefined : { userId: actor.id }));
  }

  async get(id: number, actor: Actor) {
    return (await this.decorate([await this.find(id, actor)]))[0];
  }

  async update(id: number, patch: { content?: string; hidden?: boolean }, actor: Actor) {
    const before = await this.find(id, actor);
    // hiding is moderation: admin only
    if (patch.hidden !== undefined && actor.role !== 'admin') throw new AppError(403, 'Only admins can hide comments');
    const after = await this.comments.update(id, patch);
    const [view] = await this.decorate([after]);
    await this.announce(before, after, view);
    return view;
  }

  async remove(id: number, actor: Actor) {
    const comment = await this.find(id, actor);
    await this.comments.delete(id);
    if (!comment.hidden) await this.broadcastDeleted(comment);
  }

  private async find(id: number, actor: Actor) {
    const comment = await this.comments.findById(id);
    if (!comment) throw new AppError(404, 'Comment not found');
    if (!canAccess(comment, actor)) throw new AppError(403, 'Forbidden');
    return comment;
  }

  private async publishedBlog(slug: string) {
    const blog = await this.blogs.findBySlug(slug);
    if (!blog || blog.draft) throw new AppError(404, 'Blog not found');
    return blog;
  }

  private async visibleCount(blogId: number) {
    return (await this.comments.findAll({ blogId, hidden: false })).length;
  }

  private async blogOf(blogId: number) {
    return (await this.blogs.findAll()).find((b) => b.id === blogId);
  }

  // hidden comments disappear for the public, so visibility changes are broadcast as delete / create
  private async announce(before: CommentEntity, after: CommentEntity, view: unknown) {
    const blog = await this.blogOf(after.blogId);
    if (!blog || blog.draft) return;
    const commentCount = await this.visibleCount(blog.id);
    if (before.hidden === after.hidden) {
      if (!after.hidden) this.hub.publish({ type: 'comment:updated', slug: blog.slug, comment: view, commentCount });
    } else if (after.hidden) {
      this.hub.publish({ type: 'comment:deleted', slug: blog.slug, id: after.id, commentCount });
    } else {
      this.hub.publish({ type: 'comment:created', slug: blog.slug, comment: view, commentCount });
    }
  }

  private async broadcastDeleted(comment: CommentEntity) {
    const blog = await this.blogOf(comment.blogId);
    if (!blog || blog.draft) return;
    this.hub.publish({
      type: 'comment:deleted',
      slug: blog.slug,
      id: comment.id,
      commentCount: await this.visibleCount(blog.id),
    });
  }

  // adds author name / avatar and the blog title for display
  private async decorate(rows: CommentEntity[]) {
    if (!rows.length) return [];
    const users = (await this.avatars.toPublic(await this.users.findAll())) as {
      id: number;
      username: string;
      avatarUrl?: string | null;
    }[];
    const byId = new Map(users.map((u) => [u.id, u]));
    const blogs = new Map((await this.blogs.findAll()).map((b) => [b.id, b]));
    return rows.map((c) => ({
      ...c,
      userName: byId.get(c.userId)?.username ?? 'Unknown',
      avatarUrl: byId.get(c.userId)?.avatarUrl ?? null,
      blogTitle: blogs.get(c.blogId)?.title ?? '',
      blogSlug: blogs.get(c.blogId)?.slug ?? '',
    }));
  }
}
