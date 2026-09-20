import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  friendlySignupError,
  friendlyLoginError,
  friendlyResetError,
  callbackNotice,
} from '../lib/auth-errors.ts';

test('signup: duplicate account is explained with next steps', () => {
  const msg = friendlySignupError({ code: 'user_already_exists', message: 'User already registered' });
  assert.match(msg, /already exists/i);
  assert.match(msg, /log in/i);
});

test('signup: raw Supabase internals never reach the user', () => {
  const msg = friendlySignupError({ message: 'Database error saving new user' });
  assert.doesNotMatch(msg, /database/i);
  assert.ok(msg.length > 10);
});

test('signup: email send rate limit gets a wait-a-minute message', () => {
  assert.match(
    friendlySignupError({ code: 'over_email_send_rate_limit', message: 'Email rate limit exceeded' }),
    /wait/i,
  );
});

test('login: bad credentials mention resetting the password', () => {
  assert.match(
    friendlyLoginError({ code: 'invalid_credentials', message: 'Invalid login credentials' }),
    /reset/i,
  );
});

test('login: unverified email points at the resend action', () => {
  assert.match(
    friendlyLoginError({ code: 'email_not_confirmed', message: 'Email not confirmed' }),
    /verified/i,
  );
});

test('reset: expired session explains how to get a new link', () => {
  assert.match(friendlyResetError({ code: 'session_expired', message: 'x' }), /new one/i);
});

test('callback notices: known codes map to copy, unknown to null', () => {
  assert.equal(callbackNotice('link_expired')?.tone, 'error');
  assert.equal(callbackNotice('verified_login_required')?.tone, 'success');
  assert.equal(callbackNotice('nope'), null);
  assert.equal(callbackNotice(null), null);
});

test('all mappers survive null/undefined input', () => {
  assert.ok(friendlySignupError(null).length > 0);
  assert.ok(friendlyLoginError(undefined).length > 0);
  assert.ok(friendlyResetError({}).length > 0);
});
