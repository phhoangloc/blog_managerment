import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  constructor(private readonly auth: AuthService) {}

  login = async (req: Request, res: Response) => {
    const { role, username, password } = req.body;
    res.json(await this.auth.login(role, username, password));
  };
}
