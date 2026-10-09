import { PrismaClient } from '@prisma/client';
import {
  AdminInput,
  BlogInput,
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
