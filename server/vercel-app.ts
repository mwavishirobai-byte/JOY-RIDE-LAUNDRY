import express from 'express';

export async function createVercelApp() {
  // The project template exposes the public Supabase URL as
  // NEXT_PUBLIC_SUPABASE_URL, while the server adapter expects SUPABASE_URL.
  // Normalize it before importing any module that initializes Supabase.
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  // Database/API modules initialize at import time, so they must be loaded
  // only after the environment has been normalized.
  const [{ db, dbReady }, { default: apiRouter }] = await Promise.all([
    import('./db-supabase'),
    import('./api'),
  ]);

  await dbReady;
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      business: 'Joy and Ride Laundry',
      time: new Date().toISOString(),
    });
  });

  app.get('/api/settings/public', (_req, res) => {
    try {
      const settings = (db as any).getSettings?.();
      return res.status(200).json({ success: true, data: settings });
    } catch (err: any) {
      console.error('Public settings error:', err?.message);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Unable to load public settings' },
      });
    }
  });

  app.get('/api/realtime/stream', (req, res) => {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const send = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send('connected', { timestamp: new Date().toISOString() });
    const unsubscribe = db.subscribeSSE(send);
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) res.write(`: heartbeat ${Date.now()}\n\n`);
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      unsubscribe();
      if (!res.writableEnded) res.end();
    });
  });

  app.use('/api', apiRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'API_ROUTE_NOT_FOUND',
        message: 'The requested API endpoint does not exist.',
      },
    });
  });

  app.use((err: any, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled API error', {
      path: req.originalUrl,
      method: req.method,
      message: err?.message,
      stack: err?.stack,
    });
    if (res.headersSent) return;
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Internal server error' },
    });
  });

  return app;
}
