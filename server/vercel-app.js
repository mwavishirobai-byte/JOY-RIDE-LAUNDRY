import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const serverBundle = require('../dist/server.cjs');

export function createVercelApp() {
  return serverBundle.createApp();
}
