import { createHash, timingSafeEqual } from 'node:crypto';
import { next } from '@vercel/functions';

// Temporary whole-site access gate. These are server-only variables, never VITE_*.
// Match every path, including static/prerendered files, APIs and unknown URLs.
export const config = { runtime: 'nodejs', matcher: '/:path*' };

const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'CDN-Cache-Control': 'no-store',
  'Vercel-CDN-Cache-Control': 'no-store',
  'X-Robots-Tag': 'noindex, nofollow, noarchive',
  Vary: 'Authorization',
};

export default function middleware(request) {
  const username = process.env.SITE_GATE_USERNAME;
  const password = process.env.SITE_GATE_PASSWORD;

  // A missing secret must never silently make the site public.
  if (!username || !password) {
    return new Response('This website is temporarily private.', {
      status: 503,
      headers: PRIVATE_HEADERS,
    });
  }

  const authorization = request.headers.get('authorization') || '';
  const match = authorization.length <= 2048
    ? /^Basic ([A-Za-z0-9+/]+={0,2})$/i.exec(authorization)
    : null;
  const supplied = match ? Buffer.from(match[1], 'base64').toString('utf8') : '';
  const digest = (value) => createHash('sha256').update(value).digest();
  const valid = timingSafeEqual(digest(supplied), digest(`${username}:${password}`));

  if (!match || !valid) {
    return new Response('This website is private. Sign in to continue.', {
      status: 401,
      headers: {
        ...PRIVATE_HEADERS,
        'WWW-Authenticate': 'Basic realm="YouMakeTV private access", charset="UTF-8"',
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  }

  // Keep the gate password out of application handlers and their logs.
  // Existing x-admin-token / x-service-token checks still apply independently.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.delete('authorization');
  return next({ request: { headers: forwardedHeaders }, headers: PRIVATE_HEADERS });
}
