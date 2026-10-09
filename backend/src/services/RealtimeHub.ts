// Pushes comment / like events to the pages that are open on a blog.
// Writes stay on REST; the socket only broadcasts.
export type RealtimeEvent =
  | { type: 'comment:created'; slug: string; comment: unknown; commentCount: number }
  | { type: 'comment:updated'; slug: string; comment: unknown; commentCount: number }
  | { type: 'comment:deleted'; slug: string; id: number; commentCount: number }
  | { type: 'like:changed'; slug: string; likeCount: number };

export interface Broadcaster {
  publish(event: RealtimeEvent): void;
}

// The part of a WebSocket the hub needs, so it can be tested without a network
export interface HubSocket {
  send(data: string): void;
  on(event: 'message', cb: (data: unknown) => void): void;
  on(event: 'close', cb: () => void): void;
}

export class RealtimeHub implements Broadcaster {
  private readonly subscriptions = new Map<HubSocket, Set<string>>();

  connect(socket: HubSocket) {
    this.subscriptions.set(socket, new Set());
    socket.on('message', (raw) => this.handle(socket, raw));
    socket.on('close', () => this.subscriptions.delete(socket));
  }

  publish(event: RealtimeEvent) {
    const message = JSON.stringify(event);
    for (const [socket, slugs] of this.subscriptions) {
      if (!slugs.has(event.slug)) continue;
      try {
        socket.send(message);
      } catch {
        this.subscriptions.delete(socket);
      }
    }
  }

  private handle(socket: HubSocket, raw: unknown) {
    let msg: { type?: unknown; slug?: unknown };
    try {
      msg = JSON.parse(String(raw));
    } catch {
      return;
    }
    const slugs = this.subscriptions.get(socket);
    if (!slugs || typeof msg.slug !== 'string' || !msg.slug) return;
    if (msg.type === 'subscribe') slugs.add(msg.slug);
    else if (msg.type === 'unsubscribe') slugs.delete(msg.slug);
  }
}
