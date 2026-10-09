import { HubSocket, RealtimeHub } from '../../src/services/RealtimeHub';

// a socket we can drive by hand
const fakeSocket = () => {
  const handlers: Record<string, (data?: unknown) => void> = {};
  const socket = {
    send: jest.fn(),
    on: (event: string, cb: (data?: unknown) => void) => {
      handlers[event] = cb;
    },
    emit: (event: string, data?: unknown) => handlers[event](data),
  };
  return socket as typeof socket & HubSocket;
};

const event = { type: 'like:changed' as const, slug: 'hello', likeCount: 2 };

describe('RealtimeHub', () => {
  it('sends an event only to sockets subscribed to that blog', () => {
    const hub = new RealtimeHub();
    const a = fakeSocket();
    const b = fakeSocket();
    hub.connect(a);
    hub.connect(b);
    a.emit('message', JSON.stringify({ type: 'subscribe', slug: 'hello' }));
    b.emit('message', JSON.stringify({ type: 'subscribe', slug: 'other' }));

    hub.publish(event);

    expect(a.send).toHaveBeenCalledWith(JSON.stringify(event));
    expect(b.send).not.toHaveBeenCalled();
  });

  it('stops sending after unsubscribe', () => {
    const hub = new RealtimeHub();
    const a = fakeSocket();
    hub.connect(a);
    a.emit('message', JSON.stringify({ type: 'subscribe', slug: 'hello' }));
    a.emit('message', JSON.stringify({ type: 'unsubscribe', slug: 'hello' }));
    hub.publish(event);
    expect(a.send).not.toHaveBeenCalled();
  });

  it('forgets a socket that closed', () => {
    const hub = new RealtimeHub();
    const a = fakeSocket();
    hub.connect(a);
    a.emit('message', JSON.stringify({ type: 'subscribe', slug: 'hello' }));
    a.emit('close');
    hub.publish(event);
    expect(a.send).not.toHaveBeenCalled();
  });

  it('ignores malformed messages', () => {
    const hub = new RealtimeHub();
    const a = fakeSocket();
    hub.connect(a);
    expect(() => {
      a.emit('message', 'not json');
      a.emit('message', JSON.stringify({ type: 'subscribe' }));
      a.emit('message', JSON.stringify({ type: 'subscribe', slug: 5 }));
    }).not.toThrow();
    hub.publish(event);
    expect(a.send).not.toHaveBeenCalled();
  });

  it('drops a socket whose send throws instead of failing the publish', () => {
    const hub = new RealtimeHub();
    const bad = fakeSocket();
    const good = fakeSocket();
    bad.send.mockImplementation(() => {
      throw new Error('closed');
    });
    hub.connect(bad);
    hub.connect(good);
    bad.emit('message', JSON.stringify({ type: 'subscribe', slug: 'hello' }));
    good.emit('message', JSON.stringify({ type: 'subscribe', slug: 'hello' }));

    expect(() => hub.publish(event)).not.toThrow();
    expect(good.send).toHaveBeenCalledTimes(1);
    hub.publish(event);
    expect(bad.send).toHaveBeenCalledTimes(1);
  });
});
