import { createVercelApp } from '../../server/vercel-app.js';
import { ensureConfiguredAdmin } from '../../server/admin-bootstrap.js';

const appPromise = createVercelApp();

export default async function handler(req: any, res: any) {
  await ensureConfiguredAdmin();
  const originalUrl = req.url;
  const originalOriginalUrl = req.originalUrl;
  req.url = `/api/auth/login${req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;
  req.originalUrl = req.url;
  try {
    return await (await appPromise)(req, res);
  } finally {
    req.url = originalUrl;
    req.originalUrl = originalOriginalUrl;
  }
}
