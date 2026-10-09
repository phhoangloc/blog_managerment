import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { AppError } from '../utils/AppError';

export const parseId = (raw: unknown) => {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'Invalid id');
  return id;
};

export class UserController {
  constructor(private readonly users: UserService) {}

  list = async (_req: Request, res: Response) => {
    res.json(await this.users.list());
  };
  get = async (req: Request, res: Response) => {
    res.json(await this.users.get(parseId(req.params.id)));
  };
  create = async (req: Request, res: Response) => {
    res.status(201).json(await this.users.create(req.body));
  };
  update = async (req: Request, res: Response) => {
    res.json(await this.users.update(parseId(req.params.id), req.body));
  };
  // self-service for the logged-in user (req.auth is set by authenticate)
  me = async (req: Request, res: Response) => {
    res.json(await this.users.get(req.auth!.id));
  };
  updateMe = async (req: Request, res: Response) => {
    res.json(await this.users.update(req.auth!.id, req.body));
  };
  remove = async (req: Request, res: Response) => {
    await this.users.remove(parseId(req.params.id));
    res.status(204).end();
  };
}
