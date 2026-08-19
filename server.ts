import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/api';

export async function createApp() {
  const app = express();

  // JSON body parser with size limits
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Basic health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', business: 'Joy and Ride Laundry', time: new Date().toISOString() });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// Local development / traditional Node start.
if (process.env.VERCEL !== '1') {
  createApp()
    .then((app) => {
      const PORT = Number(process.env.PORT || 3000);
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Joy and Ride Laundry server running on http://0.0.0.0:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Fatal error starting Joy and Ride server:', err);
      process.exit(1);
    });
}

export default createApp;
