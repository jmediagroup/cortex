import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// lib/tool-funnel.ts imports `./ads/types` without an extension (fine for the
// Next bundler, not for Node ESM): retry such relative specifiers with `.ts`.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      export async function resolve(specifier, context, next) {
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

const {
  FUNNEL_EVENTS,
  FUNNEL_EVENT_KEYS,
  buildAttribution,
  isFunnelEvent,
  referrerHost,
  sanitizeFunnelData,
  timeAfterResultBucket,
  toSafeSlug,
} = await import('../lib/tool-funnel.ts');

test('every funnel event in the handoff contract has an allow list', () => {
  assert.deepEqual(Object.keys(FUNNEL_EVENT_KEYS).sort(), [...FUNNEL_EVENTS].sort());
  assert.ok(isFunnelEvent('tool_calculation_completed'));
  assert.ok(!isFunnelEvent('page_view'));
});

test('payloads keep only allowed keys, and never PII or raw financial inputs', () => {
  const data = sanitizeFunnelData('tool_calculation_completed', {
    tool_id: 'coast-fire',
    is_logged_in: true,
    from_scenario: false,
    email: 'someone@example.com',
    birth_date: '1990-01-01',
    income: 85000,
    current_savings: '250000',
    input_bucket: '85000',
  });
  assert.deepEqual(data, { tool_id: 'coast-fire', is_logged_in: true, from_scenario: false });
});

test('an email address is dropped even from an allowed key', () => {
  const data = sanitizeFunnelData('tool_viewed', {
    tool_id: 'budget',
    utm_campaign: 'someone@example.com',
    utm_source: 'Spring Newsletter',
  });
  assert.deepEqual(data, { tool_id: 'budget', utm_source: 'spring-newsletter' });
});

test('booleans must be booleans; everything else becomes a short slug', () => {
  const data = sanitizeFunnelData('report_email_requested', {
    tool_id: 'rent-vs-buy',
    consent_marketing: 'yes',
  });
  assert.deepEqual(data, { tool_id: 'rent-vs-buy' });
  assert.equal(toSafeSlug('x'.repeat(200)).length, 64);
  assert.equal(toSafeSlug('Hello <b>World</b>!'), 'hello-bworldb');
});

test('dollar amounts and bare numbers never survive as strings', () => {
  for (const value of ['85000', '$1,200.50', '12%', ' 42 ', '1990-01-01', '-3.5']) {
    assert.equal(toSafeSlug(value), null, value);
  }
  assert.equal(toSafeSlug('50k-100k'), '50k-100k');
  assert.equal(toSafeSlug(85000), null);
});

test('events for unknown or missing tools are rejected', () => {
  assert.equal(sanitizeFunnelData('tool_viewed', { tool_id: 'not-a-tool' }), null);
  assert.equal(sanitizeFunnelData('tool_viewed', {}), null);
  assert.equal(sanitizeFunnelData('offer_click', { campaign_slug: 'x' }), null);
  // Checkout can start outside a tool (the pricing page)…
  assert.deepEqual(sanitizeFunnelData('checkout_started', { plan: 'lifetime', billing: 'one_time' }), {
    plan: 'lifetime',
    billing: 'one_time',
  });
  // …but a tool id it does carry must be real.
  assert.equal(sanitizeFunnelData('checkout_started', { plan: 'lifetime', tool_id: 'nope' }), null);
});

test('referrer host keeps the host only and ignores our own domains', () => {
  assert.equal(referrerHost('https://www.google.com/search?q=my+salary+is+90000', 'moneyguymutants.com'), 'google.com');
  assert.equal(referrerHost('https://moneyguymutants.com/apps', 'moneyguymutants.com'), null);
  assert.equal(referrerHost('https://www.moneyguymutants.com/', 'moneyguymutants.com'), null);
  assert.equal(referrerHost('https://cortex.vip/apps/budget', 'moneyguymutants.com'), null);
  assert.equal(referrerHost('https://preview-abc.vercel.app/x', 'preview-abc.vercel.app'), null);
  assert.equal(referrerHost('not a url', 'moneyguymutants.com'), null);
  assert.equal(referrerHost('', 'moneyguymutants.com'), null);
});

test('session attribution reads UTM tags and the external referrer host', () => {
  assert.deepEqual(
    buildAttribution(
      'https://old.reddit.com/r/personalfinance/comments/abc',
      '?utm_source=Reddit&utm_medium=social&utm_campaign=coast%20fire%20launch&email=a@b.com',
      'moneyguymutants.com',
    ),
    {
      referrer_host: 'old.reddit.com',
      utm_source: 'reddit',
      utm_medium: 'social',
      utm_campaign: 'coast-fire-launch',
    },
  );
  assert.deepEqual(buildAttribution('', '', 'moneyguymutants.com'), {});
});

test('time after a result is bucketed, never exact', () => {
  assert.equal(timeAfterResultBucket(3_000), 'under-10s');
  assert.equal(timeAfterResultBucket(30_000), '10-60s');
  assert.equal(timeAfterResultBucket(120_000), '1-5m');
  assert.equal(timeAfterResultBucket(3_600_000), 'over-5m');
});
