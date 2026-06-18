// Vercel serverless function — /api/track
//   POST  { type, movieId?, title? }      → records one analytics event
//   GET   ?since=<ISO>                     → returns today's counts per type
//
// Writes go through the SERVICE_ROLE key so the public.events table stays fully
// locked under RLS (see supabase/migrations/004_events.sql). The anon key bundled
// in the client can neither read nor write events directly.
//
// Setup: add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars. The project URL is read
// from SUPABASE_URL or the existing VITE_SUPABASE_URL.

const ALLOWED_TYPES = new Set(['trailer_play', 'purchase', 'signup', 'subscription', 'movie_view']);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function setCors(req, res) {
  const origin = req.headers.origin;
  // Same-origin calls (the live site → its own /api) don't need CORS at all; this
  // just lets known origins call it too. Tracking is non-sensitive and idempotent.
  if (origin && (/\.vercel\.app$/.test(origin) || /youmaketv\.ai$/.test(origin) || /^http:\/\/localhost:\d+$/.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // If the service key isn't configured, degrade gracefully so the client can
  // show "tracking not connected" rather than erroring.
  if (!SUPABASE_URL || !SERVICE_KEY) {
    if (req.method === 'GET') return res.status(200).json({ configured: false, counts: {} });
    return res.status(200).json({ ok: false, configured: false });
  }

  const restHeaders = {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
  };

  // ── Record an event ──────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const { type, movieId, title } = req.body ?? {};
    if (!ALLOWED_TYPES.has(type)) {
      return res.status(400).json({ error: 'Invalid event type' });
    }
    const row = {
      type,
      movie_id: Number.isFinite(movieId) ? movieId : null,
      title: title ? String(title).slice(0, 200) : null,
    };
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/events`, {
        method: 'POST',
        headers: { ...restHeaders, Prefer: 'return=minimal' },
        body: JSON.stringify(row),
      });
      if (!r.ok) {
        console.error('track insert failed:', r.status, await r.text());
        return res.status(502).json({ ok: false });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error('track insert exception:', err);
      return res.status(500).json({ ok: false });
    }
  }

  // ── Read today's counts ──────────────────────────────────────────────────
  if (req.method === 'GET') {
    const sinceRaw = req.query?.since;
    const since = sinceRaw && !Number.isNaN(Date.parse(sinceRaw))
      ? new Date(sinceRaw).toISOString()
      : new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    try {
      const url = `${SUPABASE_URL}/rest/v1/events?select=type&created_at=gte.${encodeURIComponent(since)}&limit=100000`;
      const r = await fetch(url, { headers: restHeaders });
      if (!r.ok) {
        console.error('track read failed:', r.status, await r.text());
        return res.status(200).json({ configured: true, counts: {} });
      }
      const rows = await r.json();
      const counts = {};
      for (const { type } of rows) counts[type] = (counts[type] ?? 0) + 1;
      return res.status(200).json({ configured: true, counts });
    } catch (err) {
      console.error('track read exception:', err);
      return res.status(200).json({ configured: true, counts: {} });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
