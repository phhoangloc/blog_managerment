export interface AdminEntity {
  id: number;
  username: string;
  password: string;
  email: string;
}

// only users have an avatar (file.id)
export interface UserEntity extends AdminEntity {
  avatarId?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FileEntity {
  id: number;
  name: string;
  detail: string;
  filename: string;
  userId: number | null; // owner; null only for legacy admin-uploaded files
  createdAt?: Date;
}

export interface BlogEntity {
  id: number;
  title: string;
  slug: string;
  detail: string;
  category: string;
  draft: boolean;
  coverId: number | null;
  authorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CommentEntity {
  id: number;
  userId: number;
  blogId: number;
  content: string;
  hidden: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LikeEntity {
  userId: number;
  blogId: number;
  like: boolean;
}

export interface ICommentRepository {
  findAll(filter?: { userId?: number; blogId?: number; hidden?: boolean }): Promise<CommentEntity[]>;
  findById(id: number): Promise<CommentEntity | null>;
  create(data: { userId: number; blogId: number; content: string }): Promise<CommentEntity>;
  update(id: number, data: { content?: string; hidden?: boolean }): Promise<CommentEntity>;
  delete(id: number): Promise<void>;
  /** visible (not hidden) comments per blog id */
  countsByBlog(): Promise<Map<number, number>>;
}

export interface ILikeRepository {
  find(userId: number, blogId: number): Promise<LikeEntity | null>;
  set(userId: number, blogId: number, like: boolean): Promise<LikeEntity>;
  /** rows with like = true per blog id */
  countsByBlog(): Promise<Map<number, number>>;
}

export type BlogInput = Omit<BlogEntity, 'id' | 'createdAt' | 'updatedAt'>;

export interface IBlogRepository {
  findAll(filter?: { authorId?: number; draft?: boolean }): Promise<BlogEntity[]>;
  findBySlug(slug: string): Promise<BlogEntity | null>;
  create(data: BlogInput): Promise<BlogEntity>;
  update(id: number, data: Partial<Omit<BlogInput, 'authorId'>>): Promise<BlogEntity>;
  delete(id: number): Promise<void>;
}

export type AdminInput = { username: string; password: string; email: string };
export type UserInput = AdminInput & { avatarId?: number | null };

export interface IAdminRepository {
  findAll(): Promise<AdminEntity[]>;
  findById(id: number): Promise<AdminEntity | null>;
  findByUsername(username: string): Promise<AdminEntity | null>;
  findByEmail(email: string): Promise<AdminEntity | null>;
  create(data: AdminInput): Promise<AdminEntity>;
  update(id: number, data: Partial<AdminInput>): Promise<AdminEntity>;
  delete(id: number): Promise<void>;
}

export interface IUserRepository {
  findAll(): Promise<UserEntity[]>;
  findById(id: number): Promise<UserEntity | null>;
  findByUsername(username: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: UserInput): Promise<UserEntity>;
  update(id: number, data: Partial<UserInput>): Promise<UserEntity>;
  delete(id: number): Promise<void>;
}

export interface IFileRepository {
  findAll(): Promise<FileEntity[]>;
  findById(id: number): Promise<FileEntity | null>;
  findByName(name: string): Promise<FileEntity | null>;
  create(data: Omit<FileEntity, 'id' | 'createdAt'>): Promise<FileEntity>;
  update(id: number, data: Partial<Pick<FileEntity, 'name' | 'detail' | 'filename'>>): Promise<FileEntity>;
  delete(id: number): Promise<void>;
}
