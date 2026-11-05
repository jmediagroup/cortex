import { NextRequest, NextResponse } from 'next/server';
import { generateInsights, type FinancialContext } from '@/lib/ai/insights';
import { getClientIP, RATE_LIMITS, retryAfterSeconds } from '@/lib/rate-limit';
import { checkSharedRateLimit } from '@/lib/rate-limit-shared';
import { aiFeaturesDisabled } from '@/lib/ai/policy';

/**
 * POST /api/ai/insights — rule-based insight templates (lib/ai/insights.ts).
 *
 * No model is called today, so there is no spend to cap, but it is public and
 * unauthenticated, so it is rate-limited per IP like every other AI endpoint
 * and honours the AI kill switch. If it is ever wired to a real model it must
 * go through aiPreflight() in lib/ai/guard.ts first.
 */

/** Finite number or undefined — never pass NaN/strings into the templates. */
const num = (v: unknown): number | undefined =>
  typeof v === 'number' && Number.isFinite(v) ? v : undefined;

export async function POST(request: NextRequest) {
  if (aiFeaturesDisabled()) {
    return NextResponse.json({ insights: [] }, { status: 200 });
  }

  const ip = getClientIP(request.headers);
  const limit = await checkSharedRateLimit(`ai-insights:${ip}`, RATE_LIMITS.aiInsights);
  if (!limit.success) {
    const retryAfter = retryAfterSeconds(limit.resetTime);
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.', retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const categories = Array.isArray(body.topCategories)
      ? (body.topCategories as unknown[])
          .slice(0, 20)
          .filter((c): c is { name: unknown; amount: unknown; change: unknown } => typeof c === 'object' && c !== null)
          .map((c) => ({
            name: typeof c.name === 'string' ? c.name.slice(0, 60) : '',
            amount: num(c.amount) ?? 0,
            change: num(c.change) ?? 0,
          }))
      : undefined;

    const context: FinancialContext = {
      totalIncome: num(body.totalIncome),
      totalExpenses: num(body.totalExpenses),
      savingsRate: num(body.savingsRate),
      monthlyBudget: num(body.monthlyBudget),
      currentSpending: num(body.currentSpending),
      topCategories: categories,
    };

    const insights = generateInsights(context);

    return NextResponse.json({ insights }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
