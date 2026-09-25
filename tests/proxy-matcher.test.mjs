import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AsyncLocalStorage } from 'node:async_hooks';
import { createRequire, register } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Next's matcher helper expects the AsyncLocalStorage global that the Next
// runtime normally installs.
globalThis.AsyncLocalStorage ??= AsyncLocalStorage;

// proxy.ts imports `@/lib/...` and `next/server` without file extensions —
// fine for the Next bundler, not for Node ESM. Map `@/` to the repo root and
// retry extensionless specifiers with `.ts` (repo files) then `.js` (packages).
const root = path.resolve(import.meta.dirname, '..');
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      const ROOT = ${JSON.stringify(pathToFileURL(root + path.sep).href)};
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith('@/')) specifier = ROOT + specifier.slice(2);
        try {
          return await next(specifier, context);
        } catch (err) {
          if (err && err.code === 'ERR_MODULE_NOT_FOUND' && !/\\.[a-z]+$/i.test(specifier)) {
            try {
              return await next(specifier + '.ts', context);
            } catch {
              return next(specifier + '.js', context);
            }
          }
          throw err;
        }
      }
    `),
);

const require = createRequire(import.meta.url);
const { unstable_doesMiddlewareMatch } = require('next/experimental/testing/server');
const { config } = await import('../proxy.ts');
const { PROTECTED_PREFIXES, isProtected } = await import('../lib/supabase/middleware.ts');

const runsOn = (url) => unstable_doesMiddlewareMatch({ config, url });

const PUBLIC_PATHS = [
  '/',
  '/articles',
  '/articles/some-article',
  '/thinking',
  '/thinking?type=daily',
  '/thinking/2026-09-25-some-outlook',
  '/guides/some-guide',
  '/apps/budget',
  '/calculators/coast-fire-calculator',
  '/pricing',
  '/login',
  '/signup',
  '/reset-password',
  '/auth/callback?code=abc',
  '/api/admin/stats',
  '/api/scenarios',
  // Look-alikes that must not be treated as the protected areas.
  '/dashboards',
  '/administrator',
  '/account-deletion',
];

test('the proxy runs on every protected area, including the bare prefix', () => {
  for (const prefix of PROTECTED_PREFIXES) {
    for (const url of [prefix, `${prefix}/`, `${prefix}/some/deep/page`, `${prefix}?tab=1`]) {
      assert.equal(runsOn(url), true, `expected the proxy to run on ${url}`);
    }
  }
});

test('the proxy does not run on public pages or API routes', () => {
  for (const url of PUBLIC_PATHS) {
    assert.equal(runsOn(url), false, `expected the proxy to skip ${url}`);
  }
});

test('the matcher and the redirect guard cover exactly the same paths', () => {
  assert.equal(config.matcher.length, PROTECTED_PREFIXES.length);
  const sample = [
    ...PUBLIC_PATHS,
    ...PROTECTED_PREFIXES.flatMap((p) => [p, `${p}/x`, `${p}x`]),
  ];
  for (const url of sample) {
    const pathname = new URL(url, 'https://example.com').pathname;
    assert.equal(runsOn(url), isProtected(pathname), `matcher and isProtected disagree on ${url}`);
  }
});
