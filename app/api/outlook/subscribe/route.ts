import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { isValidEmail, sanitizeString } from '@/lib/validation';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { sendConfirmationEmail } from '@/lib/outlook/email';

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`outlook-subscribe:${clientIP}`, RATE_LIMITS.outlookSubscribe);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
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

    const body = (await request.json().catch(() => null)) as { email?: string; source?: string } | null;
    if (!body?.email || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const email = sanitizeString(body.email, 255).toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const source = body.source ? sanitizeString(body.source, 50) : 'thinking';

    const supabase = createServiceClient();

    // Try to link to an existing user account by matching email.
    const { data: existingUser } = (await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()) as { data: { id: string } | null };

    // Check for an existing subscriber row.
    const { data: existing } = (await supabase
      .from('outlook_subscribers')
      .select('id, email, confirmed_at, confirmation_token')
      .eq('email', email)
      .maybeSingle()) as {
      data: {
        id: string;
        email: string;
        confirmed_at: string | null;
        confirmation_token: string;
      } | null;
    };

    if (existing?.confirmed_at) {
      // Already confirmed — succeed silently to avoid leaking subscription state.
      return NextResponse.json(
        { success: true, message: "You're already subscribed." },
        { status: 200 },
      );
    }

    let confirmationToken: string;

    if (existing) {
      confirmationToken = existing.confirmation_token;
    } else {
      const insertPayload = {
        email,
        source,
        ...(existingUser?.id ? { user_id: existingUser.id } : {}),
      };
      const insert = supabase.from('outlook_subscribers').insert as unknown as (
        values: Record<string, unknown>,
      ) => {
        select: (cols: string) => {
          single: () => Promise<{
            data: { confirmation_token: string } | null;
            error: { message: string } | null;
          }>;
        };
      };
      const { data: inserted, error: insertError } = await insert(insertPayload)
        .select('confirmation_token')
        .single();

      if (insertError || !inserted) {
        console.error('Failed to insert outlook subscriber:', insertError);
        return NextResponse.json({ error: 'Could not subscribe. Please try again.' }, { status: 500 });
      }
      confirmationToken = inserted.confirmation_token;
    }

    const emailResult = await sendConfirmationEmail({ email, confirmationToken });
    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the request — the row exists; user can re-submit if needed.
    }

    return NextResponse.json(
      { success: true, message: 'Check your inbox to confirm your subscription.' },
      { status: 200 },
    );
  } catch (error) {
    console.error('outlook subscribe error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
