import { Request, Response } from 'express';
import { BlogService } from '../services/BlogService';

export class BlogController {
  constructor(private readonly blogs: BlogService) {}

  list = async (req: Request, res: Response) => {
    res.json(await this.blogs.list(req.auth!));
  };
  listPublic = async (_req: Request, res: Response) => {
    res.json(await this.blogs.listPublished());
  };
  getPublic = async (req: Request, res: Response) => {
    res.json(await this.blogs.getPublished(String(req.params.slug)));
  };
  get = async (req: Request, res: Response) => {
    res.json(await this.blogs.get(String(req.params.slug), req.auth!));
  };
  create = async (req: Request, res: Response) => {
    res.status(201).json(await this.blogs.create(req.body, req.auth!));
  };
  update = async (req: Request, res: Response) => {
    res.json(await this.blogs.update(String(req.params.slug), req.body, req.auth!));
  };
  remove = async (req: Request, res: Response) => {
    await this.blogs.remove(String(req.params.slug), req.auth!);
    res.status(204).end();
  };
}
