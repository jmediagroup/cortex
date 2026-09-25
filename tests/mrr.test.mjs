import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeMrr } from '../lib/stripe/mrr.ts';

const sub = (status, unit_amount, interval) => ({
  status,
  items: { data: [{ price: { unit_amount, recurring: interval ? { interval } : null } }] },
});

test('monthly prices count in full, yearly prices are spread over 12 months', () => {
  assert.equal(computeMrr([sub('active', 1999, 'month')]), 19.99);
  assert.equal(computeMrr([sub('active', 19900, 'year')]), 16.58);
  assert.equal(computeMrr([sub('active', 1999, 'month'), sub('active', 19900, 'year')]), 36.57);
});

test('only active subscriptions count', () => {
  for (const status of ['trialing', 'past_due', 'canceled', 'incomplete', 'unpaid']) {
    assert.equal(computeMrr([sub(status, 1999, 'month')]), 0, status);
  }
});

test('missing subscriptions, one-off prices and empty lists count as nothing', () => {
  assert.equal(computeMrr([]), 0);
  assert.equal(computeMrr([null, null]), 0);
  assert.equal(computeMrr([sub('active', 1999, null)]), 0);
  assert.equal(computeMrr([sub('active', null, 'month')]), 0);
  assert.equal(computeMrr([{ status: 'active', items: { data: [] } }]), 0);
});
