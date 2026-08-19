import { createVercelApp } from '../server/vercel-app.js';

const app = createVercelApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}
