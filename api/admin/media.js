// Vercel serverless function — POST /api/admin/media
//
// Mints ONE short-lived signed upload URL for the `covers` or `trailers`
// bucket, and hands back the public URL the object will have once the bytes
// land.
//
// Request:  { bucket: "covers" | "trailers", filename, contentType }
// Response: 200 { bucket, path, uploadUrl, token, publicUrl, expiresInSeconds }
//
// ── Why mint instead of proxy ───────────────────────────────────────────────
//
// Growth OS's desk needs to replace a poster or a trailer. A trailer is tens or
// hundreds of megabytes; streaming it through Growth OS and then through this
// function would hit two serverless body limits and pay for the same bytes
// three times. So this endpoint hands out a one-object, time-limited upload
// token and the bytes go straight from the operator's browser to Supabase
// Storage — the same mechanism the browser console already uses, except the
// token is minted with the SERVICE_ROLE key here instead of the public anon key,
// so no anon write policy on storage.objects is required (and migration 003's
// closing note says to drop any that remain).
//
// The token is scoped to exactly the path this function chose. A caller cannot
// name the path, so it cannot overwrite an unrelated object: the name is built
// from a sanitised basename, a timestamp and random bytes.
//
// Two doors — Growth OS's `x-service-token` against GROWTH_OS_SERVICE_TOKEN, or
// the browser Super Admin console's signed session in `x-admin-token`. The
// console used to mint its upload tokens with the public anon key; it now asks
// here, and the token is minted server-side with the service-role key.

import crypto from 'node:crypto';
import {
  SERVICE_KEY,
  SUPABASE_URL,
  methodGuard,
  readJsonBody,
  requireServiceOrAdmin,
  requireSupabase,
  setServiceHeaders,
} from '../_lib/service.js';

/**
 * The two buckets this deployment has, and what each will accept.
 *
 * `covers` holds posters AND backdrops — that is what the browser console does
 * today (uploadCover and uploadBackdrop both write there), and a third bucket
 * would orphan every existing backdrop.
 */
const BUCKETS = {
  covers: {
    types: ['image/jpeg', 'image/png', 'image/webp'],
    ext: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' },
  },
  trailers: {
    types: ['video/mp4', 'video/webm', 'video/quicktime'],
    ext: { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' },
  },
};

/**
 * Supabase's signed upload tokens are good for two hours, and that is not
 * configurable — the sign endpoint takes no options. It is reported to the
 * caller so the desk can tell an operator how long they have, rather than being
 * requested.
 */
const EXPIRES_IN_SECONDS = 7200;

/** Keep a recognisable stem, drop everything that could steer the path. */
function safeStem(filename) {
  const base = String(filename ?? '')
    .split(/[\\/]/)
    .pop()
    ?.replace(/\.[^.]+$/, '');
  const cleaned = (base ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return cleaned || 'upload';
}

export default async function handler(req, res) {
  setServiceHeaders(res);
  if (!methodGuard(req, res, ['POST'])) return;
  if (!requireServiceOrAdmin(req, res)) return;
  if (!requireSupabase(res)) return;

  const { bucket, filename, contentType } = readJsonBody(req);

  const spec = Object.hasOwn(BUCKETS, String(bucket)) ? BUCKETS[String(bucket)] : null;
  if (!spec) {
    return res
      .status(400)
      .json({ error: `bucket must be one of: ${Object.keys(BUCKETS).join(', ')}.` });
  }

  const type = String(contentType ?? '')
    .split(';')[0]
    .trim()
    .toLowerCase();
  if (!spec.types.includes(type)) {
    return res
      .status(400)
      .json({ error: `${bucket} accepts ${spec.types.join(', ')} — not ${type || 'an unnamed type'}.` });
  }

  const path = `${safeStem(filename)}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${spec.ext[type]}`;

  let signed;
  try {
    const r = await fetch(
      `${SUPABASE_URL}/storage/v1/object/upload/sign/${bucket}/${encodeURIComponent(path)}`,
      {
        method: 'POST',
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          'Content-Type': 'application/json',
        },
        // The endpoint takes no options; an empty object is what the official
        // client posts, and it keeps the request a well-formed JSON POST.
        body: JSON.stringify({}),
      }
    );
    const text = await r.text();
    if (!r.ok) {
      let message = text.slice(0, 300);
      try {
        const parsed = JSON.parse(text);
        message = parsed.message || parsed.error || message;
      } catch {
        /* keep the raw body */
      }
      console.error('media sign failed:', r.status, message);
      return res.status(502).json({ error: `Supabase Storage: ${message}` });
    }
    signed = JSON.parse(text);
  } catch (err) {
    console.error('media sign exception:', err);
    return res.status(502).json({ error: 'Supabase Storage could not be reached.' });
  }

  // `signed.url` comes back as a path relative to /storage/v1, e.g.
  // "/object/upload/sign/covers/x.jpg?token=…". Absolutise it so the caller has
  // one URL to PUT to and no path arithmetic of its own to get wrong.
  const relative = String(signed?.url ?? '');
  if (!relative.startsWith('/')) {
    return res.status(502).json({ error: 'Supabase Storage returned an upload URL in an unexpected shape.' });
  }

  return res.status(200).json({
    bucket,
    path,
    contentType: type,
    uploadUrl: `${SUPABASE_URL}/storage/v1${relative}`,
    token: signed?.token ?? null,
    publicUrl: `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${encodeURIComponent(path)}`,
    expiresInSeconds: EXPIRES_IN_SECONDS,
  });
}
