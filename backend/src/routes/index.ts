import { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { AdminController } from '../controllers/AdminController';
import { BlogController } from '../controllers/BlogController';
import { CommentController } from '../controllers/CommentController';
import { AuthController } from '../controllers/AuthController';
import { FileController } from '../controllers/FileController';
import { UserController } from '../controllers/UserController';
import { authenticate, requireRole } from '../middleware/auth.middleware';
import { uploadSingle } from '../middleware/upload.middleware';
import { validateBody } from '../middleware/validate.middleware';
import {
  PrismaAdminRepository,
  PrismaBlogRepository,
  PrismaCommentRepository,
  PrismaLikeRepository,
  PrismaFileRepository,
  PrismaUserRepository,
} from '../repositories/prismaRepositories';
import { AdminService } from '../services/AdminService';
import { BlogService } from '../services/BlogService';
import { CommentService } from '../services/CommentService';
import { LikeService } from '../services/LikeService';
import { Broadcaster } from '../services/RealtimeHub';
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
  createCommentSchema,
  createUserSchema,
  likeSchema,
  loginSchema,
  updateAdminSchema,
  updateBlogSchema,
  updateCommentSchema,
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
export function buildRouter(hub: Broadcaster): Router {
  const hasher = new BcryptPasswordHasher();
  const tokens = new JwtTokenService(env.jwtSecret, env.jwtExpiresIn);
  const userRepo = new PrismaUserRepository(prisma);

  const adminRepo = new PrismaAdminRepository(prisma);
  const fileRepo = new PrismaFileRepository(prisma);
  const avatars = new AvatarResolver(fileRepo);

  const authCtl = new AuthController(new AuthService(adminRepo, userRepo, hasher, tokens));
  const adminCtl = new AdminController(new AdminService(adminRepo, hasher));
  const userCtl = new UserController(new UserService(userRepo, hasher, avatars));
  const blogRepo = new PrismaBlogRepository(prisma);
  const commentRepo = new PrismaCommentRepository(prisma);
  const likeRepo = new PrismaLikeRepository(prisma);
  const blogCtl = new BlogController(
    new BlogService(blogRepo, fileRepo, userRepo, {
      likeCounts: () => likeRepo.countsByBlog(),
      commentCounts: () => commentRepo.countsByBlog(),
    }),
  );
  const commentCtl = new CommentController(
    new CommentService(commentRepo, blogRepo, userRepo, avatars, hub),
    new LikeService(likeRepo, blogRepo, hub),
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
  router.get('/public/blogs/:slug/comments', h(commentCtl.listPublic));

  // blogs: only users create; admin can view/edit/delete all, a user only their own (enforced in BlogService)
  router.get('/blogs', authed, h(blogCtl.list));
  router.post('/blogs', authed, requireRole('user'), validateBody(createBlogSchema), h(blogCtl.create));
  router.get('/blogs/:slug', authed, h(blogCtl.get));
  router.put('/blogs/:slug', authed, validateBody(updateBlogSchema), h(blogCtl.update));
  router.delete('/blogs/:slug', authed, h(blogCtl.remove));

  // comments and likes: users write their own; admins view/edit/delete every comment and cannot like
  router.post('/blogs/:slug/comments', authed, requireRole('user'), validateBody(createCommentSchema), h(commentCtl.create));
  router.get('/blogs/:slug/like', authed, requireRole('user'), h(commentCtl.getLike));
  router.put('/blogs/:slug/like', authed, requireRole('user'), validateBody(likeSchema), h(commentCtl.setLike));
  router.get('/comments', authed, h(commentCtl.list));
  router.get('/comments/:id', authed, h(commentCtl.get));
  router.put('/comments/:id', authed, validateBody(updateCommentSchema), h(commentCtl.update));
  router.delete('/comments/:id', authed, h(commentCtl.remove));

  // files: only users upload; admin can view/edit/delete all, a user only their own (enforced in FileService)
  router.get('/files', authed, h(fileCtl.list));
  router.post('/files', authed, requireRole('user'), uploadSingle, validateBody(uploadFileSchema), h(fileCtl.upload));
  router.get('/files/:id', authed, h(fileCtl.get));
  router.put('/files/:id', authed, uploadSingle, validateBody(updateFileSchema), h(fileCtl.update));
  router.delete('/files/:id', authed, h(fileCtl.remove));

  return router;
}
