import { createVercelApp } from '../server/vercel-app.js';

const appPromise = createVercelApp();

export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return app(req, res);
}
