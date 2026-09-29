import { test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';

// lib/offers/*.ts import siblings without an extension; retry with `.ts`.
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
  offersEnabled,
  offerBlockers,
  servableOffers,
  offersForViewer,
  sessionShort,
  buildSubId,
  buildOutboundUrl,
} = await import('../lib/offers/eligibility.ts');
const { pickCampaignFields, pickAdvertiserFields, AdsValidationError } = await import('../lib/ads/validation.ts');

const NOW = new Date('2026-10-01T12:00:00Z');

const advertiser = (over = {}) => ({
  id: 'adv-1',
  name: 'Example Brokerage',
  is_active: true,
  program_status: 'approved',
  disclosure_text: null,
  ...over,
});
const campaign = (over = {}) => ({
  id: 'camp-1',
  slug: 'example-pilot',
  status: 'active',
  starts_at: null,
  ends_at: null,
  tracking_url: 'https://example.sjv.io/c/1/2/3?subId1={sub_id}',
  sub_id_template: '{tool_id}-{session_short}',
  tool_ids: ['coast-fire', 'index-fund-visualizer'],
  exclude_tool_ids: [],
  hide_for_tiers: ['finance_pro'],
  weight: 1,
  priority: 0,
  ...over,
});
const creative = (over = {}) => ({
  id: 'cr-1',
  format: 'offer_card',
  headline: 'Ready to act on this result?',
  body: 'Open an account with Example Brokerage.',
  cta: 'Learn more',
  weight: 1,
  is_active: true,
  ...over,
});
const live = (over = {}) => ({
  enabled: true,
  placementSlug: 'tool-post-result',
  advertiser: advertiser(),
  campaign: campaign(),
  creative: creative(),
  ...over,
});

test('the kill switch is off unless the flag is exactly "true"', () => {
  assert.equal(offersEnabled(undefined), false);
  for (const v of ['', 'false', '1', 'TRUE', 'yes']) assert.equal(offersEnabled(v), false, v);
  assert.equal(offersEnabled('true'), true);
});

test('an approved, active, fully filled-in offer has no blockers', () => {
  assert.deepEqual(offerBlockers(live(), NOW), []);
});

test('every unsafe state blocks the offer', () => {
  const cases = {
    'flag off': live({ enabled: false }),
    'draft program': live({ advertiser: advertiser({ program_status: 'draft' }) }),
    'applied program': live({ advertiser: advertiser({ program_status: 'applied' }) }),
    'paused program': live({ advertiser: advertiser({ program_status: 'paused' }) }),
    'advertiser off': live({ advertiser: advertiser({ is_active: false }) }),
    'draft campaign': live({ campaign: campaign({ status: 'draft' }) }),
    expired: live({ campaign: campaign({ ends_at: '2026-09-30T00:00:00Z' }) }),
    'not started': live({ campaign: campaign({ starts_at: '2026-10-02T00:00:00Z' }) }),
    'placeholder link': live({ campaign: campaign({ tracking_url: '<<PASTE_AFFILIATE_URL>>' }) }),
    'no link': live({ campaign: campaign({ tracking_url: null }) }),
    'non-http link': live({ campaign: campaign({ tracking_url: 'javascript:alert(1)' }) }),
    'placeholder copy': live({ creative: creative({ body: '<<PASTE_APPROVED_OFFER_COPY>>' }) }),
    'placeholder advertiser name': live({ advertiser: advertiser({ name: '<<PASTE_NAME>>' }) }),
    'banner creative': live({ creative: creative({ format: 'leaderboard' }) }),
    'inactive creative': live({ creative: creative({ is_active: false }) }),
    'no creative': live({ creative: null }),
    'banner placement': live({ placementSlug: 'tool-inline-top' }),
    'no advertiser': live({ advertiser: null }),
  };
  for (const [name, input] of Object.entries(cases)) {
    assert.ok(offerBlockers(input, NOW).length > 0, `${name} should be blocked`);
  }
});

test('the seeded placeholder campaigns can never be served', () => {
  const seeded = {
    placementSlug: 'tool-post-result',
    advertiser: advertiser({ name: 'Brokerage / robo-advisor (placeholder)', program_status: 'draft' }),
    campaign: campaign({ status: 'draft', tracking_url: '<<PASTE_AFFILIATE_URL>>' }),
    creatives: [creative({ body: '<<PASTE_APPROVED_OFFER_COPY>>' })],
  };
  assert.deepEqual(servableOffers([seeded], 'coast-fire', { enabled: true, now: NOW }), []);
  // Even if someone flips only some of the switches.
  const halfDone = { ...seeded, advertiser: advertiser(), campaign: campaign() };
  assert.deepEqual(servableOffers([halfDone], 'coast-fire', { enabled: true, now: NOW }), []);
});

test('servable offers respect targeting and never expose the affiliate link', () => {
  const row = { placementSlug: 'tool-post-result', advertiser: advertiser(), campaign: campaign(), creatives: [creative()] };
  const [offer] = servableOffers([row], 'coast-fire', { enabled: true, now: NOW });
  assert.equal(offer.ref, 'example-pilot');
  assert.equal(JSON.stringify(offer).includes('sjv.io'), false);
  assert.deepEqual(servableOffers([row], 'rent-vs-buy', { enabled: true, now: NOW }), []);
  assert.deepEqual(servableOffers([row], 'coast-fire', { enabled: false, now: NOW }), []);
  assert.deepEqual(servableOffers([row], 'not-a-tool', { enabled: true, now: NOW }), []);
  const excluded = { ...row, campaign: campaign({ tool_ids: null, exclude_tool_ids: ['coast-fire'] }) };
  assert.deepEqual(servableOffers([excluded], 'coast-fire', { enabled: true, now: NOW }), []);
  // A campaign without a slug is addressed by id.
  const noSlug = { ...row, campaign: campaign({ slug: null }) };
  assert.equal(servableOffers([noSlug], 'coast-fire', { enabled: true, now: NOW })[0].ref, 'camp-1');
});

test('paid tiers are hidden by default and only the top priority competes', () => {
  const base = { placementSlug: 'tool-post-result', advertiser: advertiser(), creatives: [creative()] };
  const offers = servableOffers(
    [
      { ...base, campaign: campaign({ id: 'a', slug: 'a', priority: 5 }) },
      { ...base, campaign: campaign({ id: 'b', slug: 'b', priority: 1 }) },
    ],
    'coast-fire',
    { enabled: true, now: NOW },
  );
  assert.deepEqual(offersForViewer(offers, null).map((o) => o.ref), ['a']);
  assert.deepEqual(offersForViewer(offers, 'free').map((o) => o.ref), ['a']);
  assert.deepEqual(offersForViewer(offers, 'finance_pro'), []);
});

test('the sub-id carries only the tool and a short, stable session hash', () => {
  const short = sessionShort('1727600000000-abc123xyz');
  assert.match(short, /^[0-9a-f]{8}$/);
  assert.equal(short, sessionShort('1727600000000-abc123xyz'));
  assert.notEqual(short, sessionShort('another-session'));
  assert.equal(buildSubId('{tool_id}-{session_short}', { toolId: 'coast-fire', sessionShort: short }), `coast-fire-${short}`);
  assert.equal(buildSubId(null, { toolId: 'rent-vs-buy', sessionShort: 'abcd1234' }), 'rent-vs-buy-abcd1234');
  assert.equal(buildSubId('mgm {tool_id}/x', { toolId: 'budget', sessionShort: 'a' }), 'mgmbudgetx');
});

test('the sub-id goes where the link asks for it, and nowhere else', () => {
  assert.equal(
    buildOutboundUrl('https://example.sjv.io/c/1?subId1={sub_id}', 'coast-fire-abcd1234'),
    'https://example.sjv.io/c/1?subId1=coast-fire-abcd1234',
  );
  assert.equal(
    buildOutboundUrl('https://example.com/r?sid=%7Bsub_id%7D', 'a b'),
    'https://example.com/r?sid=a%20b',
  );
  assert.equal(buildOutboundUrl('https://example.com/r?x=1', 'ignored'), 'https://example.com/r?x=1');
});

test('admin validation accepts placeholders but not unsafe links or templates', () => {
  assert.equal(pickCampaignFields({ tracking_url: '<<PASTE_AFFILIATE_URL>>' }, { partial: true }).tracking_url, '<<PASTE_AFFILIATE_URL>>');
  assert.equal(pickCampaignFields({ tracking_url: 'https://x.io/?s={sub_id}' }, { partial: true }).tracking_url, 'https://x.io/?s={sub_id}');
  assert.throws(() => pickCampaignFields({ tracking_url: 'javascript:alert(1)' }, { partial: true }), AdsValidationError);
  assert.equal(pickCampaignFields({ sub_id_template: 'mgm-{tool_id}-{session_short}' }, { partial: true }).sub_id_template, 'mgm-{tool_id}-{session_short}');
  assert.throws(() => pickCampaignFields({ sub_id_template: '{email}' }, { partial: true }), AdsValidationError);
  assert.equal(pickAdvertiserFields({ program_status: 'approved' }, { partial: true }).program_status, 'approved');
  assert.throws(() => pickAdvertiserFields({ program_status: 'live' }, { partial: true }), AdsValidationError);
  assert.throws(() => pickAdvertiserFields({ network: 'cj' }, { partial: true }), AdsValidationError);
  assert.equal(pickAdvertiserFields({ url: '<<PASTE_ADVERTISER_URL>>' }, { partial: true }).url, '<<PASTE_ADVERTISER_URL>>');
});

test('the offer card is gated by the kill switch and only appears after a result', async () => {
  const { readFile } = await import('node:fs/promises');
  const src = await readFile(new URL('../components/offers/ResultOffer.tsx', import.meta.url), 'utf8');
  // Off: the component renders nothing and fetches nothing.
  assert.match(src, /export default function ResultOffer\(props: Props\) \{\s*return offersEnabled\(\) \? <LiveResultOffer/);
  // It is revealed only once the funnel reports a result.
  assert.match(src, /if \(!resultShown \|\| !offer \|\| revealed/);
  assert.match(src, /if \(!revealed\) return <div ref=\{anchor\} aria-hidden="true" \/>;/);
  // Every link out is sponsored and goes through /go, with the disclosure beside it.
  assert.match(src, /rel="sponsored noopener noreferrer"/);
  assert.match(src, /href=\{href\}/);
  assert.match(src, /`\/go\/\$\{encodeURIComponent\(offer\.ref\)\}/);
  assert.match(src, /DEFAULT_OFFER_DISCLOSURE/);
  assert.match(src, /href="\/disclosure"/);
  // The tool island renders it inside the funnel wrapper that knows about results.
  const island = await readFile(new URL('../components/app/ToolIsland.tsx', import.meta.url), 'utf8');
  assert.match(island, /<ToolFunnel[\s\S]*<ResultOffer[\s\S]*<\/ToolFunnel>/);
});

test('the disclosure wording says what the rules guarantee', async () => {
  const { DEFAULT_OFFER_DISCLOSURE } = await import('../lib/offers/eligibility.ts');
  assert.match(DEFAULT_OFFER_DISCLOSURE, /commission/);
  assert.match(DEFAULT_OFFER_DISCLOSURE, /doesn't change what you pay/);
  assert.match(DEFAULT_OFFER_DISCLOSURE, /not financial advice/);
});
