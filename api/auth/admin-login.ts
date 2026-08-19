import { createVercelApp } from '../../server/vercel-app.js';

const appPromise = createVercelApp();

export default async function handler(req: any, res: any) {
  // Vercel invokes this function with the function path. Restore the
  // Express API path before delegating so the existing /auth/admin-login
  // router is matched exactly like the other API endpoints.
  const originalUrl = req.url;
  const originalOriginalUrl = req.originalUrl;
  req.url = `/api/auth/admin-login${req.url?.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''}`;
  req.originalUrl = req.url;
  try {
    return await (await appPromise)(req, res);
  } finally {
    req.url = originalUrl;
    req.originalUrl = originalOriginalUrl;
  }
}
