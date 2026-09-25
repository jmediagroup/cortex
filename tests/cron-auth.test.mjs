import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAuthorizedCronRequest } from '../lib/cron-auth.ts';

const req = (authorization) =>
  new Request('https://moneyguymutants.com/api/cron/delete-old-events', {
    headers: authorization ? { authorization } : {},
  });

function withEnv(env, fn) {
  const saved = { CRON_SECRET: process.env.CRON_SECRET, NODE_ENV: process.env.NODE_ENV };
  const originalError = console.error;
  console.error = () => {};
  try {
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    return fn();
  } finally {
    console.error = originalError;
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

test('with CRON_SECRET set, only the matching bearer token is accepted', () => {
  withEnv({ CRON_SECRET: 's3cret', NODE_ENV: 'production' }, () => {
    assert.equal(isAuthorizedCronRequest(req('Bearer s3cret'), 'test'), true);
    assert.equal(isAuthorizedCronRequest(req('Bearer wrong'), 'test'), false);
    assert.equal(isAuthorizedCronRequest(req('s3cret'), 'test'), false);
    assert.equal(isAuthorizedCronRequest(req(undefined), 'test'), false);
  });
});

test('without CRON_SECRET, production refuses every request', () => {
  withEnv({ CRON_SECRET: undefined, NODE_ENV: 'production' }, () => {
    assert.equal(isAuthorizedCronRequest(req('Bearer anything'), 'test'), false);
    assert.equal(isAuthorizedCronRequest(req(undefined), 'test'), false);
  });
});

test('without CRON_SECRET, local development is allowed', () => {
  withEnv({ CRON_SECRET: undefined, NODE_ENV: 'development' }, () => {
    assert.equal(isAuthorizedCronRequest(req(undefined), 'test'), true);
  });
});
