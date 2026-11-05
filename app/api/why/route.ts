import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import {
  authenticateRequest,
  isAuthError,
  unauthorizedResponse,
} from '@/lib/auth-helpers';
import { getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { WHY_QUESTION_IDS, type WhyAnswers } from '@/lib/why/questions';
import { synthesizeWhy, SynthesisError, WHY_MAX_TOKENS, WHY_MODEL } from '@/lib/why/synthesis';
import { aiPreflight, recordAiUsage, recordUpstreamFailure, AI_UNAVAILABLE_MESSAGE } from '@/lib/ai/guard';
import { roughTokenCount } from '@/lib/ai/policy';
import { internalErrorResponse } from '@/lib/api-errors';

/** First attempt (≤25s) plus one quick retry; see lib/why/synthesis.ts. */
export const maxDuration = 60;

const FEATURE = 'whats-your-why';
/** System prompt + framing, before the answers (~1k tokens). */
const PROMPT_OVERHEAD_TOKENS = 1200;

// Per-answer character cap. The synthesis cost is dominated by input tokens, so
// this bounds the worst case: 8 answers × 1500 chars ≈ 3k input tokens, versus
// ~10k under the old 5000-char cap. Reflection answers are typically a few
// sentences; this only trims an unusually long single response.
const MAX_ANSWER_CHARS = 1500;

// GET /api/why - List the authenticated user's past reflections (newest first)
export async function GET(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return unauthorizedResponse(auth.error);

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('why_reflections')
    .select('*')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return internalErrorResponse('why:list', error, 'We couldn’t load your past reflections. Please try again.');
  }

  return NextResponse.json({ reflections: data });
}

// POST /api/why - Synthesize a reflection from answers and store it
export async function POST(request: NextRequest) {
  const auth = await authenticateRequest(request);
  if (isAuthError(auth)) return unauthorizedResponse(auth.error);

  const supabase = createServiceClient();

  // Pro-only: this reflection requires a paid plan.
  const { data: userData } = await supabase
    .from('users')
    .select('tier')
    .eq('id', auth.user.id)
    .single();

  const userTier = ((userData as { tier?: Tier } | null)?.tier || 'free') as Tier;
  if (!hasProAccess('finance', userTier)) {
    return NextResponse.json(
      {
        error: 'PRO_REQUIRED',
        message: "What's Your Why is a Pro feature. Upgrade to a paid plan to generate your reflection.",
      },
      { status: 403 },
    );
  }

  let body: { answers?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const rawAnswers = body.answers;
  if (!rawAnswers || typeof rawAnswers !== 'object' || Array.isArray(rawAnswers)) {
    return NextResponse.json(
      { error: 'Missing required field: answers' },
      { status: 400 },
    );
  }

  // Keep only known question keys, coerce to trimmed strings.
  const answers: WhyAnswers = {};
  for (const id of WHY_QUESTION_IDS) {
    const value = (rawAnswers as Record<string, unknown>)[id];
    answers[id] =
      typeof value === 'string' ? value.slice(0, MAX_ANSWER_CHARS).trim() : '';
  }

  // Require at least some substance so we don't burn a call on an empty form.
  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;
  if (answeredCount < 3) {
    return NextResponse.json(
      {
        error: 'TOO_FEW_ANSWERS',
        message: 'Answer at least three questions to generate a reflection.',
      },
      { status: 400 },
    );
  }

  // Kill switch, circuit breaker, per-user/per-IP limits and the monthly
  // budget (lib/ai/guard.ts) — all before any money is spent.
  const clientIP = getClientIP(request.headers);
  const refused = await aiPreflight({
    feature: FEATURE,
    model: WHY_MODEL,
    estimatedInputTokens:
      PROMPT_OVERHEAD_TOKENS + roughTokenCount(Object.values(answers).join('\n')),
    maxOutputTokens: WHY_MAX_TOKENS,
    limits: [
      {
        key: `why-synthesis:${auth.user.id}`,
        config: RATE_LIMITS.whySynthesis,
        message: "You're reflecting quickly — give it a few minutes before generating another.",
      },
      {
        key: `ai:user-daily:${auth.user.id}`,
        config: RATE_LIMITS.aiUserDaily,
        message: "You've reached today's limit for reflections. Your answers are saved — come back tomorrow.",
      },
      {
        key: `ai:ip:${clientIP}`,
        config: RATE_LIMITS.aiIpHourly,
        message: 'Too many reflections from this connection. Please try again in an hour.',
      },
    ],
  });
  if (refused) {
    return NextResponse.json(refused.body, { status: refused.status, headers: refused.headers });
  }

  let summary;
  try {
    const result = await synthesizeWhy(answers);
    summary = result.summary;
    await recordAiUsage(FEATURE, WHY_MODEL, result.usage);
  } catch (err) {
    if (err instanceof SynthesisError) {
      await recordAiUsage(FEATURE, WHY_MODEL, err.usage);
      await recordUpstreamFailure(FEATURE, err.upstreamStatus);
      // `err.message` is written for people (see lib/why/synthesis.ts).
      return NextResponse.json(
        { error: err.status === 422 ? 'SYNTHESIS_REFUSED' : 'AI_UNAVAILABLE', message: err.message },
        { status: err.status },
      );
    }
    console.error('[why] unexpected synthesis error:', err instanceof Error ? err.message : 'unknown');
    return NextResponse.json({ error: 'AI_UNAVAILABLE', message: AI_UNAVAILABLE_MESSAGE }, { status: 502 });
  }

  const { data, error } = await supabase
    .from('why_reflections')
    .insert({
      user_id: auth.user.id,
      answers,
      summary,
    })
    .select()
    .single();

  if (error) {
    // The reflection was generated successfully; return it even if the
    // persistence step failed so the user still sees their result.
    return NextResponse.json({ reflection: { answers, summary }, persisted: false });
  }

  return NextResponse.json({ reflection: data, persisted: true }, { status: 201 });
}
