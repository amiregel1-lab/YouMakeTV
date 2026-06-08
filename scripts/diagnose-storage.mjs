/**
 * Diagnoses storage bucket state via Supabase Management REST API.
 * Uses the anon key to test uploads with verbose error details.
 * Run: node scripts/diagnose-storage.mjs
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

// ── Check bucket list ─────────────────────────────────────────────────────────
console.log('── Checking buckets via Storage API…');
const { data: buckets, error: bucketErr } = await supabase.storage.listBuckets();
if (bucketErr) {
  console.error('❌ Cannot list buckets:', bucketErr.message);
} else {
  console.log('Buckets found:');
  for (const b of buckets ?? []) {
    console.log(`  id="${b.id}" name="${b.name}" public=${b.public}`);
  }
}

// ── Probe upload with full error object ───────────────────────────────────────
console.log('\n── Testing covers upload (full error dump)…');
const blob = new Blob(['x'], { type: 'image/jpeg' });
const { data: cd, error: ce } = await supabase.storage
  .from('covers')
  .upload(`_probe_${Date.now()}.jpg`, blob, { contentType: 'image/jpeg', upsert: true });

if (ce) {
  console.error('❌ covers upload error:');
  console.error('  message:', ce.message);
  console.error('  status:', ce.statusCode);
  console.error('  error:', ce.error);
  console.error('  cause:', JSON.stringify(ce, null, 2));
} else {
  const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(cd.path);
  console.log('✓ Upload succeeded! path:', cd.path);
  console.log('  publicUrl:', publicUrl);
  // Verify URL is reachable
  const r = await fetch(publicUrl, { method: 'HEAD' }).catch(() => null);
  console.log('  URL reachable:', r ? `HTTP ${r.status}` : 'fetch failed');
  await supabase.storage.from('covers').remove([cd.path]);
  console.log('  Probe cleaned up.');
}

// ── Check movie count ─────────────────────────────────────────────────────────
console.log('\n── Movies table check…');
const { count } = await supabase.from('movies').select('id', { count: 'exact', head: true });
console.log(`  Row count: ${count}`);

const { data: sample } = await supabase
  .from('movies').select('id,title,cover_url,trailer_url').order('id').limit(5);
for (const row of sample ?? []) {
  console.log(`  [${String(row.id).padStart(3)}] "${row.title}" | cover: ${row.cover_url?.slice(0, 60) ?? 'null'}`);
}
