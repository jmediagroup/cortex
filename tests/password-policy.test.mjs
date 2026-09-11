import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkPassword, MIN_PASSWORD_LENGTH } from '../lib/password-policy.ts';

test('rejects passwords shorter than the minimum', () => {
  const short = 'a1'.repeat(Math.floor((MIN_PASSWORD_LENGTH - 1) / 2));
  assert.equal(checkPassword(short).ok, false);
  assert.equal(checkPassword('').ok, false);
});

test('rejects all-digit and all-letter passwords', () => {
  assert.equal(checkPassword('1234567890123').ok, false);
  assert.equal(checkPassword('abcdefghijkl').ok, false);
  assert.equal(checkPassword('ABCDEFGHIJKL').ok, false);
});

test('accepts a mixed password of sufficient length', () => {
  assert.equal(checkPassword('correct-horse-42').ok, true);
  assert.equal(checkPassword('Tr0ub4dor&3xx').ok, true);
});

test('never throws on a non-string', () => {
  assert.equal(checkPassword(undefined).ok, false);
  assert.equal(checkPassword(12345).ok, false);
});
