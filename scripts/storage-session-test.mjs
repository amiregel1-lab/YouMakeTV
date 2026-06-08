/**
 * Tests whether anonymous sign-in (real session) fixes storage uploads.
 * In newer Supabase projects, storage writes require a session JWT — even for anon users.
 * Run: node scripts/storage-session-test.mjs
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
const supabase = createClient(SUPABASE_URL, ANON_KEY);

const blob = () => new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>'], { type: 'image/svg+xml' });

// ── Test A: Upload with no session (current behaviour) ────────────────────────
console.log('── A: Upload with bare anon key (no session)');
const { error: errA } = await supabase.storage.from('covers')
  .upload(`_probe_A_${Date.now()}.svg`, blob(), { contentType: 'image/svg+xml', upsert: true });
console.log(errA ? `  ❌ Failed: ${errA.message}` : '  ✅ Succeeded');

// ── Test B: Sign in anonymously, then upload ──────────────────────────────────
console.log('\n── B: signInAnonymously() then upload');
const { data: anonSession, error: signInErr } = await supabase.auth.signInAnonymously();
if (signInErr) {
  console.log('  ⚠ signInAnonymously failed:', signInErr.message);
  console.log('  (Anonymous sign-ins may be disabled in Auth settings)');
} else {
  console.log('  Session user id:', anonSession?.user?.id ?? 'null');
  console.log('  Session role:', anonSession?.user?.role ?? 'null');
  const { data: upB, error: errB } = await supabase.storage.from('covers')
    .upload(`_probe_B_${Date.now()}.svg`, blob(), { contentType: 'image/svg+xml', upsert: true });
  if (errB) {
    console.log('  ❌ Still failed after sign-in:', errB.message);
  } else {
    const { data: { publicUrl } } = supabase.storage.from('covers').getPublicUrl(upB.path);
    console.log('  ✅ Upload succeeded with session!');
    console.log('  Public URL:', publicUrl);
    // Verify URL is reachable
    const r = await fetch(publicUrl, { method: 'HEAD' }).catch(() => null);
    console.log('  URL reachable:', r ? `HTTP ${r.status}` : 'fetch failed');
    await supabase.storage.from('covers').remove([upB.path]);
    console.log('  Cleaned up.');
  }
}

// ── Test C: Check if we can create a signed upload URL ───────────────────────
console.log('\n── C: createSignedUploadUrl (alternative approach)');
const { data: signed, error: signedErr } = await supabase.storage
  .from('covers').createSignedUploadUrl(`_probe_C_${Date.now()}.svg`);
if (signedErr) {
  console.log('  ❌ Signed URL creation failed:', signedErr.message);
} else {
  console.log('  ✅ Signed upload URL created:', signed.signedUrl?.slice(0, 80) + '...');
  // Try uploading via the signed URL
  const uploadRes = await fetch(signed.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/svg+xml' },
    body: blob(),
  });
  const uploadBody = await uploadRes.json().catch(() => uploadRes.text());
  console.log('  Upload via signed URL:', uploadRes.status, JSON.stringify(uploadBody));
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('\n── Recommendation:');
if (signInErr) {
  console.log('  Anonymous sign-ins are OFF in Auth settings.');
  console.log('  Fix: Supabase Dashboard → Authentication → Settings → enable "Allow anonymous sign-ins"');
  console.log('  This is the most likely root cause.');
} else {
  console.log('  Anonymous sign-in is enabled.');
}
