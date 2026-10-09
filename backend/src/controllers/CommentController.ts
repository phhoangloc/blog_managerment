import { Request, Response } from 'express';
import { CommentService } from '../services/CommentService';
import { LikeService } from '../services/LikeService';
import { parseId } from './UserController';

export class CommentController {
  constructor(
    private readonly comments: CommentService,
    private readonly likes: LikeService,
  ) {}

  listPublic = async (req: Request, res: Response) => {
    res.json(await this.comments.listPublic(String(req.params.slug)));
  };
  create = async (req: Request, res: Response) => {
    res.status(201).json(await this.comments.create(String(req.params.slug), req.body.content, req.auth!));
  };
  list = async (req: Request, res: Response) => {
    res.json(await this.comments.list(req.auth!));
  };
  get = async (req: Request, res: Response) => {
    res.json(await this.comments.get(parseId(req.params.id), req.auth!));
  };
  update = async (req: Request, res: Response) => {
    res.json(await this.comments.update(parseId(req.params.id), req.body, req.auth!));
  };
  remove = async (req: Request, res: Response) => {
    await this.comments.remove(parseId(req.params.id), req.auth!);
    res.status(204).end();
  };

  getLike = async (req: Request, res: Response) => {
    res.json(await this.likes.get(String(req.params.slug), req.auth!));
  };
  setLike = async (req: Request, res: Response) => {
    res.json(await this.likes.set(String(req.params.slug), req.body.like, req.auth!));
  };
}
