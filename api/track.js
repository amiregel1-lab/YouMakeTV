// Vercel serverless function — /api/track
//   POST  { type, movieId?, title? }      → records one analytics event
//   GET   ?since=<ISO>                     → returns counts per type (authenticated)
//
// Writes go through the SERVICE_ROLE key so the public.events table stays fully
// locked under RLS (see supabase/migrations/004_events.sql). The anon key bundled
// in the client can neither read nor write events directly.
//
// Setup: add SUPABASE_SERVICE_ROLE_KEY to Vercel env vars. The project URL is read
// from SUPABASE_URL or the existing VITE_SUPABASE_URL.
//
// ── Who may call this ───────────────────────────────────────────────────────
//
// POST is still unauthenticated — it has to be, it runs on every trailer play —
// but it is no longer unconditional. The origin allowlist is the anchored one
// from _lib/session.js (the old regex `/youmaketv\.ai$/` also matched
// `https://evil-youmaketv.ai`, and `/\.vercel\.app$/` matched every deployment on
// the internet), a request carrying neither Origin nor Referer is dropped, and
// one IP may write a bounded number of events per minute. None of that stops a
// determined script, but it ends the "anyone can inflate every number on the
// dashboard and grow the table without bound" case.
//
// GET is authenticated. It returns platform-wide engagement — signups,
// purchases, subscriptions — which is competitor-readable business data, so it
// answers only the Growth OS service token or a signed admin session.

import {
  clientIp,
  isAllowedOrigin,
  timingSafeEqualStrings,
  verifySessionToken,
} from './_lib/session.js';

const ALLOWED_TYPES = new Set(['trailer_play', 'purchase', 'signup', 'subscription', 'movie_view']);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ── In-memory rate limit ────────────────────────────────────────────────────
// 60 events per IP per minute — far above what a person browsing can produce,
// far below what a script needs to be worth running. Serverless instances are
// recycled, so this is a speed bump, not a guarantee; it mirrors the one in
// api/admin/login.js.
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const hits = new Map(); // ip -> { count, resetAt }

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now >= entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    // Opportunistic cleanup so a long-lived instance can't grow unbounded.
    if (hits.size > 5000) {
      for (const [key, value] of hits) if (now >= value.resetAt) hits.delete(key);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function setCors(req, res) {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, x-service-token');
  res.setHeader('Cache-Control', 'no-store');
}

/**
 * Where did this event come from? A browser always sends Origin on a
 * same-origin fetch POST, and Referer on a normal navigation; a bare curl sends
 * neither. Events whose provenance cannot be checked are dropped.
 */
function originIsAcceptable(req) {
  const origin = req.headers.origin;
  if (origin) return isAllowedOrigin(origin);

  const referer = req.headers.referer;
  if (!referer) return false;
  try {
    return isAllowedOrigin(new URL(referer).origin);
  } catch {
    return false;
  }
}

/** Growth OS's service token, or a signed admin console session. */
function readerIsAuthorised(req) {
  const serviceToken = req.headers['x-service-token'];
  const expected = process.env.GROWTH_OS_SERVICE_TOKEN;
  if (
    typeof serviceToken === 'string' &&
    serviceToken &&
    serviceToken.length <= 512 &&
    expected &&
    expected.length >= 24 &&
    timingSafeEqualStrings(serviceToken, expected, expected)
  ) {
    return true;
  }

  const adminToken = req.headers['x-admin-token'];
  const secret = process.env.ADMIN_SESSION_SECRET;
  return Boolean(secret && typeof adminToken === 'string' && verifySessionToken(adminToken, secret));
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
    if (!originIsAcceptable(req)) {
      return res.status(403).json({ ok: false });
    }
    if (isRateLimited(clientIp(req))) {
      return res.status(429).json({ ok: false, error: 'Too many events.' });
    }

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

  // ── Read counts ──────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    if (!readerIsAuthorised(req)) {
      return res.status(401).json({ error: 'unauthorized' });
    }

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
