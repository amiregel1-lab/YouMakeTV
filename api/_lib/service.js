// Service-to-service auth + Supabase plumbing for the /api/admin/* endpoints
// that Growth OS calls.
//
// Files under /api whose name starts with "_" are not routed by Vercel, so this
// module is shared code only — it is never reachable as an endpoint.
//
// ── Two doors, deliberately separate ────────────────────────────────────────
//
// `_lib/session.js` guards the BROWSER console at youmaketv.ai/superadmin: a
// human types a password, gets a 12-hour signed token, and the token travels in
// a request body from a page this deployment served.
//
// This module guards the MACHINE door. Growth OS's YouMakeTV desk is a server
// on another host; it authenticates with a single long-lived shared secret in
// the `x-service-token` header, checked against GROWTH_OS_SERVICE_TOKEN. That
// secret is not a login — it grants full read/write on the catalog with the
// service-role key behind it — so it must never be handed to a browser and the
// endpoints that use it never set an Access-Control-Allow-Origin header. A
// browser therefore cannot call them cross-origin at all, which is the point:
// there is no origin that legitimately calls these from a page.
//
// The compare is timing-safe and hides the length of the expected value, using
// the same HMAC-both-sides trick as session.js. The HMAC key there is the
// admin session secret; here it is the expected token itself, which is a secret
// of the same standing — an attacker cannot compute either digest without it.

import crypto from 'node:crypto';
import { timingSafeEqualStrings, verifySessionToken } from './session.js';

/** Longer than any real token; a cheap guard before any crypto runs. */
const MAX_TOKEN_LENGTH = 512;
/** A shared secret shorter than this is a typo, not a credential. */
const MIN_TOKEN_LENGTH = 24;

export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
export const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Standard headers for these endpoints.
 *
 * No CORS headers at all: see the note above. `no-store` because every one of
 * these answers is either live catalog state or a freshly minted upload token.
 */
export function setServiceHeaders(res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

/**
 * Gate a request. Returns `true` when the caller may proceed; otherwise it has
 * already written the response and the handler must return immediately.
 *
 * Failures are deliberately uniform — 401 with one sentence, never "wrong
 * token" versus "no token" versus "not configured for you". The one exception
 * is 503, which says the DEPLOYMENT is unconfigured; that is a fact about this
 * server that leaks nothing about the secret, and without it a missing env var
 * looks exactly like a bad token to the operator trying to fix it.
 */
export function requireServiceToken(req, res) {
  const expected = process.env.GROWTH_OS_SERVICE_TOKEN;

  if (!expected || expected.length < MIN_TOKEN_LENGTH) {
    console.error(
      'GROWTH_OS_SERVICE_TOKEN is missing or too short — the admin service API is closed.'
    );
    res.status(503).json({ error: 'service api not configured' });
    return false;
  }

  const provided = req.headers['x-service-token'];
  if (typeof provided !== 'string' || !provided || provided.length > MAX_TOKEN_LENGTH) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }

  if (!timingSafeEqualStrings(provided, expected, expected)) {
    res.status(401).json({ error: 'unauthorized' });
    return false;
  }

  return true;
}

/**
 * Gate a request that BOTH doors may open: Growth OS's machine token, or the
 * browser Super Admin console's signed session.
 *
 * Why the console is let in here: `upsertMovie` and the cover/trailer uploads in
 * the browser console used to write to PostgREST and Storage with the PUBLIC
 * anon key. After migration 003 removed the anon write policies those saves
 * fail silently at best; at worst the policies are still in place, in which case
 * anyone holding the bundled anon key can overwrite the catalog. Either way the
 * browser has no business writing directly. It now calls these endpoints, which
 * write server-side with the service-role key behind an allowlist.
 *
 * The session token is proof of a password typed against ADMIN_PASSWORD and is
 * checked exactly as /api/admin/verify checks it — signature first, expiry
 * inside the signed payload. It arrives in `x-admin-token`. These endpoints
 * still set no Access-Control-Allow-Origin header, so only a page this
 * deployment served (same-origin) can reach them from a browser at all.
 *
 * Returns true when the caller may proceed; otherwise the response is already
 * written. On success `req.authActor` names who it was, for the audit stamp.
 */
export function requireServiceOrAdmin(req, res) {
  const adminToken = req.headers['x-admin-token'];
  const serviceToken = req.headers['x-service-token'];

  // Only consider the browser door when the machine door was not attempted, so
  // a malformed service token still fails as a service token.
  if (typeof adminToken === 'string' && adminToken && !(typeof serviceToken === 'string' && serviceToken)) {
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
      console.error('ADMIN_SESSION_SECRET is not set — no admin session can be validated.');
      res.status(503).json({ error: 'admin session not configured' });
      return false;
    }
    const payload = verifySessionToken(adminToken, secret);
    if (!payload) {
      res.status(401).json({ error: 'unauthorized' });
      return false;
    }
    req.authActor = `admin:${String(payload.un ?? 'unknown').slice(0, 100)}`;
    return true;
  }

  if (!requireServiceToken(req, res)) return false;
  const actor = req.headers['x-service-actor'];
  req.authActor = typeof actor === 'string' && actor ? actor.slice(0, 200) : 'growth-os';
  return true;
}

/**
 * Confirm the Supabase service-role credentials are present.
 *
 * Same shape as `requireServiceToken`: `true` means proceed, `false` means the
 * response is already written. Stated plainly rather than degraded to an empty
 * list — a desk that shows "0 movies" when the real answer is "this server has
 * no database key" is worse than one that shows the reason.
 */
export function requireSupabase(res) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error(
      'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not both set — the admin service API cannot reach the catalog.'
    );
    res.status(503).json({
      error:
        'Supabase is not configured on this deployment (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY).',
    });
    return false;
  }
  return true;
}

/** REST headers for PostgREST and Storage. The service role bypasses RLS. */
export function restHeaders(extra = {}) {
  return {
    apikey: SERVICE_KEY,
    Authorization: `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    ...extra,
  };
}

/**
 * One PostgREST call. Never throws: returns `{ ok, status, data, error }` so a
 * handler can pass the database's own words through instead of inventing them.
 */
export async function pgrest(path, init = {}) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      ...init,
      headers: restHeaders(init.headers ?? {}),
    });
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
    if (!res.ok) {
      const message =
        (data && (data.message || data.error || data.hint)) || text.slice(0, 300) || `status ${res.status}`;
      return { ok: false, status: res.status, data: null, error: message };
    }
    return { ok: true, status: res.status, data, error: null };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err instanceof Error ? err.message : 'unknown network error',
    };
  }
}

/** Reject anything but the listed methods, with a correct Allow header. */
export function methodGuard(req, res, allowed) {
  if (allowed.includes(req.method)) return true;
  res.setHeader('Allow', allowed.join(', '));
  res.status(405).json({ error: 'Method not allowed' });
  return false;
}

/**
 * Vercel parses JSON bodies for us, but a hand-rolled caller can still send a
 * string. Accept both; never throw on garbage.
 */
export function readJsonBody(req) {
  const body = req.body;
  if (!body) return {};
  if (typeof body === 'object') return body;
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

export { crypto };
