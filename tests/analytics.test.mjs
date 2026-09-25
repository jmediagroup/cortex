import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// lib/analytics.ts imports `./analytics-batch` without an extension and
// `./supabase/client`, which would build a real Supabase client. Resolve the
// first with `.ts` appended, and swap the second for a stub whose auth client
// hands the test the onAuthStateChange callback, so identity changes can be
// driven by hand.
const stubClient = `
  export const createBrowserClient = () => ({
    auth: { onAuthStateChange: (cb) => { globalThis.__authCallback = cb; } },
  });
`;
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
        if (specifier === './supabase/client' && context.parentURL?.endsWith('/lib/analytics.ts')) {
          return { url: 'data:text/javascript,' + encodeURIComponent(${JSON.stringify(stubClient)}), shortCircuit: true };
        }
        try {
          return await next(specifier, context);
        } catch (err) {
          if (err && err.code === 'ERR_MODULE_NOT_FOUND' && specifier.startsWith('.') && !/\\.[a-z]+$/i.test(specifier)) {
            return next(specifier + '.ts', context);
          }
          throw err;
        }
      }
    `),
);

const { EVENT_COLUMNS, isTokenUsable, toEventRows } = await import('../lib/analytics-batch.ts');

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

const ev = (user_id, extra = {}) => ({ user_id, session_id: 's1', event_type: 'page_view', ...extra });

test('rows keep a user id only when it matches the sender', () => {
  const rows = toEventRows([ev('u1'), ev(null), ev('u2')], 'u1', 'u1');
  assert.deepEqual(rows.map((r) => r.user_id), ['u1', null, null]);
});

test('anon requests (the anon key) only ever send anonymous rows', () => {
  const rows = toEventRows([ev('u1'), ev(null), ev(undefined)], null, null);
  assert.deepEqual(rows.map((r) => r.user_id), [null, null, null]);
});

test('events tracked before the session was read take the known user', () => {
  assert.equal(toEventRows([ev(undefined)], 'u1', 'u1')[0].user_id, 'u1');
  // Known user but no usable token (e.g. expired): recorded anonymously.
  assert.equal(toEventRows([ev(undefined)], null, 'u1')[0].user_id, null);
});

test('every row carries every column, so the bulk insert stays uniform', () => {
  const [row] = toEventRows([{ session_id: 's1', event_type: 'dashboard_visit' }], null, null);
  assert.deepEqual(Object.keys(row).sort(), [...EVENT_COLUMNS].sort());
  assert.equal(row.event_data, null);
  assert.equal(row.page_url, null);
  assert.equal(row.user_agent, null);
});

test('tokens are used only while they have time left', () => {
  const now = 1_000_000_000_000;
  assert.equal(isTokenUsable(null, now), true);
  assert.equal(isTokenUsable(undefined, now), true);
  assert.equal(isTokenUsable(now / 1000 + 3600, now), true);
  assert.equal(isTokenUsable(now / 1000 + 5, now), false); // inside the 10 s margin
  assert.equal(isTokenUsable(now / 1000 - 60, now), false);
});

// ---------------------------------------------------------------------------
// The browser queue in lib/analytics.ts, with minimal browser globals
// ---------------------------------------------------------------------------

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

const storage = new Map();
globalThis.window = new EventTarget();
window.location = { href: 'https://moneyguymutants.com/thinking' };
globalThis.document = { visibilityState: 'visible' };
globalThis.sessionStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, String(v)),
};

const requests = [];
globalThis.fetch = async (url, init) => {
  requests.push({ url, init, rows: JSON.parse(init.body) });
  return { ok: true, status: 201 };
};

const analytics = await import('../lib/analytics.ts');

function hidePage() {
  document.visibilityState = 'hidden';
  window.dispatchEvent(new Event('visibilitychange'));
  document.visibilityState = 'visible';
}

const future = () => Math.floor(Date.now() / 1000) + 3600;

test('a page view and its web vitals go out as one request when the page is hidden', async () => {
  await analytics.trackPageView('/thinking');
  for (const [name, value] of [['TTFB', 80], ['FCP', 900], ['LCP', 1200], ['CLS', 0.01], ['INP', 120]]) {
    await analytics.trackWebVital(name, value, 'good');
  }
  assert.equal(requests.length, 0, 'nothing is sent while the page is visible');

  hidePage();
  assert.equal(requests.length, 1);
  const [{ url, init, rows }] = requests;
  assert.equal(url, `https://project.supabase.co/rest/v1/events?columns=${EVENT_COLUMNS.join(',')}`);
  assert.equal(init.method, 'POST');
  assert.equal(init.keepalive, true);
  assert.equal(init.headers.apikey, 'anon-key');
  assert.equal(init.headers.Authorization, 'Bearer anon-key');
  assert.deepEqual(
    rows.map((r) => r.event_type),
    ['page_view', 'web_vital_ttfb', 'web_vital_fcp', 'web_vital_lcp', 'web_vital_cls', 'web_vital_inp'],
  );
  assert.ok(rows.every((r) => r.user_id === null && r.session_id && r.page_url && r.user_agent));
});

test('hiding again, or pagehide, with nothing queued sends nothing', () => {
  hidePage();
  document.visibilityState = 'hidden';
  window.dispatchEvent(new Event('pagehide'));
  document.visibilityState = 'visible';
  assert.equal(requests.length, 1);
});

test('pagehide on a visible page leaves the flush to the visibilitychange that follows', async () => {
  requests.length = 0;
  await analytics.trackPageView('/about');
  // Leaving the page: pagehide fires while the page is still visible...
  window.dispatchEvent(new Event('pagehide'));
  assert.equal(requests.length, 0);
  // ...then visibilitychange(hidden), after web-vitals has queued its values.
  await analytics.trackWebVital('CLS', 0.02, 'good');
  hidePage();
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].rows.map((r) => r.event_type), ['page_view', 'web_vital_cls']);
});

test('pagehide on an already hidden page flushes what is queued', async () => {
  requests.length = 0;
  document.visibilityState = 'hidden';
  await analytics.trackEvent('app_opened');
  window.dispatchEvent(new Event('pagehide'));
  document.visibilityState = 'visible';
  assert.equal(requests.length, 1);
});

test('events tracked before the session loads are sent as the signed-in user', async () => {
  requests.length = 0;
  await analytics.trackPageView('/dashboard'); // session not read yet
  globalThis.__authCallback('INITIAL_SESSION', {
    user: { id: 'u1' },
    access_token: 'token-u1',
    expires_at: future(),
  });
  await analytics.trackEvent('dashboard_visit');
  hidePage();

  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.headers.Authorization, 'Bearer token-u1');
  assert.deepEqual(requests[0].rows.map((r) => r.user_id), ['u1', 'u1']);
});

test("signing out first sends the previous user's queued events with their token", async () => {
  requests.length = 0;
  await analytics.trackEvent('dashboard_visit');
  globalThis.__authCallback('SIGNED_OUT', null);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.headers.Authorization, 'Bearer token-u1');
  assert.deepEqual(requests[0].rows.map((r) => r.user_id), ['u1']);

  await analytics.trackPageView('/');
  hidePage();
  assert.equal(requests.length, 2);
  assert.equal(requests[1].init.headers.Authorization, 'Bearer anon-key');
  assert.deepEqual(requests[1].rows.map((r) => r.user_id), [null]);
});

test('immediate events flush the whole queue right away', async () => {
  requests.length = 0;
  await analytics.trackPageView('/login');
  await analytics.trackEvent('error_occurred', { error_message: 'boom' }, true);
  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0].rows.map((r) => r.event_type), ['page_view', 'error_occurred']);
});

test('an expired token is not used; the events are recorded anonymously', async () => {
  requests.length = 0;
  globalThis.__authCallback('SIGNED_IN', {
    user: { id: 'u2' },
    access_token: 'token-u2',
    expires_at: Math.floor(Date.now() / 1000) - 60,
  });
  await analytics.trackPageView('/account');
  hidePage();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.headers.Authorization, 'Bearer anon-key');
  assert.deepEqual(requests[0].rows.map((r) => r.user_id), [null]);
});

test('a long-lived tab also flushes every 25 events', async () => {
  requests.length = 0;
  for (let i = 0; i < 24; i += 1) await analytics.trackEvent('app_opened', { i });
  assert.equal(requests.length, 0);
  await analytics.trackEvent('app_opened', { i: 24 });
  assert.equal(requests.length, 1);
  assert.equal(requests[0].rows.length, 25);
});
