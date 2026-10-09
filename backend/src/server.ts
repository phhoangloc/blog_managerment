import http from 'http';
import { WebSocketServer } from 'ws';
import { createApp } from './app';
import { env } from './config/env';
import { RealtimeHub } from './services/RealtimeHub';

const hub = new RealtimeHub();
const server = http.createServer(createApp(hub));

// live comment / like updates for the pages that are open on a blog
new WebSocketServer({ server, path: '/ws' }).on('connection', (socket) => hub.connect(socket));

server.listen(env.port, () => console.log(`Server listening on port ${env.port}`));
