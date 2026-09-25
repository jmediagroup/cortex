import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_TYPES, CREATABLE_CONTENT_TYPES } from '../lib/cms/content-types.ts';

test('the "New" picker only offers types the public site reads from the CMS', () => {
  assert.deepEqual(
    CREATABLE_CONTENT_TYPES.map((t) => t.key),
    CONTENT_TYPES.filter((t) => t.publicReadsFromDb).map((t) => t.key),
  );
  assert.ok(CREATABLE_CONTENT_TYPES.every((t) => t.publicReadsFromDb));
});

test('today that is articles only; guides and outlooks still publish from Markdown', () => {
  assert.deepEqual(CREATABLE_CONTENT_TYPES.map((t) => t.key), ['article']);
  for (const key of ['guide', 'daily', 'weekly']) {
    assert.equal(CONTENT_TYPES.find((t) => t.key === key)?.publicReadsFromDb, false, key);
  }
});
