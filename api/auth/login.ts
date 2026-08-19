import { createVercelApp } from '../../server/vercel-app.js';
import { ensureConfiguredAdmin } from '../../server/admin-bootstrap.js';

const appPromise = createVercelApp();

export default async function handler(req: any, res: any) {
  await ensureConfiguredAdmin();
  return (await appPromise)(req, res);
}
