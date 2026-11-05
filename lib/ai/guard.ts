import { createServiceClient } from '@/lib/supabase/client';
import { checkSharedRateLimit } from '@/lib/rate-limit-shared';
import { retryAfterSeconds, type RateLimitConfig } from '@/lib/rate-limit';
import { sendOpsAlert } from '@/lib/ops-alert';
import {
  aiFeaturesDisabled,
  BUDGET_WARN_RATIO,
  budgetDecision,
  CIRCUIT_FAILURE_THRESHOLD,
  CIRCUIT_WINDOW_SECONDS,
  estimateCostUsd,
  isRetryableStatus,
  monthKey,
  monthlyBudgetUsd,
  worstCaseCostUsd,
  type TokenUsage,
} from '@/lib/ai/policy';

/**
 * Everything that stands between a request and a paid Anthropic call:
 *
 *   1. Kill switch           AI_FEATURES_DISABLED=true → off, instantly
 *   2. Circuit breaker       provider failing → stop calling it for ≤2 min
 *   3. Rate limits           per user / per IP, shared across instances
 *   4. Monthly budget        refuse calls that could exceed AI_MONTHLY_BUDGET_USD
 *
 * and, after the call, the usage ledger + alerts. Every refusal comes back as
 * a ready-to-send response body with plain-English copy; none of them mention
 * budgets, providers or internals.
 */

const CIRCUIT_CONFIG: RateLimitConfig = {
  limit: CIRCUIT_FAILURE_THRESHOLD,
  windowSeconds: CIRCUIT_WINDOW_SECONDS,
};

export const AI_UNAVAILABLE_MESSAGE =
  'Our AI service is having trouble right now. Your answers are saved on this device, so you can try again in a few minutes.';

export const AI_PAUSED_MESSAGE =
  'AI reflections are paused for a little while. Your answers are saved on this device — please try again later.';

export interface AiRefusal {
  status: number;
  body: { error: string; message: string; retryAfter?: number };
  headers?: Record<string, string>;
}

export interface AiLimit {
  key: string;
  config: RateLimitConfig;
  message: string;
}

export interface AiPreflightInput {
  feature: string;
  model: string;
  estimatedInputTokens: number;
  maxOutputTokens: number;
  limits: AiLimit[];
}

function refusal(status: number, error: string, message: string, retryAfter?: number): AiRefusal {
  return {
    status,
    body: { error, message, ...(retryAfter ? { retryAfter } : {}) },
    headers: retryAfter ? { 'Retry-After': String(retryAfter) } : undefined,
  };
}

/** Is the circuit for this feature open (provider recently failing)? Peeks without counting. */
export async function isCircuitOpen(feature: string): Promise<{ open: boolean; retryAfter: number }> {
  const state = await checkSharedRateLimit(`ai-circuit:${feature}`, CIRCUIT_CONFIG, { cost: 0 });
  return { open: !state.success, retryAfter: retryAfterSeconds(state.resetTime) };
}

/** Month-to-date estimated spend, or null if it can't be read (migration not applied, DB down). */
export async function monthToDateSpendUsd(): Promise<number | null> {
  try {
    const { data, error } = await createServiceClient().rpc('ai_spend_month_to_date');
    if (error) throw error;
    const value = Number(data);
    return Number.isFinite(value) ? value : null;
  } catch (err) {
    console.error('[ai/budget] could not read month-to-date spend:', err instanceof Error ? err.message : 'unknown');
    return null;
  }
}

/** Run checks 1–4. Returns null when the call may go ahead. */
export async function aiPreflight(input: AiPreflightInput): Promise<AiRefusal | null> {
  // 1. Kill switch
  if (aiFeaturesDisabled()) {
    return refusal(503, 'AI_DISABLED', AI_PAUSED_MESSAGE);
  }

  // 2. Circuit breaker — checked before rate limits so retries during an
  //    outage don't use up a person's allowance.
  const circuit = await isCircuitOpen(input.feature);
  if (circuit.open) {
    return refusal(503, 'AI_UNAVAILABLE', AI_UNAVAILABLE_MESSAGE, circuit.retryAfter);
  }

  // 3. Rate limits
  for (const limit of input.limits) {
    const result = await checkSharedRateLimit(limit.key, limit.config);
    if (!result.success) {
      return refusal(429, 'RATE_LIMITED', limit.message, retryAfterSeconds(result.resetTime));
    }
  }

  // 4. Monthly budget
  const budget = monthlyBudgetUsd();
  const spent = await monthToDateSpendUsd();
  if (spent === null) {
    // Can't read the ledger: allow the call (the Anthropic Console spend
    // limit is the hard backstop) but say so loudly in the logs.
    console.error('[ai/budget] spend unknown — budget NOT enforced for this call. Is the security_hardening migration applied?');
    return null;
  }
  const reserve = worstCaseCostUsd(input.model, input.estimatedInputTokens, input.maxOutputTokens);
  const decision = budgetDecision(spent, budget, reserve);
  if (!decision.allowed) {
    console.warn('[ai/budget] monthly budget reached; refusing call', { feature: input.feature, budget });
    await sendOpsAlert({
      key: `ai-budget-exhausted:${monthKey()}`,
      subject: 'AI monthly budget reached — AI features paused',
      body: `Estimated AI spend this month has reached the $${budget} cap (AI_MONTHLY_BUDGET_USD). AI features now show a "paused, try later" message until the month rolls over or the cap is raised in Vercel.`,
      dedupeSeconds: 31 * 86_400,
    });
    return refusal(503, 'AI_PAUSED', AI_PAUSED_MESSAGE);
  }

  return null;
}

/** Record a completed call in the usage ledger and send the 80% warning once a month. */
export async function recordAiUsage(feature: string, model: string, usage: TokenUsage | undefined): Promise<void> {
  if (!usage) return;
  try {
    const cost = estimateCostUsd(model, usage);
    const { error } = await createServiceClient().from('ai_usage').insert({
      feature,
      model,
      input_tokens: usage.input_tokens ?? 0,
      output_tokens: usage.output_tokens ?? 0,
      cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
      cost_usd: cost,
    });
    if (error) throw error;

    const budget = monthlyBudgetUsd();
    const spent = await monthToDateSpendUsd();
    if (spent !== null && budget > 0 && spent >= budget * BUDGET_WARN_RATIO) {
      await sendOpsAlert({
        key: `ai-budget-warn:${monthKey()}`,
        subject: `AI spend at ${Math.round((spent / budget) * 100)}% of the monthly budget`,
        body: `Estimated AI spend this month is $${spent.toFixed(2)} of the $${budget} cap (AI_MONTHLY_BUDGET_USD). At 100% AI features pause until the month rolls over. Raise the cap in Vercel if this is expected growth.`,
        dedupeSeconds: 31 * 86_400,
      });
    }
  } catch (err) {
    console.error('[ai/usage] could not record usage:', err instanceof Error ? err.message : 'unknown');
  }
}

/**
 * Count an upstream failure toward the circuit breaker. Only provider-side
 * failures count (timeouts, 429, 5xx/529) — our own bad requests don't.
 */
export async function recordUpstreamFailure(feature: string, status: number): Promise<void> {
  if (!isRetryableStatus(status)) return;
  try {
    const state = await checkSharedRateLimit(`ai-circuit:${feature}`, CIRCUIT_CONFIG);
    // The failure that reaches the threshold opens the circuit.
    if (!state.success || state.remaining === 0) {
      console.warn('[ai/circuit] opened', { feature, windowSeconds: CIRCUIT_WINDOW_SECONDS });
      await sendOpsAlert({
        key: `ai-circuit-open:${feature}`,
        subject: `AI provider failing — "${feature}" paused`,
        body: `${CIRCUIT_FAILURE_THRESHOLD}+ failed calls to the Anthropic API in ${CIRCUIT_WINDOW_SECONDS / 60} minutes (last status ${status}). The feature now shows a friendly "try again in a few minutes" message and stops calling the API; it retries automatically after the window. Check https://status.anthropic.com. Runbook: docs/HARDENING.md → "When the AI API is down".`,
        dedupeSeconds: 3 * 3600,
      });
    }
  } catch {
    // never throw from bookkeeping
  }
}
