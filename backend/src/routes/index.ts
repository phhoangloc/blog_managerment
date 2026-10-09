import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AdminController } from '../controllers/AdminController';
import { BlogController } from '../controllers/BlogController';
import { AuthController } from '../controllers/AuthController';
import { FileController } from '../controllers/FileController';
import { UserController } from '../controllers/UserController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  PrismaAdminRepository,
  PrismaBlogRepository,
  PrismaFileRepository,
  PrismaUserRepository,
} from '../repositories/prismaRepositories';
import { AdminService } from '../services/AdminService';
import { BlogService } from '../services/BlogService';
import { AuthService } from '../services/AuthService';
import { AvatarResolver } from '../services/AvatarResolver';
import { FileService } from '../services/FileService';
import { LocalFileStorage } from '../services/FileStorage';
import { UserService } from '../services/UserService';
import { BcryptPasswordHasher } from '../utils/passwordHasher';
import { JwtTokenService } from '../utils/tokenService';
import {
  createAdminSchema,
  createBlogSchema,
  createUserSchema,
  loginSchema,
  updateAdminSchema,
  updateBlogSchema,
  updateFileSchema,
  updateUserSchema,
  uploadFileSchema,
} from '../validators/schemas';

// Wrap async handlers so rejections reach the error middleware
const h =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res).catch(next);
  };

// Composition root: wires concrete implementations to abstractions
export function buildRouter(): Router {
  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenService(env.jwtSecret, env.jwtExpiresIn);
  const userRepo = new PrismaUserRepository(prisma);

  const adminRepo = new PrismaAdminRepository(prisma);
  const fileRepo = new PrismaFileRepository(prisma);
  const avatars = new AvatarResolver(fileRepo);

  const authCtl = new AuthController(new AuthService(adminRepo, userRepo, hasher, tokens));
  const adminCtl = new AdminController(new AdminService(adminRepo, hasher));
  const userCtl = new UserController(new UserService(userRepo, hasher, avatars));
  const blogCtl = new BlogController(
    new BlogService(new PrismaBlogRepository(prisma), fileRepo, userRepo),
  );
  const fileCtl = new FileController(new FileService(fileRepo, new LocalFileStorage(env.uploadDir), userRepo));

  const authed = authenticate(tokens);
  const adminOnly = requireRole('admin');
  const router = Router();

  router.post('/auth/login', validateBody(loginSchema), h(authCtl.login));

  // /me must be registered before /:id
  router.get('/admins', authed, adminOnly, h(adminCtl.list));
  router.post('/admins', authed, adminOnly, validateBody(createAdminSchema), h(adminCtl.create));
  router.get('/admins/me', authed, adminOnly, h(adminCtl.me));
  router.put('/admins/me', authed, adminOnly, validateBody(updateAdminSchema), h(adminCtl.updateMe));
  router.get('/admins/:id', authed, adminOnly, h(adminCtl.get));
  router.put('/admins/:id', authed, adminOnly, validateBody(updateAdminSchema), h(adminCtl.update));
  router.delete('/admins/:id', authed, adminOnly, h(adminCtl.remove));

  router.get('/users/me', authed, requireRole('user'), h(userCtl.me));
  router.put('/users/me', authed, requireRole('user'), validateBody(updateUserSchema), h(userCtl.updateMe));

  router.get('/users', authed, adminOnly, h(userCtl.list));
  router.post('/users', authed, adminOnly, validateBody(createUserSchema), h(userCtl.create));
  router.get('/users/:id', authed, adminOnly, h(userCtl.get));
  router.put('/users/:id', authed, adminOnly, validateBody(updateUserSchema), h(userCtl.update));
  router.delete('/users/:id', authed, adminOnly, h(userCtl.remove));

  // public reader site: published blogs, no token
  router.get('/public/blogs', h(blogCtl.listPublic));
  router.get('/public/blogs/:slug', h(blogCtl.getPublic));

  // blogs: only users create; admin can view/edit/delete all, a user only their own (enforced in BlogService)
  router.get('/blogs', authed, h(blogCtl.list));
  router.post('/blogs', authed, requireRole('user'), validateBody(createBlogSchema), h(blogCtl.create));
  router.get('/blogs/:slug', authed, h(blogCtl.get));
  router.put('/blogs/:slug', authed, validateBody(updateBlogSchema), h(blogCtl.update));
  router.delete('/blogs/:slug', authed, h(blogCtl.remove));

  // files: only users upload; admin can view/edit/delete all, a user only their own (enforced in FileService)
  router.get('/files', authed, h(fileCtl.list));
  router.post('/files', authed, requireRole('user'), uploadSingle, validateBody(uploadFileSchema), h(fileCtl.upload));
  router.get('/files/:id', authed, h(fileCtl.get));
  router.put('/files/:id', authed, uploadSingle, validateBody(updateFileSchema), h(fileCtl.update));
  router.delete('/files/:id', authed, h(fileCtl.remove));

  return router;
}
