// One-off repair: restore the multi-genre arrays a since-fixed admin bug truncated.
//
// What went wrong
// ---------------
// A write path in the Super Admin console collapsed `movies.genres` to its first
// element, so a film seeded as ["Sci-Fi","Thriller"] is stored live as
// ["Sci-Fi"]. The bundled seed in src/data/movies.ts still holds the correct
// original arrays, so the repair is mechanical: wherever the LIVE array is a
// strict prefix of the SEED array for the same id, write the seed value back.
//
// Only that exact shape is touched. A row whose genres were deliberately
// re-tagged (different first element, or longer than the seed) is left alone —
// this script must never overwrite a real editorial decision.
//
// Usage
// -----
//   node scripts/repair-genres.mjs                 # dry run: print the table, change nothing
//   node scripts/repair-genres.mjs --apply         # write the fixes to https://www.youmaketv.ai
//   node scripts/repair-genres.mjs --apply --base http://localhost:3000
//
// Reading is unauthenticated (the public anon key, from VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY via .env.local or the environment). Writing goes
// through /api/admin/movies and needs one of:
//   GROWTH_OS_SERVICE_TOKEN   → sent as x-service-token
//   ADMIN_TOKEN               → sent as x-admin-token
// With neither set, --apply refuses rather than firing unauthenticated writes.
//
// Run it once, keep the printed table, and delete the script when the catalog
// is clean — it is a repair, not a maintenance job.

import { createServer, loadEnv } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const baseIndex = args.indexOf('--base');
const BASE = (baseIndex >= 0 ? args[baseIndex + 1] : 'https://www.youmaketv.ai').replace(/\/+$/, '');

/** Politeness gap between writes: this walks ~70 rows through one serverless fn. */
const WRITE_DELAY_MS = 200;
const FETCH_TIMEOUT_MS = 15_000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** True when `live` is a strict prefix of `seed` — same leading items, seed longer. */
function isTruncated(live, seed) {
  if (!Array.isArray(live) || !Array.isArray(seed)) return false;
  if (live.length === 0 || seed.length <= live.length) return false;
  return live.every((genre, i) => genre === seed[i]);
}

async function fetchJson(url, options) {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { ...options, signal: abort.signal });
    const text = await res.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { ok: res.ok, status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const env = { ...loadEnv('production', ROOT, 'VITE_'), ...process.env };
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are required to read the live catalog');
  }

  const serviceToken = process.env.GROWTH_OS_SERVICE_TOKEN;
  const adminToken = process.env.ADMIN_TOKEN;
  if (APPLY && !serviceToken && !adminToken) {
    throw new Error(
      '--apply needs GROWTH_OS_SERVICE_TOKEN (or ADMIN_TOKEN) in the environment; refusing to write without one'
    );
  }

  // Vite's SSR loader reads the TypeScript seed directly — same trick as
  // scripts/prerender.mjs, no duplicated catalog and no extra build step.
  const server = await createServer({
    root: ROOT,
    logLevel: 'error',
    server: { middlewareMode: true },
    appType: 'custom',
  });
  let seedMovies;
  try {
    ({ movies: seedMovies } = await server.ssrLoadModule('/src/data/movies.ts'));
  } finally {
    await server.close();
  }
  const seedById = new Map(seedMovies.map((movie) => [movie.id, movie]));

  const live = await fetchJson(`${supabaseUrl.replace(/\/+$/, '')}/rest/v1/movies?select=id,title,genres&order=id`, {
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` },
  });
  if (!live.ok || !Array.isArray(live.body)) {
    throw new Error(`could not read the live catalog: HTTP ${live.status}`);
  }

  const affected = [];
  for (const row of live.body) {
    const seed = seedById.get(row.id);
    if (!seed) continue;
    if (isTruncated(row.genres, seed.genres)) {
      affected.push({ id: row.id, title: row.title, from: row.genres, to: seed.genres });
    }
  }

  const width = (values) => Math.max(...values.map((v) => v.length), 0);
  const idWidth = width(affected.map((a) => String(a.id)));
  const titleWidth = Math.min(width(affected.map((a) => a.title)), 40);
  for (const row of affected) {
    console.log(
      `${String(row.id).padStart(idWidth)}  ${row.title.slice(0, titleWidth).padEnd(titleWidth)}  ` +
        `[${row.from.join(', ')}] -> [${row.to.join(', ')}]`
    );
  }
  console.log(`\nrepair-genres: ${affected.length} of ${live.body.length} live rows have truncated genres`);

  if (!APPLY) {
    console.log('repair-genres: dry run — nothing written. Re-run with --apply to fix them.');
    return;
  }

  // Sequential and paced: /api/admin/movies is a serverless function fronting a
  // single Supabase connection, and a burst of 70 parallel PATCHes is how you
  // half-apply a repair. Stop at the first failure so the printed table stays a
  // truthful record of what was and was not changed.
  console.log(`repair-genres: applying ${affected.length} patches to ${BASE}/api/admin/movies …`);
  let applied = 0;
  for (const row of affected) {
    const headers = { 'content-type': 'application/json', 'x-service-actor': 'repair-genres' };
    if (serviceToken) headers['x-service-token'] = serviceToken;
    else headers['x-admin-token'] = adminToken;

    const res = await fetchJson(`${BASE}/api/admin/movies`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ id: row.id, patch: { genres: row.to } }),
    });
    if (!res.ok) {
      const message = res.body?.error ?? (typeof res.body === 'string' ? res.body : '') ?? '';
      throw new Error(`id ${row.id} failed: HTTP ${res.status} ${message}`.trim());
    }
    applied += 1;
    console.log(`  ok  ${row.id}  ${row.title}`);
    await sleep(WRITE_DELAY_MS);
  }
  console.log(`repair-genres: ${applied} rows repaired.`);
}

main().catch((err) => {
  console.error('repair-genres failed:', err.message ?? err);
  process.exit(1);
});
