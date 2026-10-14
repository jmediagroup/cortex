import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rangeFill, rangePercent, RANGE_TRACK_REST } from '../lib/range-fill.ts';

test('rangePercent maps the value onto 0–100, including negative minimums', () => {
  assert.equal(rangePercent(0, 0, 4), 0);
  assert.equal(rangePercent(2, 0, 4), 50);
  assert.equal(rangePercent(4, 0, 4), 100);
  // Home appreciation runs from -2% to 10%: 4% sits halfway.
  assert.equal(rangePercent(4, -2, 10), 50);
});

test('rangePercent clamps out-of-range and nonsense input instead of overflowing the track', () => {
  assert.equal(rangePercent(-5, 0, 4), 0);
  assert.equal(rangePercent(9, 0, 4), 100);
  assert.equal(rangePercent(Number.NaN, 0, 4), 0);
  assert.equal(rangePercent(3, 5, 5), 0);
});

test('rangeFill paints the chosen colour up to the value and the neutral track after it', () => {
  const { background } = rangeFill(25, 0, 100, 'var(--orange)');
  assert.equal(
    background,
    `linear-gradient(to right, var(--orange) 0%, var(--orange) 25%, ${RANGE_TRACK_REST} 25%, ${RANGE_TRACK_REST} 100%)`,
  );
  assert.match(rangeFill(1, 0, 2).background, /var\(--navy\) 50%/);
});
