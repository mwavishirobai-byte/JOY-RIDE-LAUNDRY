import express from 'express';
import apiRouter from './api';

export function createVercelApp() {
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

  // API-only 404. Keep missing API responses JSON instead of allowing
  // the static frontend/host layer to return an HTML 404 response.
  app.use('/api', (_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'API_ROUTE_NOT_FOUND',
        message: 'The requested API endpoint does not exist.',
      },
    });
  });

  return app;
}
