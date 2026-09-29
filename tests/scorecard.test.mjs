import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// lib/monetization/scorecard.ts imports `../ads/types` without an extension;
// retry such relative specifiers with `.ts` appended.
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

const { toolLines, funnelTotals, revenueLines, parseUserIdList, formatRate, toCount } = await import(
  '../lib/monetization/scorecard.ts'
);
const { TOOL_IDS } = await import('../lib/ads/types.ts');

const row = (tool_id, time_window, counts = {}) => ({
  tool_id,
  time_window,
  page_views: 0,
  views: 0,
  sessions: 0,
  completions: 0,
  completing_sessions: 0,
  exits_after_result: 0,
  offer_impressions: 0,
  offer_clicks: 0,
  report_requests: 0,
  reports_sent: 0,
  unlock_views: 0,
  unlock_clicks: 0,
  purchases: 0,
  advisor_requests: 0,
  completion_rate: null,
  ...counts,
});

test('every known tool gets a line, busiest first, zeros for the quiet ones', () => {
  const lines = toolLines(
    [
      row('coast-fire', '30d', { views: '12', sessions: '10', completing_sessions: '4', completions: '5' }),
      row('rent-vs-buy', '30d', { views: 3, sessions: 3, completing_sessions: 3 }),
      row('coast-fire', '7d', { views: 99 }), // another window: ignored
      row('not-a-tool', '30d', { views: 500 }), // unknown slug: ignored
    ],
    '30d',
  );
  assert.equal(lines.length, TOOL_IDS.length);
  assert.deepEqual(lines.slice(0, 2).map((l) => l.tool_id), ['coast-fire', 'rent-vs-buy']);
  assert.equal(lines[0].views, 12); // bigint strings become numbers
  assert.equal(lines[0].completion_rate, 0.4);
  assert.equal(lines[1].completion_rate, 1);
  assert.equal(lines.at(-1).views, 0);
  assert.equal(lines.at(-1).completion_rate, null);
});

test('totals add up the per-tool lines and recompute the rate from them', () => {
  const totals = funnelTotals(
    toolLines(
      [
        row('coast-fire', 'all', { views: 10, sessions: 8, completing_sessions: 2, completions: 2 }),
        row('budget', 'all', { views: 5, sessions: 2, completing_sessions: 2, completions: 3 }),
      ],
      'all',
    ),
  );
  assert.equal(totals.views, 15);
  assert.equal(totals.completions, 5);
  assert.equal(totals.completion_rate, 0.4);
});

test('revenue lines keep their order and never turn a missing amount into zero', () => {
  const lines = revenueLines(
    [
      { line: 'monthly_subscription', sort_order: 3, time_window: '7d', units: '1', revenue_cents: null, source_note: '' },
      { line: 'affiliate', sort_order: 1, time_window: '7d', units: 0, revenue_cents: null, source_note: '' },
      { line: 'lifetime', sort_order: 2, time_window: '7d', units: 2, revenue_cents: '17800', source_note: '' },
      { line: 'affiliate', sort_order: 1, time_window: 'all', units: 9, revenue_cents: null, source_note: '' },
    ],
    '7d',
  );
  assert.deepEqual(lines.map((l) => l.line), ['affiliate', 'lifetime', 'monthly_subscription']);
  assert.equal(lines[0].revenue_cents, null);
  assert.equal(lines[1].revenue_cents, 17800);
  assert.equal(lines[2].units, 1);
});

test('excluded user ids: valid UUIDs only, de-duplicated', () => {
  assert.deepEqual(
    parseUserIdList(' 0f8FAD5B-D9CB-469F-A165-70867728950E, nope,0f8fad5b-d9cb-469f-a165-70867728950e,,'),
    ['0f8fad5b-d9cb-469f-a165-70867728950e'],
  );
  assert.deepEqual(parseUserIdList(undefined), []);
});

test('rates and counts format safely', () => {
  assert.equal(formatRate(null), '—');
  assert.equal(formatRate(0), '0%');
  assert.equal(formatRate(0.4), '40%');
  assert.equal(formatRate(0.042), '4.2%');
  assert.equal(toCount('7'), 7);
  assert.equal(toCount(null), 0);
  assert.equal(toCount('abc'), 0);
});
