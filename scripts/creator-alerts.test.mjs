import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
process.env.SUPABASE_URL = 'https://qa.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'isolated-test-key';
const { default: handler } = await import('../api/creator/films.js');
const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const owner = '11111111-1111-4111-8111-111111111111';
function mock(routes = [], role = 'creator') {
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    assert.equal(new URL(url).hostname, 'qa.invalid');
    calls.push({ url, ...init });
    if (url.endsWith('/auth/v1/user')) return Response.json({ id: owner, user_metadata: { account_type: role, full_name: 'Test Creator' } });
    const match = routes.find(r => url.includes(r.path) && (!r.method || init.method === r.method));
    assert.ok(match, `Unexpected test request: ${new URL(url).pathname}`);
    return Response.json(match.data, { status: match.status || 200 });
  };
  return calls;
}
async function invoke(method, body, authorized = true) {
  const result = { code: 200, body: null };
  const res = { setHeader() {}, status(code) { result.code = code; return this; }, json(body) { result.body = body; return this; } };
  await handler({ method, headers: authorized ? { authorization: 'Bearer fixture' } : {}, body }, res);
  return result;
}
test('anonymous requests never access the database', async () => {
  const calls = mock();
  assert.equal((await invoke('GET', null, false)).code, 401);
  assert.equal(calls.length, 0);
});
test('viewer accounts cannot upload films', async () => {
  const calls = mock([], 'viewer');
  assert.equal((await invoke('POST', {})).code, 403);
  assert.equal(calls.length, 1);
});
test('another creator cannot update or delete a film', async () => {
  const calls = mock([{ path: '/creator_movie_owners?', data: [] }]);
  for (const method of ['PATCH', 'DELETE']) assert.equal((await invoke(method, { id: 42, changes: { status: 'Approved' } })).code, 404);
  assert.ok(calls.filter(c => c.url.includes('/creator_movie_owners?')).every(c => c.url.includes(`owner_user_id=eq.${owner}`)));
  assert.ok(!calls.some(c => c.url.includes('/movies?')));
});
test('invalid media and submission IDs never reach a write', async () => {
  const calls = mock();
  assert.equal((await invoke('POST', { requestId: 'wrong' })).code, 400);
  assert.equal((await invoke('POST', { requestId: owner, film: { title: 'Test', description: 'A valid test description', filmUrl: 'javascript:alert(1)' } })).code, 400);
  assert.ok(calls.every(c => c.url.endsWith('/auth/v1/user')));
});
test('draft retries preserve the idempotency key and use verified ownership', async () => {
  const calls = mock([{ path: '/rpc/create_creator_draft', data: 42 }, { path: '/movies?', data: [{ id: 42, title: 'Test', status: 'Draft' }] }, { path: '/creator_movie_owners?', data: [{ movie_id: 42, film_url: 'https://example.invalid/film.mp4' }] }]);
  const body = { requestId: owner, owner_id: 'attacker', film: { title: 'Test', description: 'A valid test description', status: 'Approved' } };
  assert.equal((await invoke('POST', body)).body.film.id, '42');
  assert.equal((await invoke('POST', body)).body.film.id, '42');
  const writes = calls.filter(c => c.url.endsWith('/rpc/create_creator_draft')).map(c => JSON.parse(c.body));
  assert.equal(writes.length, 2);
  assert.ok(writes.every(w => w.owner_id === owner && w.request_id_input === owner && w.film.status === undefined));
});
test('submitting a draft requires a playable full-film URL', async () => {
  const calls = mock([{ path: '/creator_movie_owners?', data: [{ movie_id: 42, film_url: null }] }, { path: '/movies?', data: [{ id: 42, title: 'Test', description: 'A valid test description', status: 'Draft' }] }]);
  assert.equal((await invoke('PATCH', { id: 42, changes: { status: 'Pending Review' } })).code, 400);
  assert.ok(!calls.some(c => c.method === 'PATCH'));
});
