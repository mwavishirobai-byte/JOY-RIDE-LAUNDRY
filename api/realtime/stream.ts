import { createVercelApp } from '../../server/vercel-app.js';

const appPromise = createVercelApp();

export default async function handler(req: any, res: any) {
  const originalUrl = req.url;
  const originalOriginalUrl = req.originalUrl;
  req.url = `/api/realtime/stream${req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;
  req.originalUrl = req.url;
  try {
    return await (await appPromise)(req, res);
  } finally {
    req.url = originalUrl;
    req.originalUrl = originalOriginalUrl;
  }
}
