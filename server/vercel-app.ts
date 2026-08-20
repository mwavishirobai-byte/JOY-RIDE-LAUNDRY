import express from 'express';
import { INITIAL_SETTINGS } from './db-supabase';

export async function createVercelApp() {
  // AI Studio's generated environment template uses NEXT_PUBLIC_SUPABASE_URL,
  // while the server database adapter expects SUPABASE_URL. Normalize the
  // server-side name before importing anything that initializes the database.
  if (!process.env.SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  }

  // Load the database/API modules only after environment normalization. Their
  // module initialization creates the Supabase client immediately.
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

  // These two routes are part of the browser API contract but are not defined
  // in server/api.ts. Keep them in the same Vercel Express application.
  app.get('/api/settings/public', (_req, res) => {
    try {
      const settings = (db as any).getSettings?.() ?? INITIAL_SETTINGS;
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
