import { createVercelApp } from '../server/vercel-app.js';

const appPromise = createVercelApp();

export default async function handler(req: any, res: any) {
  const originalUrl = req.url;
  const originalOriginalUrl = req.originalUrl;
  const incomingUrl = String(req.url || '/');
  req.url = incomingUrl === '/api' || incomingUrl.startsWith('/api/')
    ? incomingUrl
    : `/api${incomingUrl.startsWith('/') ? incomingUrl : `/${incomingUrl}`}`;
  req.originalUrl = req.url;
  try {
    return await (await appPromise)(req, res);
  } finally {
    req.url = originalUrl;
    req.originalUrl = originalOriginalUrl;
  }
}
