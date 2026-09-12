import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickBestSubscription, isPaidStatus } from '../lib/stripe/select-subscription.ts';

const sub = (id, status, created) => ({ id, status, created });

test('returns null for an empty list', () => {
  assert.equal(pickBestSubscription([]), null);
});

test('a live subscription beats a canceled one regardless of order', () => {
  const canceled = sub('old', 'canceled', 200);
  const active = sub('new', 'active', 100);
  assert.equal(pickBestSubscription([canceled, active]).id, 'new');
  assert.equal(pickBestSubscription([active, canceled]).id, 'new');
});

test('an old stale active event cannot outrank a newer active subscription', () => {
  const older = sub('a', 'active', 100);
  const newer = sub('b', 'active', 200);
  assert.equal(pickBestSubscription([older, newer]).id, 'b');
});

test('past_due keeps the paid tier (dunning) but ranks below active', () => {
  assert.equal(isPaidStatus('past_due'), true);
  const pastDue = sub('p', 'past_due', 300);
  const active = sub('a', 'active', 100);
  assert.equal(pickBestSubscription([pastDue, active]).id, 'a');
});

test('among only terminal subscriptions the most recent wins, and it is not paid', () => {
  const c1 = sub('c1', 'canceled', 100);
  const c2 = sub('c2', 'canceled', 300);
  const exp = sub('e', 'incomplete_expired', 400);
  const best = pickBestSubscription([exp, c1, c2]);
  assert.equal(best.id, 'c2');
  assert.equal(isPaidStatus(best.status), false);
});

test('incomplete (checkout not finished) is never treated as paid', () => {
  assert.equal(isPaidStatus('incomplete'), false);
  assert.equal(isPaidStatus('unpaid'), false);
  assert.equal(isPaidStatus('paused'), false);
  assert.equal(isPaidStatus(null), false);
});
