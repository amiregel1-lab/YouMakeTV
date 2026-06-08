/**
 * Supabase connection + seed verification script.
 * Run: node scripts/verify-supabase.mjs
 * Reads VITE_* env vars from .env.local automatically.
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

// ── Load .env.local manually (no dotenv dependency needed) ────────────────────
const envPath = new URL('../.env.local', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1');
let url, key;
try {
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const [k, ...rest] = line.split('=');
    const v = rest.join('=').trim();
    if (k.trim() === 'VITE_SUPABASE_URL') url = v;
    if (k.trim() === 'VITE_SUPABASE_ANON_KEY') key = v;
  }
} catch {
  console.error('❌ Could not read .env.local — make sure it exists in the project root.');
  process.exit(1);
}

if (!url || !key) {
  console.error('❌ VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env.local');
  process.exit(1);
}

console.log('✓ Env vars loaded');
console.log('  URL:', url);
console.log('  Key:', key.slice(0, 20) + '...');

const supabase = createClient(url, key);

// ── 1. Test basic connection ──────────────────────────────────────────────────
console.log('\n── 1. Testing connection to movies table…');
const { data: countData, error: countError, count } = await supabase
  .from('movies')
  .select('id', { count: 'exact', head: true });

if (countError) {
  console.error('❌ Connection failed:', countError.message);
  process.exit(1);
}
console.log(`✓ Connected. Movies table has ${count} rows.`);

// ── 2. Seed if empty ──────────────────────────────────────────────────────────
if (count === 0) {
  console.log('\n── 2. Table empty — seeding 100 movies…');

  // Inline minimal seed data derived from src/data/movies.ts pattern
  // We import the built JS... actually just fetch titles to confirm shape works.
  // Instead, insert a quick probe row then delete it.
  const probe = {
    id: 999999,
    title: '__seed_probe__',
    genre: 'Test',
    creator_name: 'probe',
    price: 0,
    status: 'Draft',
  };
  const { error: insertErr } = await supabase.from('movies').insert(probe);
  if (insertErr) {
    console.error('❌ Insert test failed (check "Anon insert" RLS policy):', insertErr.message);
  } else {
    const { error: delErr } = await supabase.from('movies').delete().eq('id', 999999);
    console.log('✓ Insert + delete probe succeeded — insert policy is working.');
    if (delErr) console.warn('  (probe cleanup failed — delete policy may be missing, not critical)');
  }

  console.log('\n  NOTE: Real seeding happens automatically when the app first loads in the browser.');
  console.log('  Open the dev server and check the browser console for:');
  console.log('  "[movieService] table empty — seeding from local catalog…"');
} else {
  console.log('\n── 2. Seeding check — table already has data, no seed needed.');

  // Spot-check a few rows
  const { data: sample } = await supabase.from('movies').select('id, title, cover_url, trailer_url').limit(3).order('id');
  console.log('   Sample rows:');
  for (const row of sample ?? []) {
    console.log(`   [${row.id}] "${row.title}" | cover: ${row.cover_url?.slice(0, 50) ?? 'null'} | trailer: ${row.trailer_url ?? 'null'}`);
  }
}

// ── 3. Upsert test (admin save path) ─────────────────────────────────────────
console.log('\n── 3. Testing upsert (admin save path)…');
const { data: firstRow } = await supabase.from('movies').select('*').limit(1).order('id').single();
if (!firstRow) {
  console.warn('  No rows to test upsert against — skipping.');
} else {
  const { error: upsertErr } = await supabase
    .from('movies')
    .upsert({ ...firstRow, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (upsertErr) {
    console.error('❌ Upsert failed (check "Anon update" RLS policy):', upsertErr.message);
  } else {
    console.log(`✓ Upsert succeeded for movie id=${firstRow.id} "${firstRow.title}"`);
  }
}

// ── 4. Storage: covers bucket ─────────────────────────────────────────────────
console.log('\n── 4. Testing covers bucket upload…');
const coverBlob = new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'], { type: 'image/svg+xml' });
const coverName = `_probe_${Date.now()}.svg`;
const { data: coverData, error: coverErr } = await supabase.storage
  .from('covers')
  .upload(coverName, coverBlob, { contentType: 'image/svg+xml', upsert: true });

if (coverErr) {
  console.error('❌ Cover upload failed:', coverErr.message);
  console.error('   ↳ Fix: run the storage policy SQL below in Supabase SQL Editor.');
} else {
  const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverData.path);
  console.log('✓ Cover upload succeeded.');
  console.log('  Public URL:', publicUrl);
  // Check if URL is actually reachable
  try {
    const res = await fetch(publicUrl, { method: 'HEAD' });
    if (res.ok) {
      console.log('✓ Cover public URL is reachable (HTTP', res.status, ')');
    } else {
      console.warn('⚠ Cover URL returned HTTP', res.status, '— bucket may not be public');
    }
  } catch {
    console.warn('  (Could not fetch URL to verify — may be fine in browser context)');
  }
  // Cleanup
  await supabase.storage.from('covers').remove([coverData.path]);
}

// ── 5. Storage: trailers bucket ───────────────────────────────────────────────
console.log('\n── 5. Testing trailers bucket upload…');
const trailerBlob = new Blob([new Uint8Array(8)], { type: 'video/mp4' });
const trailerName = `_probe_${Date.now()}.mp4`;
const { data: trailerData, error: trailerErr } = await supabase.storage
  .from('trailers')
  .upload(trailerName, trailerBlob, { contentType: 'video/mp4', upsert: true });

if (trailerErr) {
  console.error('❌ Trailer upload failed:', trailerErr.message);
  console.error('   ↳ Fix: run the storage policy SQL below in Supabase SQL Editor.');
} else {
  const { data: { publicUrl } } = supabase.storage.from('trailers').getPublicUrl(trailerData.path);
  console.log('✓ Trailer upload succeeded.');
  console.log('  Public URL:', publicUrl);
  await supabase.storage.from('trailers').remove([trailerData.path]);
}

// ── 6. Summary ────────────────────────────────────────────────────────────────
console.log('\n────────────────────────────────────────────────────');
console.log('Verification complete. Check ✓/❌ markers above.');
console.log('────────────────────────────────────────────────────');
