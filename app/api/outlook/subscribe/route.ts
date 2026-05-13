import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { isValidEmail, sanitizeString } from '@/lib/validation';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { sendConfirmationEmail } from '@/lib/outlook/email';

type SubscribeBody = { email?: unknown; source?: unknown };

function logError(stage: string, detail: unknown) {
  console.error(`[outlook/subscribe] ${stage}:`, detail);
}

function missingEnv(): string[] {
  const missing: string[] = [];
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push('NEXT_PUBLIC_SUPABASE_URL');
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  return missing;
}

export async function POST(request: NextRequest) {
  try {
    // Preflight: surface config errors with a specific log instead of a generic 500.
    const missing = missingEnv();
    if (missing.length) {
      logError('missing_env', missing);
      return NextResponse.json(
        { error: 'Subscriptions are temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`outlook-subscribe:${clientIP}`, RATE_LIMITS.outlookSubscribe);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a few minutes.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        },
      );
    }

    const body = (await request.json().catch(() => null)) as SubscribeBody | null;
    if (!body || typeof body.email !== 'string' || !body.email.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const email = sanitizeString(body.email, 255).toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const source =
      typeof body.source === 'string' && body.source.trim()
        ? sanitizeString(body.source, 50)
        : 'thinking';

    let supabase;
    try {
      supabase = createServiceClient();
    } catch (e) {
      logError('service_client_init', e);
      return NextResponse.json(
        { error: 'Subscriptions are temporarily unavailable. Please try again later.' },
        { status: 503 },
      );
    }

    // Best-effort: link to an existing user account if the email matches.
    let existingUserId: string | null = null;
    {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (error) {
        // Non-fatal — just skip the link.
        logError('users_lookup', error);
      } else if (data) {
        existingUserId = data.id;
      }
    }

    // Check for an existing subscriber row.
    const { data: existing, error: existingError } = await supabase
      .from('outlook_subscribers')
      .select('id, email, confirmed_at, confirmation_token')
      .eq('email', email)
      .maybeSingle();

    if (existingError) {
      logError('subscriber_lookup', existingError);
      return NextResponse.json({ error: 'Could not subscribe. Please try again.' }, { status: 500 });
    }

    if (existing?.confirmed_at) {
      // Already confirmed — succeed silently to avoid leaking subscription state.
      return NextResponse.json(
        { success: true, message: "You're already subscribed. Thanks!" },
        { status: 200 },
      );
    }

    let confirmationToken: string;

    if (existing) {
      confirmationToken = existing.confirmation_token;
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('outlook_subscribers')
        .insert({
          email,
          source,
          ...(existingUserId ? { user_id: existingUserId } : {}),
        })
        .select('confirmation_token')
        .single();

      if (insertError || !inserted) {
        logError('subscriber_insert', insertError);
        return NextResponse.json({ error: 'Could not subscribe. Please try again.' }, { status: 500 });
      }
      confirmationToken = inserted.confirmation_token;
    }

    const emailResult = await sendConfirmationEmail({ email, confirmationToken });
    if (!emailResult.success) {
      // Row exists; the user can resubmit to re-trigger the email. Log for visibility.
      logError('confirmation_email_send', emailResult.error);
    }

    return NextResponse.json(
      { success: true, message: 'Check your inbox to confirm your subscription.' },
      { status: 200 },
    );
  } catch (error) {
    logError('unhandled', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
