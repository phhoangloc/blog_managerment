import { PrismaClient } from '@prisma/client';
import {
  AdminInput,
  BlogInput,
  ICommentRepository,
  ILikeRepository,
  IAdminRepository,
  IBlogRepository,
  IFileRepository,
  IUserRepository,
  UserInput,
} from './interfaces';

export class PrismaAdminRepository implements IAdminRepository {
  constructor(private readonly db: PrismaClient) {}
  findAll() {
    return this.db.admin.findMany({ orderBy: { id: 'asc' } });
  }
  findById(id: number) {
    return this.db.admin.findUnique({ where: { id } });
  }
  findByUsername(username: string) {
    return this.db.admin.findUnique({ where: { username } });
  }
  findByEmail(email: string) {
    return this.db.admin.findUnique({ where: { email } });
  }
  create(data: AdminInput) {
    return this.db.admin.create({ data });
  }
  update(id: number, data: Partial<AdminInput>) {
    return this.db.admin.update({ where: { id }, data });
  }
  async delete(id: number) {
    await this.db.admin.delete({ where: { id } });
  }
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}
  findAll() {
    return this.db.user.findMany({ orderBy: { id: 'asc' } });
  }
  findById(id: number) {
    return this.db.user.findUnique({ where: { id } });
  }
  findByUsername(username: string) {
    return this.db.user.findUnique({ where: { username } });
  }
  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }
  create(data: UserInput) {
    return this.db.user.create({ data });
  }
  update(id: number, data: Partial<UserInput>) {
    return this.db.user.update({ where: { id }, data });
  }
  async delete(id: number) {
    await this.db.user.delete({ where: { id } });
  }
}

export class PrismaBlogRepository implements IBlogRepository {
  constructor(private readonly db: PrismaClient) {}
  findAll(filter?: { authorId?: number; draft?: boolean }) {
    return this.db.blog.findMany({ where: filter, orderBy: { id: 'desc' } });
  }
  findBySlug(slug: string) {
    return this.db.blog.findUnique({ where: { slug } });
  }
  create(data: BlogInput) {
    return this.db.blog.create({ data });
  }
  update(id: number, data: Parameters<IBlogRepository['update']>[1]) {
    return this.db.blog.update({ where: { id }, data });
  }
  async delete(id: number) {
    await this.db.blog.delete({ where: { id } });
  }
}

export class PrismaFileRepository implements IFileRepository {
  constructor(private readonly db: PrismaClient) {}
  findAll() {
    return this.db.file.findMany({ orderBy: { id: 'asc' } });
  }
  findById(id: number) {
    return this.db.file.findUnique({ where: { id } });
  }
  findByName(name: string) {
    return this.db.file.findUnique({ where: { name } });
  }
  create(data: Parameters<IFileRepository['create']>[0]) {
    return this.db.file.create({ data });
  }
  update(id: number, data: Parameters<IFileRepository['update']>[1]) {
    return this.db.file.update({ where: { id }, data });
  }
  async delete(id: number) {
    await this.db.file.delete({ where: { id } });
  }
}

export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly db: PrismaClient) {}
  findAll(filter?: { userId?: number; blogId?: number; hidden?: boolean }) {
    return this.db.comment.findMany({ where: filter, orderBy: { id: 'asc' } });
  }
  findById(id: number) {
    return this.db.comment.findUnique({ where: { id } });
  }
  create(data: { userId: number; blogId: number; content: string }) {
    return this.db.comment.create({ data });
  }
  update(id: number, data: { content?: string; hidden?: boolean }) {
    return this.db.comment.update({ where: { id }, data });
  }
  async delete(id: number) {
    await this.db.comment.delete({ where: { id } });
  }
  async countsByBlog() {
    const rows = await this.db.comment.groupBy({ by: ['blogId'], where: { hidden: false }, _count: { _all: true } });
    return new Map(rows.map((r) => [r.blogId, r._count._all]));
  }
}

export class PrismaLikeRepository implements ILikeRepository {
  constructor(private readonly db: PrismaClient) {}
  find(userId: number, blogId: number) {
    return this.db.like.findUnique({ where: { userId_blogId: { userId, blogId } } });
  }
  set(userId: number, blogId: number, like: boolean) {
    return this.db.like.upsert({
      where: { userId_blogId: { userId, blogId } },
      update: { like },
      create: { userId, blogId, like },
    });
  }
  async countsByBlog() {
    const rows = await this.db.like.groupBy({ by: ['blogId'], where: { like: true }, _count: { _all: true } });
    return new Map(rows.map((r) => [r.blogId, r._count._all]));
  }
}
