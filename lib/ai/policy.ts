/**
 * Pure rules for spending money on the Anthropic API: prices, the monthly
 * budget, the kill switch and which upstream failures are worth retrying.
 * No I/O here — lib/ai/guard.ts wires these to the database — so all of it
 * can be unit-tested with plain `node --test`.
 */

// ---------------------------------------------------------------------------
// Prices (USD per million tokens), from Anthropic's published first-party API
// rates (claude-api reference, cached 2026-10-06). Used only to *estimate*
// spend for the budget; the Anthropic Console bill is the source of truth.
// If a model isn't listed we charge the most expensive known rate, so an
// unpriced model can only make the budget trip early, never late.
// ---------------------------------------------------------------------------

export interface ModelPrice {
  inputPerMTok: number;
  outputPerMTok: number;
  cacheReadPerMTok: number;
}

export const MODEL_PRICES: Record<string, ModelPrice> = {
  'claude-sonnet-5': { inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2 },
  'claude-sonnet-5-5': { inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2 },
  'claude-haiku-5-5': { inputPerMTok: 0.1, outputPerMTok: 0.5, cacheReadPerMTok: 0.01 },
  'claude-opus-5-5': { inputPerMTok: 4, outputPerMTok: 20, cacheReadPerMTok: 0.2 },
};

/** Fallback for unknown models: the top published tier. */
export const UNKNOWN_MODEL_PRICE: ModelPrice = { inputPerMTok: 10, outputPerMTok: 50, cacheReadPerMTok: 1 };

export function priceFor(model: string): ModelPrice {
  return MODEL_PRICES[model] ?? UNKNOWN_MODEL_PRICE;
}

export interface TokenUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_read_input_tokens?: number;
  cache_creation_input_tokens?: number;
}

const n = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

/** Estimated cost of one completed call. Cache writes are billed as input (slight over-estimate is fine). */
export function estimateCostUsd(model: string, usage: TokenUsage): number {
  const p = priceFor(model);
  const cost =
    ((n(usage.input_tokens) + n(usage.cache_creation_input_tokens) * 1.25) * p.inputPerMTok +
      n(usage.output_tokens) * p.outputPerMTok +
      n(usage.cache_read_input_tokens) * p.cacheReadPerMTok) /
    1_000_000;
  return Math.round(cost * 1e6) / 1e6;
}

/** Upper bound for a call we're about to make: expected input, full output allowance. */
export function worstCaseCostUsd(model: string, estimatedInputTokens: number, maxOutputTokens: number): number {
  return estimateCostUsd(model, { input_tokens: estimatedInputTokens, output_tokens: maxOutputTokens });
}

/** Rough token count for text we're about to send (~4 chars/token, rounded up). */
export function roughTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// Monthly budget
// ---------------------------------------------------------------------------

/**
 * Default monthly cap in USD when AI_MONTHLY_BUDGET_USD is unset. A safety
 * net, not a business decision — Drew sets the real number (docs/HARDENING.md).
 * At ~$0.02 per "What's Your Why" reflection this is roughly 1,000+ a month.
 */
export const DEFAULT_MONTHLY_BUDGET_USD = 25;

/** Share of the budget at which a one-time warning alert goes out. */
export const BUDGET_WARN_RATIO = 0.8;

export function monthlyBudgetUsd(raw: string | undefined = process.env.AI_MONTHLY_BUDGET_USD): number {
  if (raw === undefined || raw.trim() === '') return DEFAULT_MONTHLY_BUDGET_USD;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : DEFAULT_MONTHLY_BUDGET_USD;
}

export type BudgetDecision =
  | { allowed: true; level: 'ok' | 'warn' }
  | { allowed: false; level: 'exhausted' };

/**
 * Would this call keep the month within budget? `reserveUsd` is the
 * worst-case cost of the call itself, so the cap holds even if this is the
 * call that would cross it.
 */
export function budgetDecision(spentUsd: number, budgetUsd: number, reserveUsd: number): BudgetDecision {
  if (budgetUsd <= 0 || spentUsd + reserveUsd > budgetUsd) return { allowed: false, level: 'exhausted' };
  return { allowed: true, level: spentUsd + reserveUsd >= budgetUsd * BUDGET_WARN_RATIO ? 'warn' : 'ok' };
}

/** Month bucket (UTC) used in alert keys, e.g. "2026-11". */
export function monthKey(now = new Date()): string {
  return now.toISOString().slice(0, 7);
}

// ---------------------------------------------------------------------------
// Kill switch
// ---------------------------------------------------------------------------

/** AI_FEATURES_DISABLED="true" turns every model call off instantly (no redeploy of code; env change + redeploy). */
export function aiFeaturesDisabled(raw: string | undefined = process.env.AI_FEATURES_DISABLED): boolean {
  return raw === 'true';
}

// ---------------------------------------------------------------------------
// Upstream failures
// ---------------------------------------------------------------------------

/**
 * Status codes from the Anthropic API that mean "try again later", not "your
 * request is wrong": 408 timeout, 409 conflict, 429 rate limited, 5xx
 * (including 529 overloaded). 400/401/403/404/413 are not retried.
 */
export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}

/**
 * How long to wait before the single retry. Honors a short `retry-after`
 * header; returns null when waiting would blow the request's time budget.
 */
export function retryDelayMs(retryAfterHeader: string | null, elapsedMs: number, budgetMs: number): number | null {
  const fromHeader = retryAfterHeader ? Number(retryAfterHeader) * 1000 : NaN;
  const delay = Number.isFinite(fromHeader) && fromHeader >= 0 ? fromHeader : 1500;
  if (delay > 4000) return null;
  if (elapsedMs + delay > budgetMs) return null;
  return delay;
}

/** Circuit breaker: this many upstream failures inside the window opens it. */
export const CIRCUIT_FAILURE_THRESHOLD = 5;
/** Window (and therefore the longest the circuit stays open), in seconds. */
export const CIRCUIT_WINDOW_SECONDS = 120;
