import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// lib/ads/validation.ts imports `./types` without an extension (fine for the
// Next bundler, not for Node ESM). Register a tiny resolver that retries such
// relative specifiers with `.ts` appended, then load the modules dynamically.
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
  isCampaignLive,
  campaignTargetsTool,
  filterCampaignsForTool,
  pickWeighted,
  orderForRotation,
  splitHighlightSegments,
} = await import('../lib/ads/select.ts');
const { pickCampaignFields, validateCreative, pickAdvertiserFields, AdsValidationError, isUuid } = await import(
  '../lib/ads/validation.ts'
);

const NOW = new Date('2026-09-20T12:00:00Z');
const campaign = (overrides = {}) => ({
  id: 'c',
  status: 'active',
  tool_ids: null,
  exclude_tool_ids: [],
  starts_at: null,
  ends_at: null,
  hide_for_tiers: ['finance_pro'],
  weight: 1,
  priority: 0,
  ...overrides,
});

// ---------------------------------------------------------------------------
// isCampaignLive
// ---------------------------------------------------------------------------
test('only active campaigns are live', () => {
  assert.equal(isCampaignLive(campaign(), NOW), true);
  for (const status of ['draft', 'paused', 'archived']) {
    assert.equal(isCampaignLive(campaign({ status }), NOW), false, status);
  }
});

test('schedule window is respected (starts_at inclusive, ends_at exclusive)', () => {
  assert.equal(isCampaignLive(campaign({ starts_at: '2026-09-21T00:00:00Z' }), NOW), false);
  assert.equal(isCampaignLive(campaign({ starts_at: '2026-09-20T12:00:00Z' }), NOW), true);
  assert.equal(isCampaignLive(campaign({ ends_at: '2026-09-20T12:00:00Z' }), NOW), false);
  assert.equal(isCampaignLive(campaign({ ends_at: '2026-09-20T12:00:01Z' }), NOW), true);
  assert.equal(
    isCampaignLive(campaign({ starts_at: '2026-09-01T00:00:00Z', ends_at: '2026-10-01T00:00:00Z' }), NOW),
    true,
  );
});

// ---------------------------------------------------------------------------
// targeting
// ---------------------------------------------------------------------------
test('null tool_ids targets every tool; exclusions always win', () => {
  assert.equal(campaignTargetsTool(campaign(), 'budget'), true);
  assert.equal(campaignTargetsTool(campaign({ tool_ids: ['budget'] }), 'budget'), true);
  assert.equal(campaignTargetsTool(campaign({ tool_ids: ['budget'] }), 'net-worth'), false);
  assert.equal(campaignTargetsTool(campaign({ tool_ids: [] }), 'budget'), false);
  assert.equal(campaignTargetsTool(campaign({ exclude_tool_ids: ['budget'] }), 'budget'), false);
  assert.equal(
    campaignTargetsTool(campaign({ tool_ids: ['budget'], exclude_tool_ids: ['budget'] }), 'budget'),
    false,
  );
});

test('filterCampaignsForTool combines liveness, targeting and tier', () => {
  const list = [
    campaign({ id: 'all' }),
    campaign({ id: 'budget-only', tool_ids: ['budget'] }),
    campaign({ id: 'paused', status: 'paused' }),
    campaign({ id: 'expired', ends_at: '2020-01-01T00:00:00Z' }),
    campaign({ id: 'pro-ok', hide_for_tiers: [] }),
  ];
  assert.deepEqual(
    filterCampaignsForTool(list, 'budget', { now: NOW }).map((c) => c.id),
    ['all', 'budget-only', 'pro-ok'],
  );
  assert.deepEqual(
    filterCampaignsForTool(list, 'net-worth', { now: NOW }).map((c) => c.id),
    ['all', 'pro-ok'],
  );
  assert.deepEqual(
    filterCampaignsForTool(list, 'budget', { now: NOW, tier: 'finance_pro' }).map((c) => c.id),
    ['pro-ok'],
  );
  assert.deepEqual(
    filterCampaignsForTool(list, 'budget', { now: NOW, tier: 'free' }).map((c) => c.id),
    ['all', 'budget-only', 'pro-ok'],
  );
});

// ---------------------------------------------------------------------------
// pickWeighted / orderForRotation
// ---------------------------------------------------------------------------
test('pickWeighted respects weights and a deterministic rng', () => {
  const items = [
    { id: 'a', w: 1 },
    { id: 'b', w: 3 },
  ];
  const w = (i) => i.w;
  assert.equal(pickWeighted(items, w, () => 0).id, 'a');
  assert.equal(pickWeighted(items, w, () => 0.24).id, 'a');
  assert.equal(pickWeighted(items, w, () => 0.25).id, 'b');
  assert.equal(pickWeighted(items, w, () => 0.999).id, 'b');
  assert.equal(pickWeighted([], w), null);
  assert.equal(pickWeighted([{ id: 'zero', w: 0 }], w), null);
  // Zero-weight items are never chosen.
  const mixed = [{ id: 'zero', w: 0 }, { id: 'one', w: 1 }];
  for (const r of [0, 0.5, 0.999]) assert.equal(pickWeighted(mixed, w, () => r).id, 'one');
});

test('pickWeighted approximates the weight distribution', () => {
  const items = [
    { id: 'a', w: 1 },
    { id: 'b', w: 9 },
  ];
  let b = 0;
  const n = 5000;
  let seed = 42;
  const rng = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  for (let i = 0; i < n; i++) if (pickWeighted(items, (x) => x.w, rng).id === 'b') b++;
  assert.ok(b / n > 0.85 && b / n < 0.95, `b share was ${b / n}`);
});

test('orderForRotation puts higher priority first and keeps every item once', () => {
  const items = [
    { id: 'low1', p: 0, w: 1 },
    { id: 'high', p: 10, w: 1 },
    { id: 'low2', p: 0, w: 5 },
  ];
  const ordered = orderForRotation(items, (i) => i.p, (i) => i.w, () => 0);
  assert.equal(ordered.length, 3);
  assert.equal(ordered[0].id, 'high');
  assert.deepEqual(new Set(ordered.map((i) => i.id)), new Set(['low1', 'high', 'low2']));
});

// ---------------------------------------------------------------------------
// highlight segments (replaces the old dangerouslySetInnerHTML regex)
// ---------------------------------------------------------------------------
test('splitHighlightSegments marks money amounts and percentages only', () => {
  assert.deepEqual(splitHighlightSegments('Get up to $325 back, 5% APY'), [
    { text: 'Get up to ', highlight: false },
    { text: '$325', highlight: true },
    { text: ' back, ', highlight: false },
    { text: '5%', highlight: true },
    { text: ' APY', highlight: false },
  ]);
  assert.deepEqual(splitHighlightSegments('No numbers here'), [{ text: 'No numbers here', highlight: false }]);
  assert.deepEqual(splitHighlightSegments(''), []);
  // HTML in copy is left as inert text (no innerHTML anywhere).
  assert.deepEqual(splitHighlightSegments('<b>$5</b>'), [
    { text: '<b>', highlight: false },
    { text: '$5', highlight: true },
    { text: '</b>', highlight: false },
  ]);
});

// ---------------------------------------------------------------------------
// validation
// ---------------------------------------------------------------------------
const UUID = '123e4567-e89b-12d3-a456-426614174000';

test('isUuid', () => {
  assert.equal(isUuid(UUID), true);
  assert.equal(isUuid('not-a-uuid'), false);
  assert.equal(isUuid(null), false);
});

test('creative copy limits are enforced per format', () => {
  const ok = validateCreative({ format: 'leaderboard', headline: 'x'.repeat(90), cta: 'Go' });
  assert.equal(ok.headline.length, 90);
  assert.equal(ok.body, null); // leaderboards carry no body
  assert.throws(
    () => validateCreative({ format: 'leaderboard', headline: 'x'.repeat(91), cta: 'Go' }),
    AdsValidationError,
  );
  assert.throws(
    () => validateCreative({ format: 'mobile_banner', headline: 'x'.repeat(41), cta: 'Go' }),
    AdsValidationError,
  );
  assert.throws(
    () => validateCreative({ format: 'medium_rectangle', headline: 'ok', body: 'x'.repeat(61), cta: 'Go' }),
    AdsValidationError,
  );
  assert.throws(
    () => validateCreative({ format: 'large_rectangle', headline: 'ok', cta: 'x'.repeat(31) }),
    AdsValidationError,
  );
  assert.throws(() => validateCreative({ format: 'billboard', headline: 'ok', cta: 'Go' }), AdsValidationError);
  assert.throws(() => validateCreative({ format: 'leaderboard', headline: '', cta: 'Go' }), AdsValidationError);
});

test('campaign fields are whitelisted and validated', () => {
  const out = pickCampaignFields({
    name: ' Test ',
    advertiser_id: UUID,
    placement_id: UUID,
    status: 'active',
    tool_ids: ['budget', 'budget', 'net-worth'],
    weight: 3,
    priority: '2',
    starts_at: '2026-09-01T00:00:00Z',
    ends_at: '2026-10-01T00:00:00Z',
    hide_for_tiers: ['finance_pro'],
    evil: 'ignored',
  });
  assert.equal(out.name, 'Test');
  assert.deepEqual(out.tool_ids, ['budget', 'net-worth']);
  assert.equal(out.priority, 2);
  assert.equal('evil' in out, false);

  assert.throws(() => pickCampaignFields({ name: 'x', advertiser_id: 'nope', placement_id: UUID }), AdsValidationError);
  assert.throws(
    () => pickCampaignFields({ name: 'x', advertiser_id: UUID, placement_id: UUID, tool_ids: ['not-a-tool'] }),
    AdsValidationError,
  );
  assert.throws(
    () => pickCampaignFields({ name: 'x', advertiser_id: UUID, placement_id: UUID, weight: 0 }),
    AdsValidationError,
  );
  assert.throws(
    () =>
      pickCampaignFields({
        name: 'x',
        advertiser_id: UUID,
        placement_id: UUID,
        starts_at: '2026-10-01T00:00:00Z',
        ends_at: '2026-09-01T00:00:00Z',
      }),
    AdsValidationError,
  );
  // PATCH semantics: partial bodies don't require the mandatory columns.
  assert.deepEqual(pickCampaignFields({ status: 'paused' }, { partial: true }), { status: 'paused' });
});

test('advertiser fields: slug derived from name, url must be http(s)', () => {
  const out = pickAdvertiserFields({ name: 'Rocket Money', url: 'https://rocketmoney.com', category: 'budgeting' });
  assert.equal(out.slug, 'rocket-money');
  assert.throws(
    () => pickAdvertiserFields({ name: 'X', url: 'javascript:alert(1)', category: 'budgeting' }),
    AdsValidationError,
  );
  assert.throws(() => pickAdvertiserFields({ name: 'X', url: 'https://x.com', category: 'nope' }), AdsValidationError);
});
