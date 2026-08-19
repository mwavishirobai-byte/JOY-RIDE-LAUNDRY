import bcrypt from 'bcryptjs';
import { db, dbReady } from './db.js';

let syncPromise: Promise<void> | null = null;

/**
 * Synchronize the hidden production admin credentials into the existing
 * application user store. Credentials are read only from server-side
 * environment variables and the password is stored as a bcrypt hash.
 */
export function ensureConfiguredAdmin(): Promise<void> {
  if (syncPromise) return syncPromise;

  syncPromise = dbReady.then(async () => {
    const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || '';

    if (!email || !password) {
      console.warn('ADMIN_EMAIL/ADMIN_PASSWORD are not configured; skipping admin bootstrap.');
      return;
    }

    const existing = db.findUserByEmail(email);
    if (!existing) {
      db.createUser({
        fullName: 'Joy and Ride Admin',
        email,
        phone: '0741775878',
        role: 'admin',
        address: 'Hawai Road, Eldoret',
        area: 'Hawai Road & Environs',
        password,
      });
      console.info(`Admin account initialized for ${email}`);
      return;
    }

    const passwordMatches = existing.passwordHash
      ? bcrypt.compareSync(password, existing.passwordHash)
      : false;

    const updates: any = {};
    if (existing.role !== 'admin') updates.role = 'admin';
    if (!passwordMatches) updates.passwordHash = bcrypt.hashSync(password, 10);

    if (Object.keys(updates).length > 0) {
      db.updateUserProfile(existing.id, updates);
      console.info(`Admin credentials synchronized for ${email}`);
    }
  }).catch((error) => {
    syncPromise = null;
    throw error;
  });

  return syncPromise;
}
