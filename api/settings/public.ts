import { createClient } from '@supabase/supabase-js';
import { INITIAL_SETTINGS } from '../../server/db-supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' } }); }
  try {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return res.status(500).json({ success: false, error: { code: 'CONFIG_ERROR', message: 'Supabase server configuration is missing' } });
    const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await client.from('app_state').select('data').eq('id', 'main').maybeSingle();
    if (error) throw error;
    return res.status(200).json({ success: true, data: data?.data?.settings || INITIAL_SETTINGS });
  } catch (err: any) {
    console.error('Public settings endpoint failed:', err?.message);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err?.message || 'Unable to load public settings' } });
  }
}
