/**
 * Seeds movies table from local catalog + fixes storage bucket policies.
 * Run: npx tsx scripts/seed-and-fix.ts
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local ───────────────────────────────────────────────────────────
const envRaw = readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
for (const line of envRaw.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}
const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Import movies from local catalog ─────────────────────────────────────────
import { movies as localMovies } from '../src/data/movies';

function movieToRow(m: (typeof localMovies)[0], status = 'Approved') {
  return {
    id: m.id,
    title: m.title,
    subtitle: m.subtitle ?? '',
    description: m.description ?? '',
    genre: m.genre ?? '',
    genres: m.genres ?? [m.genre],
    duration: m.duration ?? '',
    creator_name: m.creator ?? '',
    price: m.price ?? 0,
    cover_url: m.thumbnail?.startsWith('data:') ? null : (m.thumbnail || null),
    trailer_url: (m as Record<string, unknown>).trailerUrl as string ?? null,
    badge: (m as Record<string, unknown>).badge as string ?? '',
    tools: (m as Record<string, unknown>).tools as string[] ?? [],
    rating: (m as Record<string, unknown>).rating as string ?? '',
    language: (m as Record<string, unknown>).language as string ?? 'English',
    tags: (m as Record<string, unknown>).tags as string[] ?? [],
    release_year: (m as Record<string, unknown>).releaseYear as number ?? null,
    views: (m as Record<string, unknown>).views as number ?? 0,
    trailer_views: (m as Record<string, unknown>).trailerViews as number ?? 0,
    featured: (m as Record<string, unknown>).featured as boolean ?? false,
    subscriber_discount_eligible: (m as Record<string, unknown>).subscriberDiscountEligible as boolean ?? false,
    poster_prompt: (m as Record<string, unknown>).posterPrompt as string ?? null,
    status,
  };
}

// ── 1. Seed movies ────────────────────────────────────────────────────────────
console.log(`\n── Seeding ${localMovies.length} movies…`);
const { count } = await supabase.from('movies').select('id', { count: 'exact', head: true });
if ((count ?? 0) >= localMovies.length) {
  console.log(`  Table already has ${count} rows (≥ ${localMovies.length}) — skipping seed.`);
} else {
  console.log(`  Table has ${count} rows — upserting full catalog…`);
  const rows = localMovies.map(m => movieToRow(m));
  const BATCH = 20;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error } = await supabase.from('movies').upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
    if (error) {
      console.error(`  ❌ Batch ${i}–${i + BATCH} failed:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`  ✓ ${inserted}/${rows.length} inserted\r`);
    }
  }
  console.log(`\n  ✓ Seeded ${inserted} movies.`);
}

// ── 2. Fix storage bucket policies ───────────────────────────────────────────
// The anon key cannot run DDL (CREATE POLICY) via the client.
// We have to tell the user what SQL to run manually.
// However, we CAN test if uploads work right now and tell them what's broken.

console.log('\n── Testing covers upload policy…');
const blob = new Blob(['<svg/>'], { type: 'image/svg+xml' });
const { error: covErr } = await supabase.storage
  .from('covers').upload(`_probe_${Date.now()}.svg`, blob, { contentType: 'image/svg+xml', upsert: true });

if (covErr) {
  console.error('  ❌ Covers upload blocked:', covErr.message);
  console.error('  → Run this SQL in Supabase SQL Editor to fix:');
  console.error(`
    create policy "Anon covers upload"
      on storage.objects for insert
      to anon
      with check (bucket_id = 'covers');

    create policy "Anon trailers upload"
      on storage.objects for insert
      to anon
      with check (bucket_id = 'trailers');

    update storage.buckets set public = true where id in ('covers','trailers');
  `);
} else {
  console.log('  ✓ Covers upload OK.');
}

console.log('\n── Testing trailers upload policy…');
const mp4 = new Blob([new Uint8Array(4)], { type: 'video/mp4' });
const { error: trailerErr } = await supabase.storage
  .from('trailers').upload(`_probe_${Date.now()}.mp4`, mp4, { contentType: 'video/mp4', upsert: true });

if (trailerErr) {
  console.error('  ❌ Trailers upload blocked:', trailerErr.message);
} else {
  console.log('  ✓ Trailers upload OK.');
}

console.log('\n── Done.\n');
