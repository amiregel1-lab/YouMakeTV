// Vercel serverless function — /api/admin/movies
//
//   GET                      → every movie in the catalog, admin shape
//   PATCH  { id, patch:{…} } → write one movie
//
// Machine door: authenticated with `x-service-token` against
// GROWTH_OS_SERVICE_TOKEN, never with a browser session. See api/_lib/service.js.
//
// ── Why this endpoint exists ────────────────────────────────────────────────
//
// migration 003_harden_rls.sql removed the anon key's INSERT/UPDATE on
// public.movies, which was right — the anon key is bundled into the client, so
// anyone could rewrite every film. The side effect was that the admin console's
// own saves went through that same anon key and have failed silently ever
// since. This handler writes with the SERVICE_ROLE key server-side, which
// bypasses RLS, and is the supported way for an admin edit to land.
//
// The catalog stays the system of record for movies: nothing here mirrors a row
// into another database. Growth OS reads and writes it through this door.

import {
  methodGuard,
  pgrest,
  readJsonBody,
  requireServiceToken,
  requireSupabase,
  setServiceHeaders,
} from '../_lib/service.js';

// ── Row ↔ admin shape ───────────────────────────────────────────────────────
// Same field names the browser console uses (src/lib/movieService.ts), so the
// two consoles describe one film identically.

function rowToMovie(row) {
  return {
    id: row.id,
    title: row.title ?? '',
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    genre: row.genre ?? '',
    genres: row.genres ?? [],
    duration: row.duration ?? '',
    creatorName: row.creator_name ?? '',
    price: typeof row.price === 'number' ? row.price : Number(row.price ?? 0),
    coverUrl: row.cover_url ?? null,
    backdropUrl: row.backdrop_url ?? null,
    trailerUrl: row.trailer_url ?? null,
    badge: row.badge ?? '',
    tools: row.tools ?? [],
    rating: row.rating ?? '',
    language: row.language ?? '',
    tags: row.tags ?? [],
    releaseYear: row.release_year ?? null,
    // Seeded with the catalog rather than measured — the desk labels them so.
    views: row.views ?? 0,
    trailerViews: row.trailer_views ?? 0,
    featured: row.featured ?? false,
    subscriberDiscountEligible: row.subscriber_discount_eligible ?? false,
    posterPrompt: row.poster_prompt ?? null,
    status: row.status ?? 'Approved',
    // The moderation columns land with 005_movie_moderation.sql. Before it runs
    // PostgREST simply does not return them, and `undefined ?? default` gives
    // the desk the catalog's real pre-migration state rather than a blank.
    moderationNotes: row.moderation_notes ?? '',
    visible: row.visible ?? true,
    trending: row.trending ?? false,
    newRelease: row.new_release ?? false,
    moderatedAt: row.moderated_at ?? null,
    moderatedBy: row.moderated_by ?? null,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

/**
 * What a caller may write, and how each value is cleaned.
 *
 * An allowlist rather than a passthrough: `id`, `created_at`, `views` and
 * `trailer_views` are deliberately absent. The first two are identity, and the
 * view counts are a measurement — a desk that could set them could invent
 * traffic, which is the one thing this console must never be able to do.
 */
const TEXT_MAX = 4000;

const text = (v) => (v == null ? null : String(v).slice(0, TEXT_MAX));
const shortText = (v) => (v == null ? null : String(v).slice(0, 300));
const bool = (v) => Boolean(v);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const strArray = (v) => {
  if (v == null) return null;
  const arr = Array.isArray(v) ? v : String(v).split(',');
  return arr
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 40)
    .map((s) => s.slice(0, 120));
};
const url = (v) => {
  if (v == null || v === '') return null;
  const s = String(v).trim().slice(0, 2000);
  // A data: URL is a whole image inlined into a text column; the console
  // uploads through /api/admin/media and stores the resulting URL instead.
  if (/^data:/i.test(s)) return undefined; // undefined = reject the whole patch
  if (/^(https?:)?\/\//i.test(s) || s.startsWith('/')) return s;
  return undefined;
};

const STATUSES = ['Approved', 'Pending Review', 'Rejected', 'Suspended', 'Draft'];
const status = (v) => (STATUSES.includes(String(v)) ? String(v) : undefined);

const WRITABLE = {
  title: ['title', shortText],
  subtitle: ['subtitle', shortText],
  description: ['description', text],
  genre: ['genre', shortText],
  genres: ['genres', strArray],
  duration: ['duration', shortText],
  creatorName: ['creator_name', shortText],
  price: ['price', num],
  coverUrl: ['cover_url', url],
  backdropUrl: ['backdrop_url', url],
  trailerUrl: ['trailer_url', url],
  badge: ['badge', shortText],
  tools: ['tools', strArray],
  rating: ['rating', shortText],
  language: ['language', shortText],
  tags: ['tags', strArray],
  releaseYear: ['release_year', num],
  featured: ['featured', bool],
  subscriberDiscountEligible: ['subscriber_discount_eligible', bool],
  posterPrompt: ['poster_prompt', text],
  status: ['status', status],
  moderationNotes: ['moderation_notes', text],
  visible: ['visible', bool],
  trending: ['trending', bool],
  newRelease: ['new_release', bool],
};

export default async function handler(req, res) {
  setServiceHeaders(res);
  if (!methodGuard(req, res, ['GET', 'PATCH'])) return;
  if (!requireServiceToken(req, res)) return;
  if (!requireSupabase(res)) return;

  // ── List ────────────────────────────────────────────────────────────────
  if (req.method === 'GET') {
    const result = await pgrest('/movies?select=*&order=id.asc&limit=2000');
    if (!result.ok) {
      return res.status(502).json({ error: `Supabase: ${result.error}` });
    }
    const rows = Array.isArray(result.data) ? result.data : [];
    return res.status(200).json({
      movies: rows.map(rowToMovie),
      // The desk needs to know whether 005 has run before it offers a moderation
      // control that would fail — so it is told, from the shape of a real row.
      moderationColumns: rows.length === 0 || Object.hasOwn(rows[0], 'moderation_notes'),
      count: rows.length,
    });
  }

  // ── Write one ───────────────────────────────────────────────────────────
  const body = readJsonBody(req);
  const id = Number(body.id);
  if (!Number.isInteger(id) || id < 0) {
    return res.status(400).json({ error: 'A numeric movie id is required.' });
  }

  const patch = body.patch && typeof body.patch === 'object' ? body.patch : null;
  if (!patch) return res.status(400).json({ error: 'A patch object is required.' });

  const row = {};
  const rejected = [];
  for (const [key, value] of Object.entries(patch)) {
    const entry = WRITABLE[key];
    if (!entry) {
      rejected.push(key);
      continue;
    }
    const [column, clean] = entry;
    const cleaned = clean(value);
    if (cleaned === undefined) {
      return res.status(400).json({ error: `"${key}" is not a value this endpoint will store.` });
    }
    row[column] = cleaned;
  }

  if (rejected.length) {
    return res
      .status(400)
      .json({ error: `Not writable through this endpoint: ${rejected.join(', ')}.` });
  }
  if (Object.keys(row).length === 0) {
    return res.status(400).json({ error: 'The patch changed nothing.' });
  }

  // Who decided, and when — recorded only when a decision was actually made.
  if (Object.hasOwn(row, 'status')) {
    row.moderated_at = new Date().toISOString();
    const actor = req.headers['x-service-actor'];
    row.moderated_by = typeof actor === 'string' && actor ? actor.slice(0, 200) : 'growth-os';
  }
  // 001 installed a trigger that maintains updated_at; setting it here as well
  // is harmless and keeps the answer correct even if the trigger was dropped.
  row.updated_at = new Date().toISOString();

  const result = await pgrest(`/movies?id=eq.${id}&select=*`, {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(row),
  });

  if (!result.ok) {
    // PostgREST says "column movies.visible does not exist" when 005 has not
    // been run. That sentence is passed through unedited — it is the exact
    // thing the operator needs to read.
    return res.status(502).json({ error: `Supabase: ${result.error}` });
  }

  const updated = Array.isArray(result.data) ? result.data : [];
  if (updated.length === 0) {
    return res.status(404).json({ error: `No movie with id ${id}.` });
  }

  return res.status(200).json({ movie: rowToMovie(updated[0]) });
}
