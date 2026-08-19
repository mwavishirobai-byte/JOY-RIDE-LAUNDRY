import { INITIAL_SETTINGS } from '../../server/db-supabase.js';
import { db } from '../../server/db.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } });
  }

  try {
    // Use the same server-side Supabase-backed database instance as the working
    // /api/services endpoint. Do not create a second client or depend on
    // NEXT_PUBLIC_* variables inside a serverless function.
    await db.ready;
    const settings = db.getSettings();

    return res.status(200).json({
      success: true,
      data: settings || INITIAL_SETTINGS,
    });
  } catch (err: any) {
    console.error('Public settings endpoint failed:', err?.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: err?.message || 'Unable to load public settings' },
    });
  }
}
