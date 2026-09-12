import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import middleware, { config } from '../middleware.js';

const originalUser = process.env.SITE_GATE_USERNAME;
const originalPassword = process.env.SITE_GATE_PASSWORD;
process.env.SITE_GATE_USERNAME = 'test-admin';
process.env.SITE_GATE_PASSWORD = 'test-password:with-colon';
after(() => {
  for (const [name, value] of [
    ['SITE_GATE_USERNAME', originalUser], ['SITE_GATE_PASSWORD', originalPassword],
  ]) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

const basic = (value) => `Basic ${Buffer.from(value).toString('base64')}`;
const request = (path = '/', headers = {}, method = 'GET') =>
  new Request(`https://www.youmaketv.ai${path}`, { headers, method });

test('denies pages, static files, APIs and bypass headers before routing', () => {
  assert.equal(config.matcher, '/:path*');
  for (const path of ['/', '/movie/78', '/privacy', '/index.html', '/app-shell.html',
    '/assets/app.js', '/robots.txt', '/sitemap.xml', '/api/contact', '/api/admin/login',
    '/not-a-route', '/%61pi/contact']) {
    for (const method of ['GET', 'HEAD', 'POST', 'OPTIONS']) {
      const response = middleware(request(path, { 'x-middleware-subrequest': 'middleware' }, method));
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.match(response.headers.get('www-authenticate'), /^Basic /);
      assert.match(response.headers.get('cache-control'), /no-store/);
      assert.match(response.headers.get('x-robots-tag'), /noindex/);
      assert.equal(response.headers.get('x-middleware-next'), null);
    }
  }
});

test('rejects wrong, malformed and oversized credentials without disclosing the password', async () => {
  for (const authorization of ['Bearer token', 'Basic !!!', 'Basic ', 'Basic ' + 'A'.repeat(3000),
    basic('test-admin:wrong'), basic('wrong:test-password:with-colon'), basic('test-admin')]) {
    const response = middleware(request('/', { authorization }));
    assert.equal(response.status, 401);
    assert.ok(!(await response.text()).includes(process.env.SITE_GATE_PASSWORD));
  }
});

test('allows correct credentials, strips the gate secret and preserves app authentication', () => {
  const response = middleware(request('/api/admin/verify', {
    authorization: basic('test-admin:test-password:with-colon'), 'x-admin-token': 'separate-app-token',
  }));
  assert.equal(response.headers.get('x-middleware-next'), '1');
  assert.equal(response.headers.get('x-middleware-request-authorization'), null);
  assert.equal(response.headers.get('x-middleware-request-x-admin-token'), 'separate-app-token');
  assert.match(response.headers.get('cache-control'), /no-store/);
});

test('fails closed if either server credential is missing', () => {
  for (const name of ['SITE_GATE_USERNAME', 'SITE_GATE_PASSWORD']) {
    const saved = process.env[name];
    delete process.env[name];
    assert.equal(middleware(request('/')).status, 503);
    process.env[name] = saved;
  }
});
