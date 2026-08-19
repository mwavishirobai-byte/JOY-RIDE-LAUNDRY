import { createVercelApp } from '../../server/vercel-app.js';

const appPromise = createVercelApp();

export default async function handler(req: any, res: any) {
  return (await appPromise)(req, res);
}
