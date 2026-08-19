import jwt from 'jsonwebtoken';
import { db, dbReady } from '../../server/db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }); }
  try {
    await dbReady;
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    if (!token) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
    const secret = process.env.JWT_SECRET || 'joy-and-ride-laundry-secure-secret-key-eldoret';
    const decoded = jwt.verify(token, secret) as { id: string };
    const user = db.findUserById(decoded.id);
    if (!user) return res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists' } });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return res.status(200).json({ success: true, data: { user: safeUser } });
  } catch (err: any) {
    const code = err?.name === 'JsonWebTokenError' || err?.name === 'TokenExpiredError' ? 'INVALID_TOKEN' : 'SERVER_ERROR';
    return res.status(code === 'INVALID_TOKEN' ? 403 : 500).json({ success: false, error: { code, message: code === 'INVALID_TOKEN' ? 'Invalid or expired session token' : (err?.message || 'Unable to load session') } });
  }
}
