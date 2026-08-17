// Vercel serverless function — POST /api/admin/login
//
// Authenticates the Super Admin console. Credentials live ONLY in Vercel env
// vars and are never shipped to the browser:
//   ADMIN_USERNAME         — the admin login name
//   ADMIN_PASSWORD         — the admin password
//   ADMIN_SESSION_SECRET   — random 32+ byte string used to sign session tokens
//
// Request:  { username, password }
// Success:  200 { token, expiresAt }   token = HMAC-SHA256 signed { un, exp }
// Failure:  401 { error }              deliberately uniform — never says which
//                                      field was wrong, or whether the user exists
// Unconfigured: 503 — there is no fallback credential of any kind.

import {
  clientIp,
  setAdminCors,
  signSessionToken,
  timingSafeEqualStrings,
} from '../_lib/session.js';

const MAX_FIELD_LENGTH = 200;

// ── In-memory rate limit ────────────────────────────────────────────────────
// 5 failed attempts per IP per 15 minutes. Serverless instances are recycled,
// so this is a speed bump against credential stuffing, not a hard guarantee —
// it costs nothing and blunts the common case where one instance stays warm.
const RATE_LIMIT_MAX_FAILS = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const attempts = new Map(); // ip -> { count, resetAt }

function isRateLimited(ip) {
  const entry = attempts.get(ip);
  if (!entry) return false;
  if (Date.now() >= entry.resetAt) {
    attempts.delete(ip);
    return false;
  }
  return entry.count >= RATE_LIMIT_MAX_FAILS;
}

function recordFailure(ip) {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now >= entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
  // Opportunistic cleanup so a long-lived instance can't grow unbounded.
  if (attempts.size > 5000) {
    for (const [key, value] of attempts) {
      if (now >= value.resetAt) attempts.delete(key);
    }
  }
}

export default async function handler(req, res) {
  setAdminCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!expectedUser || !expectedPass || !secret) {
    console.error(
      'Admin login is not configured — set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET.'
    );
    return res.status(503).json({ error: 'admin login not configured' });
  }

  const ip = clientIp(req);
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in a few minutes.' });
  }

  const { username, password } = req.body ?? {};
  const trimUser = String(username ?? '').trim();
  const rawPass = String(password ?? '');

  if (!trimUser || !rawPass) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (trimUser.length > MAX_FIELD_LENGTH || rawPass.length > MAX_FIELD_LENGTH) {
    return res.status(400).json({ error: 'One or more fields exceed the allowed length.' });
  }

  // Both comparisons always run — no short-circuit on the username, so a wrong
  // username and a wrong password cost the same time.
  const userOk = timingSafeEqualStrings(trimUser, expectedUser, secret);
  const passOk = timingSafeEqualStrings(rawPass, expectedPass, secret);

  if (!userOk || !passOk) {
    recordFailure(ip);
    return res.status(401).json({ error: 'Invalid Super Admin credentials.' });
  }

  attempts.delete(ip);

  const { token, expiresAt } = signSessionToken(expectedUser, secret);
  return res.status(200).json({ token, expiresAt });
}
