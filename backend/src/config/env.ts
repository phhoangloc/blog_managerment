import 'dotenv/config';
import path from 'path';

export const env = {
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'public/upload'),
};
