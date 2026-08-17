// Vercel serverless function — POST /api/admin/verify
//
// Validates an admin session token server-side. The Super Admin dashboard calls
// this on mount, so a forged or edited localStorage entry can never open the
// console: only a token carrying a valid HMAC signature and a future expiry
// returns { valid: true }.
//
// Request:  { token }
// Response: 200 { valid: boolean, expiresAt? }

import { setAdminCors, verifySessionToken } from '../_lib/session.js';

export default async function handler(req, res) {
  setAdminCors(req, res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    console.error('ADMIN_SESSION_SECRET is not set — no admin session can be validated.');
    return res.status(503).json({ valid: false, error: 'admin login not configured' });
  }

  const { token } = req.body ?? {};
  const payload = verifySessionToken(token, secret);

  if (!payload) return res.status(200).json({ valid: false });
  return res.status(200).json({ valid: true, expiresAt: payload.exp });
}
