import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { AppError } from '../utils/AppError';

export const validateBody = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const msg = result.error.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`).join('; ');
    return next(new AppError(400, msg));
  }
  req.body = result.data;
  next();
};
