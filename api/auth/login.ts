import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, dbReady } from '../../server/db';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  try {
    await dbReady;
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { code: 'MISSING_CREDENTIALS', message: 'Email and password are required' } });
    }

    const user = db.findUserByEmail(String(email));
    if (!user || !bcrypt.compareSync(String(password), user.passwordHash)) {
      return res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } });
    }

    const { passwordHash: _passwordHash, ...safeUser } = user;
    const secret = process.env.JWT_SECRET || 'joy-and-ride-laundry-secure-secret-key-eldoret';
    const token = jwt.sign({ id: safeUser.id, email: safeUser.email, role: safeUser.role, fullName: safeUser.fullName }, secret, { expiresIn: '7d' });

    return res.status(200).json({ success: true, data: { user: safeUser, token } });
  } catch (err: any) {
    console.error('Explicit login handler failed:', err?.message);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Login failed' } });
  }
}
