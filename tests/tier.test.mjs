import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPriceTierMap, resolveTier } from '../lib/stripe/select-subscription.ts';

const map = buildPriceTierMap([
  ['price_monthly', 'finance_pro'],
  ['price_annual', 'finance_pro'],
  [undefined, 'finance_pro'], // an unset legacy env var
  [null, 'finance_pro'],
  ['', 'finance_pro'],
]);

const subWith = (priceId, status) => ({
  status,
  items: { data: [{ price: { id: priceId } }] },
});

test('unset price ids do not leak an "undefined" or empty key into the map', () => {
  assert.deepEqual(Object.keys(map).sort(), ['price_annual', 'price_monthly']);
});

test('a paid-status subscription on a known price maps to finance_pro', () => {
  assert.equal(resolveTier(subWith('price_monthly', 'active'), map, 'free'), 'finance_pro');
  assert.equal(resolveTier(subWith('price_annual', 'trialing'), map, 'free'), 'finance_pro');
  assert.equal(resolveTier(subWith('price_annual', 'past_due'), map, 'free'), 'finance_pro');
});

test('a canceled or unknown-price subscription maps to free', () => {
  assert.equal(resolveTier(subWith('price_monthly', 'canceled'), map, 'free'), 'free');
  assert.equal(resolveTier(subWith('price_someone_elses', 'active'), map, 'free'), 'free');
  assert.equal(resolveTier({ status: 'active', items: { data: [] } }, map, 'free'), 'free');
});
