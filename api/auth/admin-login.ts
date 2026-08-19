import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, dbReady } from '../../server/db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }); }
  try {
    await dbReady;
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ success: false, error: { code: 'MISSING_CREDENTIALS', message: 'Admin email and password are required' } });
    const user = db.findUserByEmail(String(email));
    if (!user || user.role !== 'admin' || !bcrypt.compareSync(String(password), user.passwordHash)) return res.status(user && user.role !== 'admin' ? 403 : 401).json({ success: false, error: { code: user && user.role !== 'admin' ? 'FORBIDDEN' : 'UNAUTHORIZED_ADMIN', message: user && user.role !== 'admin' ? 'This account does not have administrative privileges' : 'Invalid administrative credentials' } });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    const secret = process.env.JWT_SECRET || 'joy-and-ride-laundry-secure-secret-key-eldoret';
    const token = jwt.sign({ id: safeUser.id, email: safeUser.email, role: safeUser.role, fullName: safeUser.fullName }, secret, { expiresIn: '7d' });
    db.addAuditLog(safeUser.email, 'admin', 'ADMIN_LOGIN', 'auth', safeUser.id, 'Administrator logged in successfully');
    return res.status(200).json({ success: true, data: { user: safeUser, token } });
  } catch (err: any) {
    console.error('Explicit admin login handler failed:', err?.message);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Admin login failed' } });
  }
}
