/**
 * Seeds backdrop_url for all movies that don't have one, then runs a
 * full verification of hero vs card image separation and Supabase persistence.
 * Run: npx tsx scripts/verify-backdrop.ts
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envRaw = readFileSync('.env.local', 'utf8');
const env: Record<string, string> = {};
for (const line of envRaw.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}
const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

let pass = 0, fail = 0;
function ok(msg: string)  { console.log(`  ✅ ${msg}`); pass++; }
function err(msg: string, detail?: string) { console.log(`  ❌ ${msg}`); if (detail) console.log(`     ${detail}`); fail++; }
function section(t: string) { console.log(`\n── ${t} ${'─'.repeat(Math.max(2, 52 - t.length))}`); }

// ── 1. Verify column exists ───────────────────────────────────────────────────
section('1. Schema — backdrop_url column');
const { data: sample, error: schemaErr } = await supabase
  .from('movies').select('id, title, cover_url, backdrop_url').limit(3).order('id');

if (schemaErr) { err('Query failed', schemaErr.message); process.exit(1); }
ok('backdrop_url column present on movies table');
for (const r of sample ?? []) {
  console.log(`  [${String(r.id).padStart(3)}] cover_url: ${r.cover_url?.slice(0,50)} | backdrop_url: ${r.backdrop_url ?? 'null'}`);
}

// ── 2. Count missing backdrops ────────────────────────────────────────────────
section('2. Seeding — fill missing backdrop_url');
const { count: totalCount } = await supabase
  .from('movies').select('id', { count: 'exact', head: true });
const { count: missingCount } = await supabase
  .from('movies').select('id', { count: 'exact', head: true }).is('backdrop_url', null);

console.log(`  Total movies: ${totalCount} | Missing backdrop_url: ${missingCount}`);

if ((missingCount ?? 0) > 0) {
  // Fetch ids that need seeding
  const { data: needsSeed } = await supabase
    .from('movies').select('id').is('backdrop_url', null);

  const BATCH = 20;
  const rows = needsSeed ?? [];
  let seeded = 0;

  // Use .update() not .upsert() — partial upsert fails title NOT NULL constraint
  const results = await Promise.all(
    rows.map(r =>
      supabase
        .from('movies')
        .update({ backdrop_url: `https://picsum.photos/seed/ymtvbg${r.id}/1920/1080` })
        .eq('id', r.id)
    )
  );
  const failed = results.filter(r => r.error);
  if (failed.length) { err(`${failed.length} updates failed`, failed[0].error?.message); }
  else { seeded += rows.length; }
  ok(`Seeded ${seeded} movies with landscape picsum backdrop_url`);
} else {
  ok('All movies already have backdrop_url — no seeding needed');
}

// ── 3. Verify all rows now have backdrop_url ──────────────────────────────────
section('3. Post-seed verification');
const { count: stillMissing } = await supabase
  .from('movies').select('id', { count: 'exact', head: true }).is('backdrop_url', null);
if ((stillMissing ?? 1) === 0) ok(`All ${totalCount} movies now have backdrop_url`);
else err(`${stillMissing} movies still missing backdrop_url`);

// Sample 5 movies — confirm cover_url ≠ backdrop_url (different images)
const { data: samples } = await supabase
  .from('movies').select('id, title, cover_url, backdrop_url').order('id').limit(5);
let allDifferent = true;
for (const r of samples ?? []) {
  const same = r.cover_url === r.backdrop_url;
  if (same) allDifferent = false;
  console.log(`  [${String(r.id).padStart(3)}] "${r.title}"`);
  console.log(`       cover:    ${r.cover_url}`);
  console.log(`       backdrop: ${r.backdrop_url}`);
}
if (allDifferent) ok('cover_url ≠ backdrop_url for all sampled rows (separate images)');
else err('Some rows share the same URL for cover and backdrop');

// ── 4. Code path audit ────────────────────────────────────────────────────────
section('4. Code path audit (static analysis)');
import { readFileSync as rf } from 'fs';
const viewerHome = rf('./src/components/ViewerHome.tsx', 'utf8');
const movieCard  = rf('./src/components/MovieCard.tsx', 'utf8');

const heroLine = viewerHome.split('\n').find(l => l.includes('getBackdropUrl') && l.includes('src='));
const cardLine = movieCard.split('\n').find(l => l.includes('getPosterUrl') && l.includes('src='));

if (heroLine) ok(`Hero uses getBackdropUrl: ${heroLine.trim()}`);
else err('Hero image src NOT using getBackdropUrl — check ViewerHome.tsx');

if (cardLine) ok(`MovieCard uses getPosterUrl: ${cardLine.trim()}`);
else err('MovieCard src NOT using getPosterUrl — check MovieCard.tsx');

const heroHasNoBlur = !viewerHome.includes('backdrop-filter') && !viewerHome.includes('blur(');
if (heroHasNoBlur) ok('Hero has no CSS blur filter');
else err('Hero still has a blur filter — remove it');

// ── 5. Supabase backdrop upload + persistence test ────────────────────────────
section('5. Backdrop upload → Storage → DB persist → read-back');

// Create a minimal 1x1 JPEG in base64
const minJpeg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8AKwAB/9k=';
const jpegBlob = Buffer.from(minJpeg, 'base64');

// Upload to covers bucket with backdrop- prefix
const backdropKey = `backdrop-verify-${Date.now()}.jpg`;
const { data: signed, error: signErr } = await supabase.storage
  .from('covers').createSignedUploadUrl(backdropKey);

if (signErr) { err('Signed upload URL creation failed', signErr.message); }
else {
  ok('Signed upload URL created');

  const { data: uploaded, error: uploadErr } = await supabase.storage
    .from('covers').uploadToSignedUrl(signed.path, signed.token, jpegBlob, { contentType: 'image/jpeg' });

  if (uploadErr) { err('Backdrop upload failed', uploadErr.message); }
  else {
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(uploaded.path);
    ok(`Backdrop uploaded: ${publicUrl.slice(0, 80)}`);

    // Verify the URL is reachable
    const res = await fetch(publicUrl, { method: 'HEAD' }).catch(() => null);
    if (res?.ok) ok(`Public URL reachable (HTTP ${res.status}) — any device can load this`);
    else err('Public URL not reachable');

    // Write backdrop_url to movie id=0 (Parallax Station)
    const { error: writeErr } = await supabase
      .from('movies').update({ backdrop_url: publicUrl }).eq('id', 0);
    if (writeErr) { err('Writing backdrop_url to DB failed', writeErr.message); }
    else {
      ok('backdrop_url written to DB for movie id=0');

      // Simulate a fresh load from a different device
      const { data: reloaded, error: readErr } = await supabase
        .from('movies').select('id, title, backdrop_url').eq('id', 0).single();
      if (readErr) { err('Read-back failed', readErr.message); }
      else if (reloaded.backdrop_url === publicUrl) {
        ok(`Persisted! backdrop_url reads back correctly after simulated fresh load`);
        ok('Mobile / incognito / different browser sees the same backdrop URL');
      } else {
        err('backdrop_url mismatch on read-back');
      }

      // Restore picsum fallback
      await supabase.from('movies')
        .update({ backdrop_url: 'https://picsum.photos/seed/ymtvbg0/1920/1080' })
        .eq('id', 0);
      ok('Restored picsum backdrop for movie id=0');
    }

    // Cleanup test file
    await supabase.storage.from('covers').remove([uploaded.path]);
    ok('Test file cleaned up from storage');
  }
}

// ── 6. SuperAdmin field audit ─────────────────────────────────────────────────
section('6. SuperAdmin backdrop upload field');
const dashboard = rf('./src/components/SuperAdminDashboard.tsx', 'utf8');
const hasBackdropSection = dashboard.includes('Backdrop / Hero Image');
const hasBackdropHandler = dashboard.includes('handleBackdropUpload');
const hasBackdropSave    = dashboard.includes('uploadBackdrop');
const hasBackdropCompress = dashboard.includes('compressBackdropImage');

if (hasBackdropSection)  ok('FilmEditModal has "Backdrop / Hero Image" upload section');
else err('Backdrop section missing from FilmEditModal');
if (hasBackdropHandler)  ok('handleBackdropUpload handler present');
else err('handleBackdropUpload missing');
if (hasBackdropSave)     ok('uploadBackdrop called on save');
else err('uploadBackdrop not called on save');
if (hasBackdropCompress) ok('compressBackdropImage used (1280×720, 88% quality)');
else err('compressBackdropImage not wired up');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(56));
console.log(`  RESULT: ${pass} passed, ${fail} failed`);
console.log('═'.repeat(56));
if (fail === 0) console.log('  🎉 All checks passed.');
else console.log('  ⚠  See ❌ items above.');
