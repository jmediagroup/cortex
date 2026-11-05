import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { checkRateLimit, resetInMemoryRateLimits, retryAfterSeconds, RATE_LIMITS } from '../lib/rate-limit.ts';
import { checkBotSignals, botSignalMessage, HONEYPOT_FIELD } from '../lib/bot-check.ts';
import { rateLimitKeyHash, storedIdentifierHash, hasPrivacySalt } from '../lib/privacy-hash.ts';
import {
  aiFeaturesDisabled,
  budgetDecision,
  estimateCostUsd,
  isRetryableStatus,
  monthlyBudgetUsd,
  priceFor,
  retryDelayMs,
  roughTokenCount,
  worstCaseCostUsd,
  DEFAULT_MONTHLY_BUDGET_USD,
  UNKNOWN_MODEL_PRICE,
} from '../lib/ai/policy.ts';
import { loginFailureReason, friendlyLoginError } from '../lib/auth-errors.ts';
import { verifyCaptchaForSupabaseAuth } from '../lib/turnstile.ts';

function withEnv(env, fn) {
  const saved = {};
  for (const k of Object.keys(env)) saved[k] = process.env[k];
  try {
    for (const [k, v] of Object.entries(env)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

// ---------------------------------------------------------------------------
// In-memory limiter (also the fallback for the shared one)
// ---------------------------------------------------------------------------

test('rate limiter allows up to the limit, then blocks', () => {
  resetInMemoryRateLimits();
  const cfg = { limit: 3, windowSeconds: 60 };
  assert.equal(checkRateLimit('t:a', cfg).success, true);
  assert.equal(checkRateLimit('t:a', cfg).success, true);
  const third = checkRateLimit('t:a', cfg);
  assert.equal(third.success, true);
  assert.equal(third.remaining, 0);
  assert.equal(checkRateLimit('t:a', cfg).success, false);
  // Other keys are independent.
  assert.equal(checkRateLimit('t:b', cfg).success, true);
});

test('cost 0 peeks without counting (used by the AI circuit breaker)', () => {
  resetInMemoryRateLimits();
  const cfg = { limit: 2, windowSeconds: 60 };
  assert.equal(checkRateLimit('t:peek', cfg, 0).success, true, 'empty bucket has room');
  checkRateLimit('t:peek', cfg);
  assert.equal(checkRateLimit('t:peek', cfg, 0).success, true, 'one hit of two: still room');
  checkRateLimit('t:peek', cfg);
  assert.equal(checkRateLimit('t:peek', cfg, 0).success, false, 'full bucket = circuit open');
  // Peeking many times never fills the bucket by itself.
  resetInMemoryRateLimits();
  for (let i = 0; i < 10; i++) checkRateLimit('t:peek2', cfg, 0);
  assert.equal(checkRateLimit('t:peek2', cfg).success, true);
});

test('retryAfterSeconds is at least 1 and rounds up', () => {
  assert.equal(retryAfterSeconds(1000, 1000), 1);
  assert.equal(retryAfterSeconds(2500, 1000), 2);
  assert.equal(retryAfterSeconds(0, 1000), 1);
});

test('login limits stop a password-guessing run but not a few typos', () => {
  assert.ok(RATE_LIMITS.loginBurst.limit >= 3, 'a few typos must fit in the burst');
  assert.ok(RATE_LIMITS.loginEmail.limit <= 20, 'per-account limit must be tight');
  assert.ok(RATE_LIMITS.loginEmail.windowSeconds >= 600);
});

// ---------------------------------------------------------------------------
// Bot signals
// ---------------------------------------------------------------------------

test('honeypot content is a decoy-worthy bot signal', () => {
  const r = checkBotSignals({ honeypot: 'http://spam', formStartedAt: 0, minFillMs: 0, requireTiming: false });
  assert.deepEqual(r, { ok: false, reason: 'honeypot', decoy: true });
  assert.equal(HONEYPOT_FIELD, 'mgm_hp');
});

test('a whitespace-only honeypot is not a bot (some extensions insert spaces)', () => {
  const r = checkBotSignals({ honeypot: '   ', formStartedAt: undefined, minFillMs: 0, requireTiming: false });
  assert.equal(r.ok, true);
});

test('too-fast submits get a visible retry, not a decoy', () => {
  const now = 10_000;
  const r = checkBotSignals({ honeypot: '', formStartedAt: now - 300, minFillMs: 1200, requireTiming: true, now });
  assert.deepEqual(r, { ok: false, reason: 'too_fast', decoy: false });
  assert.match(botSignalMessage('too_fast'), /try again|submit again/i);
});

test('timing: slow enough passes, clock skew passes, missing depends on requireTiming', () => {
  const now = 10_000;
  assert.equal(checkBotSignals({ honeypot: '', formStartedAt: now - 5000, minFillMs: 1200, requireTiming: true, now }).ok, true);
  assert.equal(checkBotSignals({ honeypot: '', formStartedAt: now + 5000, minFillMs: 1200, requireTiming: true, now }).ok, true);
  assert.deepEqual(
    checkBotSignals({ honeypot: '', formStartedAt: 'x', minFillMs: 1200, requireTiming: true, now }),
    { ok: false, reason: 'missing_timing', decoy: false },
  );
  assert.equal(checkBotSignals({ honeypot: '', formStartedAt: undefined, minFillMs: 1200, requireTiming: false, now }).ok, true);
});

// ---------------------------------------------------------------------------
// Hashing (rule 8: no raw PII stored)
// ---------------------------------------------------------------------------

test('stored identifiers are only hashed when a salt is configured', () => {
  withEnv({ RATE_LIMIT_SALT: undefined, SIGNUP_IP_SALT: undefined }, () => {
    assert.equal(hasPrivacySalt(), false);
    assert.equal(storedIdentifierHash('1.2.3.4', 'ip'), null);
    // Rate-limit keys still hash (short-lived counters) so limits keep working.
    assert.match(rateLimitKeyHash('login:ip:1.2.3.4'), /^[0-9a-f]{64}$/);
  });
  withEnv({ RATE_LIMIT_SALT: 'pepper', SIGNUP_IP_SALT: undefined }, () => {
    const h = storedIdentifierHash('someone@example.com', 'email');
    assert.match(h, /^[0-9a-f]{64}$/);
    assert.ok(!h.includes('someone'));
    assert.notEqual(h, storedIdentifierHash('someone@example.com', 'ip'), 'purpose separates hashes');
    assert.equal(storedIdentifierHash('unknown', 'ip'), null);
    assert.notEqual(rateLimitKeyHash('a'), rateLimitKeyHash('b'));
  });
});

// ---------------------------------------------------------------------------
// AI spend policy
// ---------------------------------------------------------------------------

test('cost estimate uses published Sonnet 5 prices ($2 in / $10 out per MTok)', () => {
  assert.equal(estimateCostUsd('claude-sonnet-5', { input_tokens: 1_000_000 }), 2);
  assert.equal(estimateCostUsd('claude-sonnet-5', { output_tokens: 1_000_000 }), 10);
  // A typical reflection: ~4k in, ~1k out ≈ $0.018.
  const typical = estimateCostUsd('claude-sonnet-5', { input_tokens: 4000, output_tokens: 1000 });
  assert.ok(typical > 0.01 && typical < 0.03, `typical=${typical}`);
  // Junk usage never produces NaN or negatives.
  assert.equal(estimateCostUsd('claude-sonnet-5', { input_tokens: -5, output_tokens: NaN }), 0);
});

test('unknown models are priced at the top tier so the cap trips early, never late', () => {
  assert.deepEqual(priceFor('some-future-model'), UNKNOWN_MODEL_PRICE);
  assert.ok(
    worstCaseCostUsd('some-future-model', 1000, 1000) > worstCaseCostUsd('claude-sonnet-5', 1000, 1000),
  );
});

test('budget: allows, warns at 80%, refuses a call that would cross the cap', () => {
  assert.deepEqual(budgetDecision(0, 25, 0.05), { allowed: true, level: 'ok' });
  assert.deepEqual(budgetDecision(20, 25, 0.05), { allowed: true, level: 'warn' });
  assert.deepEqual(budgetDecision(24.98, 25, 0.05), { allowed: false, level: 'exhausted' });
  assert.deepEqual(budgetDecision(30, 25, 0), { allowed: false, level: 'exhausted' });
  assert.deepEqual(budgetDecision(0, 0, 0.01), { allowed: false, level: 'exhausted' }, 'budget 0 = AI off');
});

test('budget env parsing falls back to the default on junk', () => {
  assert.equal(monthlyBudgetUsd(undefined), DEFAULT_MONTHLY_BUDGET_USD);
  assert.equal(monthlyBudgetUsd(''), DEFAULT_MONTHLY_BUDGET_USD);
  assert.equal(monthlyBudgetUsd('abc'), DEFAULT_MONTHLY_BUDGET_USD);
  assert.equal(monthlyBudgetUsd('-4'), DEFAULT_MONTHLY_BUDGET_USD);
  assert.equal(monthlyBudgetUsd('100'), 100);
  assert.equal(monthlyBudgetUsd('0'), 0);
});

test('kill switch is off unless exactly "true"', () => {
  assert.equal(aiFeaturesDisabled(undefined), false);
  assert.equal(aiFeaturesDisabled('false'), false);
  assert.equal(aiFeaturesDisabled('TRUE'), false);
  assert.equal(aiFeaturesDisabled('true'), true);
});

test('only provider-side failures are retried / count toward the circuit', () => {
  for (const s of [408, 409, 429, 500, 502, 503, 529]) assert.equal(isRetryableStatus(s), true, String(s));
  for (const s of [200, 400, 401, 403, 404, 413, 422]) assert.equal(isRetryableStatus(s), false, String(s));
});

test('retry delay honours short retry-after and the time budget', () => {
  assert.equal(retryDelayMs(null, 0, 15_000), 1500);
  assert.equal(retryDelayMs('2', 0, 15_000), 2000);
  assert.equal(retryDelayMs('30', 0, 15_000), null, 'long waits are not worth it');
  assert.equal(retryDelayMs(null, 14_000, 15_000), null, 'no time left');
});

test('roughTokenCount is ~4 chars per token', () => {
  assert.equal(roughTokenCount(''), 0);
  assert.equal(roughTokenCount('abcd'), 1);
  assert.equal(roughTokenCount('abcde'), 2);
});

// ---------------------------------------------------------------------------
// Login reasons + CAPTCHA mode
// ---------------------------------------------------------------------------

test('failed logins map to short reason codes, never raw messages', () => {
  assert.equal(loginFailureReason({ code: 'invalid_credentials' }), 'invalid_credentials');
  assert.equal(loginFailureReason({ message: 'Invalid login credentials' }), 'invalid_credentials');
  assert.equal(loginFailureReason({ message: 'Email not confirmed' }), 'email_not_confirmed');
  assert.equal(loginFailureReason({ code: 'captcha_failed' }), 'captcha_failed');
  assert.equal(loginFailureReason({ code: 'over_request_rate_limit' }), 'rate_limited_upstream');
  assert.equal(loginFailureReason({ message: 'Database exploded at row 7' }), 'other');
  assert.equal(loginFailureReason({ name: 'AuthRetryableFetchError', message: 'fetch failed', status: 0 }), 'auth_unavailable');
  assert.equal(loginFailureReason({ message: 'Internal', status: 502 }), 'auth_unavailable');
  assert.doesNotMatch(friendlyLoginError({ message: 'Database exploded at row 7' }), /Database|row 7/);
});

test('a Turnstile token is passed to Supabase OR verified by us, never both', async () => {
  // Supabase verifies: we skip siteverify and hand the token over.
  await withEnv({ SUPABASE_CAPTCHA_ENABLED: 'true', TURNSTILE_SECRET_KEY: 'secret' }, async () => {
    const r = await verifyCaptchaForSupabaseAuth('tok', '1.2.3.4');
    assert.equal(r.success, true);
    assert.equal(r.tokenForSupabase, 'tok');
  });
  // Nobody configured: inert, and nothing is passed through.
  await withEnv({ SUPABASE_CAPTCHA_ENABLED: undefined, TURNSTILE_SECRET_KEY: undefined }, async () => {
    const r = await verifyCaptchaForSupabaseAuth('tok', '1.2.3.4');
    assert.equal(r.success, true);
    assert.equal(r.tokenForSupabase, undefined);
  });
  // We verify: a missing token fails closed without a network call.
  await withEnv({ SUPABASE_CAPTCHA_ENABLED: undefined, TURNSTILE_SECRET_KEY: 'secret' }, async () => {
    const r = await verifyCaptchaForSupabaseAuth(null, '1.2.3.4');
    assert.equal(r.success, false);
    assert.equal(r.tokenForSupabase, undefined);
  });
});

// ---------------------------------------------------------------------------
// Static guards
// ---------------------------------------------------------------------------

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

test('user-facing API routes never send raw error messages to the browser', () => {
  // Admin routes are only reachable by the site owner, where the detail helps.
  const routes = walk('app/api').filter((p) => !p.includes(`${join('app', 'api', 'admin')}`));
  const leaks = [];
  const patterns = [
    /NextResponse\.json\(\s*\{\s*error:\s*(error|err|e)\.message/,
    /errorResponse\(\s*(error|err|e)\.message/,
    /error:\s*String\((error|err|e)\)/,
    /\.stack\b/,
  ];
  for (const file of routes) {
    const src = readFileSync(file, 'utf8');
    for (const re of patterns) if (re.test(src)) leaks.push(`${file}: ${re}`);
  }
  assert.deepEqual(leaks, []);
});

test('every AI route goes through the shared rate limiter', () => {
  for (const file of ['app/api/why/route.ts', 'app/api/ai/insights/route.ts']) {
    const src = readFileSync(file, 'utf8');
    assert.ok(/aiPreflight\(|checkSharedRateLimit\(/.test(src), `${file} is not rate-limited`);
  }
});

test('the new security tables ship with RLS on and anon/authenticated revoked', () => {
  const sql = readFileSync('supabase/migrations/20261105120000_security_hardening.sql', 'utf8');
  for (const table of ['rate_limit_buckets', 'auth_events', 'ai_usage']) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`));
    assert.match(sql, new RegExp(`revoke all on table public\\.${table} from anon, authenticated`));
  }
  for (const fn of ['rate_limit_hit', 'ai_spend_month_to_date', 'prune_security_tables']) {
    assert.match(sql, new RegExp(`revoke execute on function public\\.${fn}\\(`));
  }
  // No raw PII columns.
  assert.doesNotMatch(sql, /\b(email|ip_address|ip)\s+(text|inet)\b/);
});
