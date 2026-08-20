import express from 'express';

export async function createVercelApp() {
  // Vercel exposes the public project URL as NEXT_PUBLIC_SUPABASE_URL.
  // The server-side adapter uses SUPABASE_URL, so normalize it before the
  // database module is imported (the module creates its client at import time).
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  // Import only after environment normalization. Do NOT await dbReady here:
  // a database initialization failure must not prevent Vercel from serving
  // /api/health or from returning a useful HTTP response.
  const [{ db, dbReady }, { default: apiRouter }] = await Promise.all([
    import('./db-supabase'),
    import('./api'),
  ]);

  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // This endpoint intentionally has NO database dependency. It is the first
  // production diagnostic and must return 200 even if Supabase is unavailable.
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      status: 'ok',
      business: 'Joy and Ride Laundry',
      time: new Date().toISOString(),
    });
  });

  // Database-backed endpoints wait for initialization explicitly. If the
  // database cannot initialize, return 503 instead of allowing a rejected
  // startup promise to become a generic Vercel FUNCTION_INVOCATION_FAILED.
  const requireDatabase = async (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      await dbReady;
      next();
    } catch (err: any) {
      console.error('Supabase initialization failed:', err?.message, err?.stack);
      if (res.headersSent) return;
      res.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'Laundry service is temporarily unavailable. Please try again shortly.',
        },
      });
    }
  };

  app.get('/api/settings/public', requireDatabase, (_req, res) => {
    try {
      const settings = (db as any).getSettings?.();
      return res.status(200).json({ success: true, data: settings });
    } catch (err: any) {
      console.error('Public settings error:', err?.message, err?.stack);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Unable to load public settings' },
      });
    }
  });

  app.get('/api/realtime/stream', requireDatabase, (req, res) => {
    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const send = (event: string, data: any) => {
      if (!res.writableEnded) {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      }
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

  // All normal API endpoints are database-backed, so protect the router from
  // an unhandled dbReady rejection and return a deterministic 503 instead of
  // crashing the serverless function.
  app.use('/api', requireDatabase, apiRouter);

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
