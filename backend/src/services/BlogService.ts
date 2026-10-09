import { BlogEntity, BlogInput, IBlogRepository, IFileRepository } from '../repositories/interfaces';
import { AppError } from '../utils/AppError';
import { slugify, uniqueSlug } from '../utils/slugify';
import { Role } from '../utils/tokenService';
import { fileUrlOf } from './FileService';

export interface Actor {
  id: number;
  role: Role;
}

type CreateInput = {
  title: string;
  slug?: string;
  detail?: string;
  category?: string;
  draft?: boolean;
  coverId?: number | null;
};
type UpdateInput = Partial<CreateInput>;

// Admins edit/delete every blog; users manage only the ones they wrote
const canAccess = (blog: BlogEntity, actor: Actor) => actor.role === 'admin' || blog.authorId === actor.id;

// like / comment totals per blog id, shown on the public site
export interface BlogStats {
  likeCounts(): Promise<Map<number, number>>;
  commentCounts(): Promise<Map<number, number>>;
}

export class BlogService {
  constructor(
    private readonly blogs: IBlogRepository,
    private readonly files: Pick<IFileRepository, 'findById' | 'findAll'>,
    private readonly users: { findAll(): Promise<{ id: number; username: string }[]> },
    private readonly stats?: BlogStats,
  ) {}

  async list(actor: Actor) {
    const rows = await this.blogs.findAll(actor.role === 'admin' ? undefined : { authorId: actor.id });
    return this.toPublic(rows);
  }

  // public reader site: published blogs only, no auth
  async listPublished() {
    return this.withCounts(await this.toPublic(await this.blogs.findAll({ draft: false })));
  }

  async getPublished(slug: string) {
    const blog = await this.blogs.findBySlug(slug);
    if (!blog || blog.draft) throw new AppError(404, 'Blog not found');
    return (await this.withCounts(await this.toPublic([blog])))[0];
  }

  async get(slug: string, actor: Actor) {
    return (await this.toPublic([await this.find(slug, actor)]))[0];
  }

  // only users write blogs; the author is always the logged-in user
  async create(input: CreateInput, actor: Actor) {
    if (actor.role !== 'user') throw new AppError(403, 'Only users can create blogs');
    await this.assertCover(input.coverId);
    let slug: string;
    if (input.slug) {
      if (await this.blogs.findBySlug(input.slug)) throw new AppError(409, 'Slug already exists');
      slug = input.slug;
    } else {
      slug = await uniqueSlug(slugify(input.title), async (s) => !!(await this.blogs.findBySlug(s)));
    }
    const data: BlogInput = {
      title: input.title,
      slug,
      detail: input.detail ?? '',
      category: input.category ?? 'General',
      draft: input.draft ?? true,
      coverId: input.coverId ?? null,
      authorId: actor.id,
    };
    return (await this.toPublic([await this.blogs.create(data)]))[0];
  }

  async update(slug: string, patch: UpdateInput, actor: Actor) {
    const blog = await this.find(slug, actor);
    if (patch.slug && patch.slug !== blog.slug && (await this.blogs.findBySlug(patch.slug))) {
      throw new AppError(409, 'Slug already exists');
    }
    await this.assertCover(patch.coverId);
    return (await this.toPublic([await this.blogs.update(blog.id, patch)]))[0];
  }

  async remove(slug: string, actor: Actor) {
    const blog = await this.find(slug, actor);
    await this.blogs.delete(blog.id);
  }

  private async find(slug: string, actor: Actor) {
    const blog = await this.blogs.findBySlug(slug);
    if (!blog) throw new AppError(404, 'Blog not found');
    if (!canAccess(blog, actor)) throw new AppError(403, 'Forbidden');
    return blog;
  }

  private async assertCover(coverId?: number | null) {
    if (coverId == null) return;
    if (!(await this.files.findById(coverId))) throw new AppError(400, 'Cover file not found');
  }

  private async withCounts<T extends { id: number }>(rows: T[]) {
    const likes = this.stats ? await this.stats.likeCounts() : new Map<number, number>();
    const comments = this.stats ? await this.stats.commentCounts() : new Map<number, number>();
    return rows.map((b) => ({ ...b, likeCount: likes.get(b.id) ?? 0, commentCount: comments.get(b.id) ?? 0 }));
  }

  // adds coverUrl and authorName for display
  private async toPublic(rows: BlogEntity[]) {
    const covers = new Map<number, string>();
    if (rows.some((b) => b.coverId != null)) (await this.files.findAll()).forEach((f) => covers.set(f.id, f.filename));
    const names = new Map<number, string>();
    if (rows.length) (await this.users.findAll()).forEach((u) => names.set(u.id, u.username));

    return rows.map((b) => ({
      ...b,
      coverUrl: b.coverId != null && covers.has(b.coverId) ? fileUrlOf(covers.get(b.coverId)!) : null,
      authorName: names.get(b.authorId) ?? 'Unknown',
    }));
  }
}
