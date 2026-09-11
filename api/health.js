import { SUPABASE_URL, SERVICE_KEY } from './_lib/service.js';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ ok: false });
  try {
    if (!SUPABASE_URL || !SERVICE_KEY) throw new Error('not_configured');
    const response = await fetch(`${SUPABASE_URL}/rest/v1/movies?select=id&limit=1`, {
      method: 'HEAD', headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error('database_unavailable');
    return res.status(200).json({ ok: true, database: true });
  } catch { return res.status(503).json({ ok: false, database: false }); }
}
