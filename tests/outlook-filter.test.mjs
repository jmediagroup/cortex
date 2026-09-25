import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countOutlooks, matchesOutlookFilter, parseOutlookFilter } from '../lib/outlook/filter.ts';

test('?type= accepts daily and weekly, anything else shows everything', () => {
  assert.equal(parseOutlookFilter('daily'), 'daily');
  assert.equal(parseOutlookFilter('weekly'), 'weekly');
  assert.equal(parseOutlookFilter('all'), 'all');
  for (const raw of [null, undefined, '', 'Daily', 'monthly', 'daily ', 'constructor', '__proto__']) {
    assert.equal(parseOutlookFilter(raw), 'all', `expected ${JSON.stringify(raw)} to show everything`);
  }
});

test('a filter keeps only its own cadence; "all" keeps both', () => {
  assert.equal(matchesOutlookFilter('daily', 'all'), true);
  assert.equal(matchesOutlookFilter('weekly', 'all'), true);
  assert.equal(matchesOutlookFilter('daily', 'daily'), true);
  assert.equal(matchesOutlookFilter('weekly', 'daily'), false);
  assert.equal(matchesOutlookFilter('weekly', 'weekly'), true);
  assert.equal(matchesOutlookFilter('daily', 'weekly'), false);
});

test('counts are computed over the full list, regardless of the active filter', () => {
  const items = [{ type: 'daily' }, { type: 'weekly' }, { type: 'daily' }, { type: 'daily' }];
  assert.deepEqual(countOutlooks(items), { all: 4, daily: 3, weekly: 1 });
  assert.deepEqual(countOutlooks([]), { all: 0, daily: 0, weekly: 0 });
});
