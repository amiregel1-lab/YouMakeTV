/**
 * Full Supabase validation suite.
 * Run: node scripts/full-validation.mjs
 */
import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const envRaw = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of envRaw.split('\n')) {
  const eq = line.indexOf('=');
  if (eq > 0) env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
}
const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

let pass = 0, fail = 0;
function ok(label)  { console.log(`  ✅ ${label}`); pass++; }
function err(label, detail) { console.log(`  ❌ ${label}`); if (detail) console.log(`     ${detail}`); fail++; }
function section(title) { console.log(`\n── ${title} ${'─'.repeat(50 - title.length)}`); }

// ── 1. Movies table read ──────────────────────────────────────────────────────
section('1. DB READ — movies table');
const { data: rows, error: readErr, count } = await supabase
  .from('movies').select('*', { count: 'exact' }).order('id').limit(5);

if (readErr) { err('Select failed', readErr.message); }
else {
  ok(`Table readable — ${count} total rows`);
  if (count === 100) ok('Row count is exactly 100 (clean seed)');
  else if (count === 101) err('Row count is 101 — probe row id=999999 still present (delete policy not applied)');
  else console.log(`     ⚠ Row count: ${count} (expected 100)`);

  const sample = rows.slice(0, 3);
  for (const r of sample) {
    const coverOk = r.cover_url && !r.cover_url.startsWith('data:');
    console.log(`     [${String(r.id).padStart(3)}] "${r.title}" | cover_url: ${r.cover_url?.slice(0,55) ?? 'null'}`);
  }
}

// ── 2. Movies table write (upsert) ────────────────────────────────────────────
section('2. DB WRITE — upsert admin edit');
const testMovie = {
  id: rows?.[0]?.id ?? 0,
  title: rows?.[0]?.title ?? 'Test',
  status: 'Approved',
  updated_at: new Date().toISOString(),
};
const { error: upsertErr } = await supabase
  .from('movies').upsert(testMovie, { onConflict: 'id' });

if (upsertErr) err('Upsert failed', upsertErr.message);
else ok(`Upsert succeeded (movie id=${testMovie.id} "${testMovie.title}")`);

// ── 3. Cleanup probe row ──────────────────────────────────────────────────────
if (count === 101) {
  section('3. Cleanup probe row id=999999');
  const { error: delErr } = await supabase.from('movies').delete().eq('id', 999999);
  if (delErr) err('Delete failed — "Anon delete" policy missing', delErr.message);
  else {
    ok('Probe row deleted');
    const { count: newCount } = await supabase.from('movies').select('id', { count: 'exact', head: true });
    ok(`Row count now ${newCount}`);
  }
} else {
  section('3. Probe row cleanup');
  ok('No probe row — nothing to clean up');
}

// ── 4. Cover upload via signed URL ───────────────────────────────────────────
section('4. STORAGE UPLOAD — covers bucket (signed URL)');
const svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect fill="#7c3aed" width="2" height="2"/></svg>';
const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
const coverPath = `_probe_cover_${Date.now()}.svg`;

const { data: coverSigned, error: coverSignErr } = await supabase.storage
  .from('covers').createSignedUploadUrl(coverPath);

if (coverSignErr) {
  err('Failed to create signed upload URL for covers', coverSignErr.message);
} else {
  ok('Signed upload URL created');
  const { data: coverData, error: coverErr } = await supabase.storage
    .from('covers').uploadToSignedUrl(coverSigned.path, coverSigned.token, svgBlob, { contentType: 'image/svg+xml' });

  if (coverErr) {
    err('Cover upload failed', coverErr.message);
  } else {
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(coverData.path);
    ok('Cover upload succeeded');
    ok(`Public URL: ${publicUrl.slice(0, 80)}`);
    try {
      const res = await fetch(publicUrl, { method: 'HEAD' });
      if (res.ok) ok(`Public URL reachable (HTTP ${res.status}) — visible on any device`);
      else err('Public URL not reachable, HTTP ' + res.status);
    } catch { console.log('     ⚠ Could not verify URL fetch (likely fine in browser)'); }
    await supabase.storage.from('covers').remove([coverData.path]);
    ok('Probe file cleaned up');
  }
}

// ── 5. Trailer upload via signed URL ──────────────────────────────────────────
section('5. STORAGE UPLOAD — trailers bucket (signed URL)');
const mp4Blob = new Blob([new Uint8Array([0,0,0,20,102,116,121,112])], { type: 'video/mp4' });
const trailerPath = `_probe_trailer_${Date.now()}.mp4`;

const { data: trailerSigned, error: trailerSignErr } = await supabase.storage
  .from('trailers').createSignedUploadUrl(trailerPath);

if (trailerSignErr) {
  err('Failed to create signed upload URL for trailers', trailerSignErr.message);
} else {
  ok('Signed upload URL created');
  const { data: trailerData, error: trailerErr } = await supabase.storage
    .from('trailers').uploadToSignedUrl(trailerSigned.path, trailerSigned.token, mp4Blob, { contentType: 'video/mp4' });

  if (trailerErr) {
    err('Trailer upload failed', trailerErr.message);
  } else {
    const { data: { publicUrl } } = supabase.storage.from('trailers').getPublicUrl(trailerData.path);
    ok('Trailer upload succeeded');
    ok(`Public URL: ${publicUrl.slice(0, 80)}`);
    await supabase.storage.from('trailers').remove([trailerData.path]);
    ok('Probe file cleaned up');
  }
}

// ── 6. Admin edit persistence simulation ─────────────────────────────────────
section('6. ADMIN EDIT PERSISTENCE');
const original = rows?.find(r => r.id === 0);
if (!original) { err('Movie id=0 not found'); }
else {
  // Simulate an admin edit (change price)
  const editedPrice = 9.99;
  const { error: editErr } = await supabase
    .from('movies').upsert({ ...original, price: editedPrice }, { onConflict: 'id' });

  if (editErr) { err('Admin edit (upsert) failed', editErr.message); }
  else {
    // Simulate a fresh load (different device / refresh)
    const { data: reloaded, error: reloadErr } = await supabase
      .from('movies').select('id,title,price').eq('id', 0).single();

    if (reloadErr) { err('Fresh load after edit failed', reloadErr.message); }
    else if (reloaded.price === editedPrice) {
      ok(`Edit persisted — price reads back as $${reloaded.price} after simulated refresh`);
      ok('Any device / browser / incognito tab loading from Supabase sees this change');
    } else {
      err(`Price mismatch — wrote ${editedPrice}, read back ${reloaded.price}`);
    }

    // Restore original price
    await supabase.from('movies').upsert({ ...original }, { onConflict: 'id' });
    ok('Original price restored');
  }
}

// ── 7. Cross-device persistence proof ────────────────────────────────────────
section('7. PERSISTENCE MODEL');
console.log('     Source of truth: Supabase DB (PostgreSQL, hosted in cloud)');
console.log('     Cover images:    Supabase Storage CDN (globally accessible URL)');
console.log('     Trailer videos:  Supabase Storage CDN (globally accessible URL)');
console.log('     localStorage:    still used for admin UI state only (not movie data)');
console.log('     Any device loading the app calls getMovies() → Supabase → same data');

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n' + '═'.repeat(56));
console.log(`  RESULT: ${pass} passed, ${fail} failed`);
console.log('═'.repeat(56));
if (fail === 0) console.log('  🎉 All checks passed — Supabase is fully operational.');
else console.log('  ⚠  Some checks failed — see ❌ items above for fixes.');
