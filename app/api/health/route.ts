import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { isCircuitOpen, monthToDateSpendUsd } from '@/lib/ai/guard';
import { aiFeaturesDisabled, BUDGET_WARN_RATIO, monthlyBudgetUsd } from '@/lib/ai/policy';
import { captchaConfigProblem } from '@/lib/turnstile';

/**
 * GET /api/health — what an uptime monitor polls (docs/HARDENING.md).
 *
 *   200 { status: "ok" }        everything works
 *   200 { status: "degraded" }  site works; AI is off/failing/out of budget,
 *                               or the CAPTCHA setup can't produce tokens
 *                               (auth_captcha: "misconfigured" = nobody can
 *                               log in, sign up or reset a password)
 *   503 { status: "down" }      the database can't be reached
 *
 * Point the monitor's *availability* check at the HTTP status (so it pages
 * only for "down"), and optionally a second keyword check for `"ok"` to hear
 * about AI degradation too.
 *
 * Public, so it reveals states only — never spend amounts, keys, versions or
 * error text. Per-IP limited and never cached.
 */

export const dynamic = 'force-dynamic';

const DB_TIMEOUT_MS = 3000;

type Check = 'ok' | 'fail';

async function checkDatabase(): Promise<Check> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const query = createServiceClient().from('users').select('id').limit(1);
    const result = await Promise.race([
      query,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), DB_TIMEOUT_MS);
      }),
    ]);
    return result.error ? 'fail' : 'ok';
  } catch {
    return 'fail';
  } finally {
    clearTimeout(timer);
  }
}

async function checkAi(): Promise<{ ai: 'ok' | 'disabled' | 'unconfigured' | 'failing'; budget: 'ok' | 'warn' | 'exhausted' | 'unknown' }> {
  const budgetUsd = monthlyBudgetUsd();
  const [circuit, spent] = await Promise.all([
    isCircuitOpen('whats-your-why').catch(() => ({ open: false })),
    monthToDateSpendUsd(),
  ]);

  const budget =
    spent === null ? 'unknown' : spent >= budgetUsd ? 'exhausted' : spent >= budgetUsd * BUDGET_WARN_RATIO ? 'warn' : 'ok';

  const ai = aiFeaturesDisabled()
    ? 'disabled'
    : !process.env.ANTHROPIC_API_KEY
      ? 'unconfigured'
      : circuit.open
        ? 'failing'
        : 'ok';

  return { ai, budget };
}

async function report(request: NextRequest) {
  const limit = checkRateLimit(`health:${getClientIP(request.headers)}`, RATE_LIMITS.health);
  if (!limit.success) {
    return NextResponse.json({ status: 'rate_limited' }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
  }

  const [database, aiState] = await Promise.all([checkDatabase(), checkAi()]);
  const authCaptcha = captchaConfigProblem() ? 'misconfigured' : 'ok';

  const status =
    database === 'fail'
      ? 'down'
      : aiState.ai !== 'ok' || aiState.budget === 'exhausted' || authCaptcha !== 'ok'
        ? 'degraded'
        : 'ok';

  return NextResponse.json(
    {
      status,
      checks: { database, ai: aiState.ai, ai_budget: aiState.budget, auth_captcha: authCaptcha },
      time: new Date().toISOString(),
    },
    { status: status === 'down' ? 503 : 200, headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function GET(request: NextRequest) {
  return report(request);
}

export async function HEAD(request: NextRequest) {
  const res = await report(request);
  return new NextResponse(null, { status: res.status, headers: { 'Cache-Control': 'no-store' } });
}
