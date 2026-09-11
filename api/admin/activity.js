import { methodGuard, requireServiceToken, requireSupabase, setServiceHeaders, pgrest } from '../_lib/service.js';
export default async function handler(req, res) {
  setServiceHeaders(res);
  if (!methodGuard(req, res, ['GET']) || !requireServiceToken(req, res) || !requireSupabase(res)) return;
  const since = new Date(String(req.query.since || ''));
  const offset = Number(req.query.offset || 0);
  if (!Number.isFinite(since.getTime()) || !Number.isInteger(offset) || offset < 0 || offset > 100000) return res.status(400).json({ error: 'invalid cursor' });
  const result = await pgrest('/rpc/hq_account_activity', { method: 'POST', signal: AbortSignal.timeout(7000), body: JSON.stringify({ since_at: since.toISOString(), page_offset: offset }) });
  if (!result.ok) return res.status(503).json({ error: 'Registration feed unavailable' });
  return res.status(200).json({ events: result.data.map(row => ({ id: `member:${row.id}`, kind: 'account.opened', title: `New ${row.account_type}: ${row.display_name}`, body: 'A real YouMakeTV account was registered.', href: '/w/youmaketv/youmaketv', at: row.created_at })), nextOffset: result.data.length === 200 ? offset + 200 : null });
}
