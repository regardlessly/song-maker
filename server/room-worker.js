// SongKaki "Play Together" room relay — Cloudflare Worker + Durable Object.
// Lets phones in a room auto-start in sync: the host sends {type:"start"} and the
// server fan-outs it to everyone else in the same room code. Deploy = optional;
// without it, "Play Together" still works via shared link + synchronized count-in.
//
// Deploy notes are appended to server/README.md.

export class Room {
  constructor(state) { this.state = state; this.clients = new Set(); }
  async fetch(req) {
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('expected websocket', { status: 426 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.clients.add(server);
    server.addEventListener('message', (ev) => {
      for (const c of this.clients) if (c !== server) { try { c.send(ev.data); } catch (e) {} }
    });
    const drop = () => this.clients.delete(server);
    server.addEventListener('close', drop);
    server.addEventListener('error', drop);
    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const code = (url.searchParams.get('room') || 'LOBBY').toUpperCase().slice(0, 8);
    if (req.headers.get('Upgrade') !== 'websocket')
      return new Response('SongKaki room relay — connect via WebSocket with ?room=CODE', { status: 426 });
    const id = env.ROOMS.idFromName(code);
    return env.ROOMS.get(id).fetch(req);
  },
};
