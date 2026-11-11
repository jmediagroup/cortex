import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { checkBotSignals, isAutofillEcho } from '../lib/bot-check.ts';
import {
  captchaConfigProblem,
  captchaMisconfigHint,
  upstreamCaptchaMisconfig,
} from '../lib/turnstile.ts';

// --- Honeypot vs. autofill (Nov 2026: real people were blocked as bots) -----

test('honeypot holding the person’s own email/password is autofill, not a bot', () => {
  for (const echo of ['drew@example.com', ' DREW@example.com ', 'hunter2-correct']) {
    const r = checkBotSignals({
      honeypot: echo,
      formStartedAt: undefined,
      minFillMs: 0,
      requireTiming: false,
      ownValues: ['drew@example.com', 'hunter2-correct'],
    });
    assert.deepEqual(r, { ok: true }, `echo ${JSON.stringify(echo)} should pass`);
  }
});

test('honeypot with anything else is still a bot', () => {
  const r = checkBotSignals({
    honeypot: 'http://spam.example',
    formStartedAt: undefined,
    minFillMs: 0,
    requireTiming: false,
    ownValues: ['drew@example.com', 'pw'],
  });
  assert.equal(r.ok, false);
  assert.equal(r.ok === false && r.reason, 'honeypot');
});

test('isAutofillEcho ignores empty and non-string own values', () => {
  assert.equal(isAutofillEcho('x', [undefined, null, 3, '']), false);
  assert.equal(isAutofillEcho('', ['']), false);
  assert.equal(isAutofillEcho('Ann', ['ann']), true);
});

test('every honeypot input opts out of password managers', () => {
  for (const p of ['app/login/page.tsx', 'app/signup/page.tsx', 'app/enterprise/page.tsx']) {
    const src = readFileSync(p, 'utf8');
    for (const attr of ['data-1p-ignore', 'data-lpignore', 'data-bwignore']) {
      assert.ok(src.includes(attr), `${p} honeypot is missing ${attr}`);
    }
  }
});

// --- CAPTCHA configuration that can never work ------------------------------

test('captchaConfigProblem: token required but no site key', () => {
  assert.equal(captchaConfigProblem({ SUPABASE_CAPTCHA_ENABLED: 'true' }), 'site_key_missing');
  assert.equal(captchaConfigProblem({ TURNSTILE_SECRET_KEY: 's' }), 'site_key_missing');
});

test('captchaConfigProblem: consistent setups are fine', () => {
  assert.equal(captchaConfigProblem({}), null);
  assert.equal(
    captchaConfigProblem({ SUPABASE_CAPTCHA_ENABLED: 'true', NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'k' }),
    null,
  );
  assert.equal(captchaConfigProblem({ TURNSTILE_SECRET_KEY: 's', NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'k' }), null);
});

test('upstreamCaptchaMisconfig: no token ever reached Supabase', () => {
  // Widget never rendered (site key missing from the build): client sent null.
  assert.equal(upstreamCaptchaMisconfig({ success: true, skipped: true }, null), 'no_token');
  // Supabase mode, but the client still had nothing to send.
  assert.equal(
    upstreamCaptchaMisconfig({ success: true, skipped: true, tokenForSupabase: undefined }, ''),
    'no_token',
  );
});

test('upstreamCaptchaMisconfig: we spent the single-use token ourselves', () => {
  assert.equal(upstreamCaptchaMisconfig({ success: true }, 'tok'), 'token_spent');
});

test('upstreamCaptchaMisconfig: token reached Supabase → the visitor’s to retry', () => {
  assert.equal(upstreamCaptchaMisconfig({ success: true, skipped: true, tokenForSupabase: 'tok' }, 'tok'), null);
});

test('misconfig hints name env vars only and say to redeploy', () => {
  for (const kind of ['no_token', 'token_spent']) {
    const hint = captchaMisconfigHint(kind);
    assert.match(hint, /redeploy/i);
    assert.doesNotMatch(hint, /0x4/);
  }
});

test('login and signup routes turn a config-caused CAPTCHA failure into "temporarily unavailable"', () => {
  for (const p of ['app/api/auth/login/route.ts', 'app/api/auth/signup/route.ts']) {
    const src = readFileSync(p, 'utf8');
    assert.ok(src.includes('upstreamCaptchaMisconfig('), `${p} must detect CAPTCHA misconfiguration`);
    assert.ok(src.includes('sendOpsAlert('), `${p} must alert on CAPTCHA misconfiguration`);
    assert.match(src, /ownValues:/, `${p} must let autofill through the honeypot`);
  }
});

test('nothing calls the locked-down get_user_event_summary RPC from the browser', () => {
  const src = readFileSync('lib/analytics.ts', 'utf8');
  assert.doesNotMatch(src, /rpc[^\n]*get_user_event_summary/);
});
