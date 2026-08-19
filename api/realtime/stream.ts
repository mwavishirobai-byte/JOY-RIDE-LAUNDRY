import { db, dbReady } from '../../server/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end();
  }

  try {
    await dbReady;
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    res.write(`event: connected\ndata: ${JSON.stringify({ ok: true, time: new Date().toISOString() })}\n\n`);

    const unsubscribe = db.subscribeSSE((event, data) => {
      try {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch {
        unsubscribe();
      }
    });

    const heartbeat = setInterval(() => {
      try { res.write(`: heartbeat ${Date.now()}\n\n`); } catch {}
    }, 25000);

    const cleanup = () => {
      clearInterval(heartbeat);
      unsubscribe();
    };
    req.on?.('close', cleanup);
    req.on?.('aborted', cleanup);
  } catch (err: any) {
    console.error('Realtime stream failed:', err?.message);
    if (!res.headersSent) return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Realtime stream failed' } });
    res.end();
  }
}
