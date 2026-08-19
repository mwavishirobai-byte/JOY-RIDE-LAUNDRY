import { createVercelApp } from '../server/vercel-app';

const app = createVercelApp();

export default function handler(req: any, res: any) {
  return app(req, res);
}
