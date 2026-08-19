import express from 'express';
import apiRouter from './api';
import { dbReady } from './db-supabase';

export async function createVercelApp() {
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
