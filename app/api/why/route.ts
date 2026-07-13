import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import {
  authenticateRequest,
  isAuthError,
  unauthorizedResponse,
} from '@/lib/auth-helpers';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { WHY_QUESTION_IDS, type WhyAnswers } from '@/lib/why/questions';
import { synthesizeWhy, SynthesisError } from '@/lib/why/synthesis';

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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

  // Rate limit the AI call per user to keep cost and abuse in check.
  const rateLimit = checkRateLimit(
    `why-synthesis:${auth.user.id}`,
    RATE_LIMITS.whySynthesis,
  );
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: 'RATE_LIMITED',
        message:
          "You're reflecting quickly — give it a few minutes before generating another.",
      },
      { status: 429 },
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
    answers[id] = typeof value === 'string' ? value.slice(0, 5000).trim() : '';
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

  let summary;
  try {
    summary = await synthesizeWhy(answers);
  } catch (err) {
    if (err instanceof SynthesisError) {
      return NextResponse.json(
        { error: 'SYNTHESIS_FAILED', message: err.message },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: 'SYNTHESIS_FAILED', message: 'Could not generate your reflection.' },
      { status: 502 },
    );
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
