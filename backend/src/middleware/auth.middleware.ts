import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';
import { Role, TokenPayload, TokenService } from '../utils/tokenService';

declare module 'express-serve-static-core' {
  interface Request {
    auth?: TokenPayload;
  }
}

export const authenticate = (tokens: TokenService) => (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next(new AppError(401, 'Missing token'));
  try {
    req.auth = tokens.verify(header.slice(7));
    next();
  } catch {
    next(new AppError(401, 'Invalid or expired token'));
  }
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new AppError(401, 'Not authenticated'));
    if (!roles.includes(req.auth.role)) return next(new AppError(403, 'Forbidden'));
    next();
  };
