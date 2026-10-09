import { Request, Response } from 'express';
import { FileService } from '../services/FileService';
import { AppError } from '../utils/AppError';
import { parseId } from './UserController';

export class FileController {
  constructor(private readonly files: FileService) {}

  list = async (req: Request, res: Response) => {
    res.json(await this.files.list(req.auth!));
  };

  upload = async (req: Request, res: Response) => {
    if (!req.file) throw new AppError(400, 'file is required');
    const created = await this.files.upload(
      { name: req.body.name, detail: req.body.detail, originalName: req.file.originalname, buffer: req.file.buffer },
      req.auth!,
    );
    res.status(201).json(created);
  };

  get = async (req: Request, res: Response) => {
    res.json(await this.files.get(parseId(req.params.id), req.auth!));
  };

  update = async (req: Request, res: Response) => {
    const replacement = req.file ? { originalName: req.file.originalname, buffer: req.file.buffer } : undefined;
    res.json(await this.files.update(parseId(req.params.id), { ...req.body, replacement }, req.auth!));
  };

  remove = async (req: Request, res: Response) => {
    await this.files.remove(parseId(req.params.id), req.auth!);
    res.status(204).end();
  };
}
