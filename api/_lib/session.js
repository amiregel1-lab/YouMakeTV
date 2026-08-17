// Admin session tokens — HMAC-SHA256 signed, stateless.
//
// Files under /api whose name starts with "_" are not routed by Vercel, so this
// module is shared code only — it is never reachable as an endpoint.
//
// Token format:  base64url(JSON payload) + "." + base64url(HMAC-SHA256(payload))
// Payload:       { un: <username>, exp: <epoch ms> }
//
// The signature is computed over the *encoded* payload string, so verification
// never has to trust parsed JSON before the signature checks out. There is no
// server-side session store: expiry lives inside the signed payload.

import crypto from 'node:crypto';

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function b64urlEncode(input) {
  return Buffer.from(input).toString('base64url');
}

function b64urlDecode(input) {
  return Buffer.from(String(input), 'base64url');
}

// Constant-time equality that also hides the *length* of the compared values.
// timingSafeEqual throws on length mismatch (and a raw length check leaks how
// long the real secret is), so both sides are first run through HMAC-SHA256 —
// always 32 bytes, regardless of input length.
export function timingSafeEqualStrings(a, b, hmacKey) {
  const digest = (value) =>
    crypto.createHmac('sha256', hmacKey).update(Buffer.from(String(value), 'utf8')).digest();
  return crypto.timingSafeEqual(digest(a), digest(b));
}

export function signSessionToken(username, secret, ttlMs = SESSION_TTL_MS) {
  const expiresAt = Date.now() + ttlMs;
  const payload = b64urlEncode(JSON.stringify({ un: String(username), exp: expiresAt }));
  const signature = b64urlEncode(crypto.createHmac('sha256', secret).update(payload).digest());
  return { token: `${payload}.${signature}`, expiresAt };
}

// Returns the decoded payload when the token is well-formed, correctly signed
// and unexpired; null in every other case. Never throws.
export function verifySessionToken(token, secret) {
  if (!secret || typeof token !== 'string' || token.length > 4096) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expected = crypto.createHmac('sha256', secret).update(payload).digest();
  const provided = b64urlDecode(signature);
  if (provided.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(provided, expected)) return null;

  let decoded;
  try {
    decoded = JSON.parse(b64urlDecode(payload).toString('utf8'));
  } catch {
    return null;
  }

  if (!decoded || typeof decoded !== 'object') return null;
  if (typeof decoded.exp !== 'number' || !Number.isFinite(decoded.exp)) return null;
  if (Date.now() >= decoded.exp) return null;

  return decoded;
}

// ── Shared HTTP helpers for the admin endpoints ─────────────────────────────

const ALLOWED_ORIGINS = new Set([
  'https://youmaketv.ai',
  'https://www.youmaketv.ai',
  'http://localhost:5173',
  'http://localhost:4173',
]);

// Deploy previews live on *.vercel.app. '*' is never used — these endpoints
// mint and validate admin credentials.
function isAllowedOrigin(origin) {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return /^https:\/\/[a-z0-9._-]+\.vercel\.app$/i.test(origin);
}

export function setAdminCors(req, res) {
  const origin = req.headers.origin;
  if (isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
}

export function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] ?? '');
  const first = forwarded.split(',')[0].trim();
  return first || req.socket?.remoteAddress || 'unknown';
}
