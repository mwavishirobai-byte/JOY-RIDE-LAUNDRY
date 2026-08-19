import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/api';
import { dbReady } from './server/db-supabase';

export async function createApp() {
  try {
    await dbReady;
  } catch (err) {
    console.error('Database initialization failed; continuing so API error handling can run:', err);
  }

  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', business: 'Joy and Ride Laundry', time: new Date().toISOString() });
  });

  app.use('/api', apiRouter);

  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (res.headersSent) return next(err);
    const message = err instanceof Error ? err.message : String(err);
    console.error('API request failed:', { method: req.method, path: req.path, name: err?.name, message, stack: err?.stack });
    return res.status(500).json({ success: false, error: { code: 'API_RUNTIME_ERROR', message } });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => { res.sendFile(path.join(distPath, 'index.html')); });
  }

  return app;
}

if (process.env.VERCEL !== '1') {
  createApp().then((app) => {
    const PORT = Number(process.env.PORT || 3000);
    app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Joy and Ride Laundry server running on http://0.0.0.0:${PORT}`));
  }).catch((err) => { console.error('Fatal error starting Joy and Ride server:', err); process.exit(1); });
}

export default createApp;