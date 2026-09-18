import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import ts from 'typescript';

const source = readFileSync(new URL('../src/app/api/home-shell/[locale]/route.ts', import.meta.url), 'utf8');
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const html = (locale) => '<html data-locale="' + locale + '"><body><script id="global-schema-jsonld" type="application/ld+json">{}</script><script src="/_next/static/a.js?x=1"></script></body></html>';
function harness(env, response) {
  const calls = [];
  const sandbox = {
    exports: {}, Response, Headers, URL, AbortSignal, process: { env },
    fetch: async (url, options) => {
      calls.push({ url: String(url), options });
      return response(String(url), options);
    },
  };
  vm.runInNewContext(js, sandbox);
  return { calls, get: (locale, credentials = false, url = 'https://attacker.invalid/tr') => sandbox.exports.GET({
    url, headers: new Headers(credentials ? { 'x-vercel-protection-bypass': 'qa-only', cookie: 'private=do-not-forward' } : {}),
    cookies: { get: (key) => credentials && key === '_vercel_jwt' ? { value: 'qa-cookie' } : undefined },
  }, { params: Promise.resolve({ locale }) }) };
}
const deployment = 'current-deployment.vercel.app';
test('anonymous production visitors use public source despite protected deployment URL', async () => {
  const h = harness({ VERCEL: '1', VERCEL_ENV: 'production', VERCEL_URL: deployment }, (url) => {
    if (new URL(url).hostname === deployment) return new Response(null, { status: 302, headers: { location: 'https://vercel.com/login' } });
    assert.equal(new URL(url).origin, 'https://crearetravel.com');
    const locale = new URL(url).pathname.split('/')[1] === 'home-source-internal' ? 'en' : new URL(url).pathname.split('/')[1];
    return new Response(html(locale), { headers: { 'content-type': 'text/html' } });
  });
  for (const locale of ['en', 'tr', 'zh', 'ru']) {
    const r = await h.get(locale);
    assert.equal(r.status, 200);
    const body = await r.text();
    assert(body.includes('data-locale="' + locale + '"'));
    assert(body.includes('/home-shell.js'));
    assert(!body.includes('/_next/'));
  }
  for (const c of h.calls) {
    assert.equal(c.options.headers.has('cookie'), false);
    assert.equal(c.options.headers.has('x-vercel-protection-bypass'), false);
  }
});
test('production never forwards incoming credentials to public source', async () => {
  const h = harness({ VERCEL: '1', VERCEL_ENV: 'production', VERCEL_URL: deployment }, () => new Response(html('tr'), { headers: { 'content-type': 'text/html' } }));
  assert.equal((await h.get('tr', true)).status, 200);
  const headers = h.calls[0].options.headers;
  assert.equal(headers.has('cookie'), false);
  assert.equal(headers.has('x-vercel-protection-bypass'), false);
});
test('preview stays isolated to its own deployment and passes only Vercel credentials', async () => {
  const h = harness({ VERCEL: '1', VERCEL_ENV: 'preview', VERCEL_URL: deployment }, (url, options) => {
    assert.equal(url, 'https://' + deployment + '/tr/home-source-internal');
    assert.equal(options.headers.get('cookie'), '_vercel_jwt=qa-cookie');
    assert.equal(options.headers.get('x-vercel-protection-bypass'), 'qa-only');
    return new Response(html('tr'), { headers: { 'content-type': 'text/html' } });
  });
  assert.equal((await h.get('tr', true)).status, 200);
});
test('redirects, login HTML, errors and timeouts are non-cacheable failures', async () => {
  for (const response of [
    () => new Response(null, { status: 302, headers: { location: 'https://vercel.com/login' } }),
    () => new Response('<html>Login</html>', { headers: { 'content-type': 'text/html' } }),
    () => new Response('error', { status: 500 }),
    () => { throw new Error('timeout'); },
  ]) {
    const h = harness({ VERCEL: '1', VERCEL_ENV: 'production' }, response);
    const r = await h.get('tr');
    assert.equal(r.status, 502);
    assert.equal(r.headers.get('cache-control'), 'no-store');
  }
});
test('inherited or unsupported locale keys never fetch', async () => {
  const h = harness({ VERCEL: '1', VERCEL_ENV: 'production' }, () => { throw new Error('must not fetch'); });
  for (const locale of ['constructor', '__proto__', 'toString', 'de']) assert.equal((await h.get(locale)).status, 404);
  assert.equal(h.calls.length, 0);
});

