import cors from 'cors';
import express from 'express';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { buildRouter } from './routes';
import { Broadcaster } from './services/RealtimeHub';

export function createApp(hub: Broadcaster) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/public/upload', express.static(env.uploadDir));
  app.use('/api', buildRouter(hub));
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
  app.use(errorHandler);
  return app;
}
