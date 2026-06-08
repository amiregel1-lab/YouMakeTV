/**
 * Deep storage diagnostic — tries every known upload variation to isolate the blocker.
 * Run: node scripts/storage-deep-diagnose.mjs
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
const ANON_KEY    = env['VITE_SUPABASE_ANON_KEY'];

// ── Test 1: Raw fetch — bypass the JS client entirely ────────────────────────
// This proves whether the issue is the JS client or the Supabase project config.
console.log('── Test 1: Raw HTTP upload to covers bucket (no JS client)');
const rawBody = new Uint8Array([137,80,78,71]); // PNG header bytes
const rawRes = await fetch(
  `${SUPABASE_URL}/storage/v1/object/covers/_raw_probe_${Date.now()}.png`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type':  'image/png',
      'x-upsert':      'true',
    },
    body: rawBody,
  }
);
const rawJson = await rawRes.json().catch(() => rawRes.text());
console.log('  HTTP status:', rawRes.status);
console.log('  Response:', JSON.stringify(rawJson));

// ── Test 2: Try trailers bucket ───────────────────────────────────────────────
console.log('\n── Test 2: Raw HTTP upload to trailers bucket');
const rawRes2 = await fetch(
  `${SUPABASE_URL}/storage/v1/object/trailers/_raw_probe_${Date.now()}.mp4`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANON_KEY}`,
      'Content-Type':  'video/mp4',
      'x-upsert':      'true',
    },
    body: new Uint8Array([0,0,0,20,102,116,121,112]),
  }
);
const rawJson2 = await rawRes2.json().catch(() => rawRes2.text());
console.log('  HTTP status:', rawRes2.status);
console.log('  Response:', JSON.stringify(rawJson2));

// ── Test 3: List bucket (SELECT policy check) ─────────────────────────────────
console.log('\n── Test 3: List objects in covers bucket (SELECT)');
const supabase = createClient(SUPABASE_URL, ANON_KEY);
const { data: listData, error: listErr } = await supabase.storage.from('covers').list('', { limit: 3 });
if (listErr) console.log('  ❌ List failed:', listErr.message);
else         console.log('  ✅ List succeeded, items:', listData?.length ?? 0);

// ── Test 4: Check owner_id constraint with JS client ─────────────────────────
console.log('\n── Test 4: JS client upload (current behaviour)');
const blob = new Blob(['x'], { type: 'text/plain' });
const { data, error } = await supabase.storage
  .from('covers')
  .upload(`_probe_${Date.now()}.txt`, blob, { contentType: 'text/plain', upsert: true });
if (error) console.log('  ❌ Failed:', error.message, '| status:', error.statusCode, '| error field:', error.error);
else       console.log('  ✅ Succeeded:', data.path);

// ── Test 5: Check storage version / health ────────────────────────────────────
console.log('\n── Test 5: Storage service health');
const health = await fetch(`${SUPABASE_URL}/storage/v1/health`, {
  headers: { 'Authorization': `Bearer ${ANON_KEY}` }
});
const healthJson = await health.json().catch(() => ({}));
console.log('  HTTP status:', health.status);
console.log('  Version:', healthJson.version ?? '(not in response)');
console.log('  Response:', JSON.stringify(healthJson));
