// Vercel serverless function — GET /api/admin/dashboard?since=<ISO>
//
// One call, two halves, both real:
//
//   events   — what viewers actually DID since `since`, counted from the events
//              table (migration 004). If that table or the service key is not in
//              place, `configured` is false and there are no counts. The desk
//              says so; it never shows a zero that means "we couldn't look".
//
//   catalog  — what the CATALOG did: uploads and edits since `since`, an
//              activity feed built from created_at/updated_at, the standing
//              totals, and the moderation backlog. Every figure is a count of
//              rows, and 0 is a true answer on a quiet day.
//
// `since` is supplied by the caller, not computed here: "today" starts at
// midnight in the OPERATOR's timezone, and this function has no idea what that
// is. Default is the last 24 hours.
//
// Machine door — `x-service-token` against GROWTH_OS_SERVICE_TOKEN.

import {
  methodGuard,
  pgrest,
  requireServiceToken,
  requireSupabase,
  setServiceHeaders,
} from '../_lib/service.js';

const EVENT_TYPES = ['trailer_play', 'purchase', 'signup', 'subscription', 'movie_view', 'preferred_source_click'];
const FEED_LIMIT = 40;

function isoOrNull(value) {
  if (!value || Number.isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

export default async function handler(req, res) {
  setServiceHeaders(res);
  if (!methodGuard(req, res, ['GET'])) return;
  if (!requireServiceToken(req, res)) return;
  if (!requireSupabase(res)) return;

  const since =
    isoOrNull(req.query?.since) ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sinceMs = Date.parse(since);

  const [eventsResult, moviesResult] = await Promise.all([
    pgrest(`/events?select=type&created_at=gte.${encodeURIComponent(since)}&limit=100000`),
    pgrest(
      '/movies?select=id,title,status,price,featured,created_at,updated_at,creator_name&order=id.asc&limit=2000'
    ),
  ]);

  // ── Engagement ─────────────────────────────────────────────────────────
  // A failure here is not fatal to the page: the catalog half is independent
  // and still true. `configured:false` carries the reason with it so the desk
  // can print what is actually wrong rather than a generic setup blurb.
  let events;
  if (eventsResult.ok && Array.isArray(eventsResult.data)) {
    const counts = Object.fromEntries(EVENT_TYPES.map((t) => [t, 0]));
    for (const row of eventsResult.data) {
      if (Object.hasOwn(counts, row.type)) counts[row.type] += 1;
    }
    events = { configured: true, counts, total: eventsResult.data.length, reason: null };
  } else {
    events = {
      configured: false,
      counts: {},
      total: 0,
      reason: eventsResult.error ?? 'The events table could not be read.',
    };
  }

  // ── Catalog ────────────────────────────────────────────────────────────
  if (!moviesResult.ok) {
    return res.status(502).json({ error: `Supabase: ${moviesResult.error}` });
  }
  const rows = Array.isArray(moviesResult.data) ? moviesResult.data : [];

  const at = (value) => {
    const t = value ? Date.parse(value) : NaN;
    return Number.isNaN(t) ? null : t;
  };

  const byStatus = {};
  let uploadedSince = 0;
  let editedSince = 0;
  let paidSince = 0;
  let freeSince = 0;
  let featuredSince = 0;
  let featuredTotal = 0;
  let paidTotal = 0;
  const feed = [];
  let lastUpload = null;
  let lastEdit = null;

  for (const row of rows) {
    const statusWord = row.status ?? 'Approved';
    byStatus[statusWord] = (byStatus[statusWord] ?? 0) + 1;
    if (row.featured) featuredTotal += 1;
    if (Number(row.price) > 0) paidTotal += 1;

    const created = at(row.created_at);
    const updated = at(row.updated_at);

    if (created != null && (lastUpload === null || created > lastUpload.ts)) {
      lastUpload = { id: row.id, title: row.title, ts: created, at: row.created_at };
    }
    if (updated != null && (lastEdit === null || updated > lastEdit.ts)) {
      lastEdit = { id: row.id, title: row.title, ts: updated, at: row.updated_at };
    }

    const wasUploaded = created != null && created >= sinceMs;
    // An edit that is really the upload itself is not a second event. The
    // trigger sets updated_at = created_at on insert, so without this every new
    // film would be counted twice on the day it arrived.
    const wasEdited = !wasUploaded && updated != null && updated >= sinceMs;

    if (wasUploaded) {
      uploadedSince += 1;
      if (Number(row.price) > 0) paidSince += 1;
      else freeSince += 1;
      if (row.featured) featuredSince += 1;
      feed.push({ id: row.id, title: row.title, action: 'uploaded', at: row.created_at });
    } else if (wasEdited) {
      editedSince += 1;
      feed.push({ id: row.id, title: row.title, action: 'edited', at: row.updated_at });
    }
  }

  feed.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  return res.status(200).json({
    since,
    events,
    catalog: {
      total: rows.length,
      byStatus,
      featuredTotal,
      paidTotal,
      freeTotal: rows.length - paidTotal,
      pendingModeration: byStatus['Pending Review'] ?? 0,
      uploadedSince,
      editedSince,
      paidSince,
      freeSince,
      featuredSince,
      feed: feed.slice(0, FEED_LIMIT),
      lastUpload: lastUpload && { id: lastUpload.id, title: lastUpload.title, at: lastUpload.at },
      lastEdit: lastEdit && { id: lastEdit.id, title: lastEdit.title, at: lastEdit.at },
      // Distinct creator names on the catalog rows. Not creator ACCOUNTS —
      // those live in Growth OS — but the true count of names attached to films.
      //
      // Deduplicated case- and whitespace-insensitively, matching how the desk
      // matches a creator account to their films: "Nova Studio" and
      // "nova  studio" are one studio, and two screens counting the same thing
      // differently is how an operator stops believing either. The first
      // spelling seen is the one reported, so the list still reads naturally.
      creatorNames: (() => {
        const seen = new Map();
        for (const row of rows) {
          const raw = (row.creator_name ?? '').trim();
          if (!raw) continue;
          const key = raw.toLowerCase().replace(/\s+/g, ' ');
          if (!seen.has(key)) seen.set(key, raw);
        }
        return [...seen.values()].sort((a, b) => a.localeCompare(b)).slice(0, 500);
      })(),
    },
  });
}
