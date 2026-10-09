import { Request, Response } from 'express';
import { AdminService } from '../services/AdminService';
import { parseId } from './UserController';

export class AdminController {
  constructor(private readonly admins: AdminService) {}

  list = async (_req: Request, res: Response) => {
    res.json(await this.admins.list());
  };
  get = async (req: Request, res: Response) => {
    res.json(await this.admins.get(parseId(req.params.id)));
  };
  create = async (req: Request, res: Response) => {
    res.status(201).json(await this.admins.create(req.body));
  };
  update = async (req: Request, res: Response) => {
    res.json(await this.admins.update(parseId(req.params.id), req.body));
  };
  remove = async (req: Request, res: Response) => {
    await this.admins.remove(parseId(req.params.id), req.auth!.id);
    res.status(204).end();
  };
  // self-service for the logged-in admin
  me = async (req: Request, res: Response) => {
    res.json(await this.admins.get(req.auth!.id));
  };
  updateMe = async (req: Request, res: Response) => {
    res.json(await this.admins.update(req.auth!.id, req.body));
  };
}
