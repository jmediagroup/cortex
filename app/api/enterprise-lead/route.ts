import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import {
  validateRequiredFields,
  isValidEmail,
  isValidPhone,
  isValidCompanySize,
  sanitizeString
} from '@/lib/validation';
import { getClientIP, RATE_LIMITS } from '@/lib/rate-limit';
import { checkSharedRateLimit } from '@/lib/rate-limit-shared';
import { sendEnterpriseLeadNotification } from '@/lib/email';
import { botSignalMessage, checkBotSignals, HONEYPOT_FIELD } from '@/lib/bot-check';
import { verifyTurnstileToken } from '@/lib/turnstile';

/** Six fields and a free-text message: nobody fills this in under 3 seconds. */
const MIN_FORM_FILL_MS = 3000;

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request.headers);
    const rateLimit = await checkSharedRateLimit(`enterprise-lead:${clientIP}`, RATE_LIMITS.enterpriseLead);

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
        }
      );
    }

    // Parse request body
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
    }

    // Bot signals: honeypot → decoy success (no row, no email); too fast or
    // no timing → visible "try again". Then Turnstile, once configured.
    const bot = checkBotSignals({
      honeypot: body[HONEYPOT_FIELD],
      formStartedAt: body.formStartedAt,
      minFillMs: MIN_FORM_FILL_MS,
      requireTiming: true,
      ownValues: [body.email, body.firstName, body.lastName, body.companyName, body.phone],
    });
    if (!bot.ok) {
      console.warn('[enterprise-lead] bot signal', { reason: bot.reason });
      if (bot.decoy) {
        return NextResponse.json(
          { success: true, message: 'Thank you for your interest. We will be in touch soon.' },
          { status: 200 },
        );
      }
      return NextResponse.json(
        { error: botSignalMessage(bot.reason === 'too_fast' ? 'too_fast' : 'missing_timing') },
        { status: 400 },
      );
    }
    const captcha = await verifyTurnstileToken(
      typeof body.captchaToken === 'string' ? body.captchaToken : null,
      clientIP,
    );
    if (!captcha.success) {
      return NextResponse.json(
        { error: 'The security check didn’t pass. Please refresh the page and try again.' },
        { status: 400 },
      );
    }

    // Validate required fields
    const validation = validateRequiredFields(body, [
      'firstName',
      'lastName',
      'email',
      'companyName',
      'companySize',
      'message'
    ]);

    if (!validation.valid) {
      return NextResponse.json(
        { error: `Missing required fields: ${validation.missing?.join(', ')}` },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, companyName, companySize, phone, message } = body;

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate company size
    if (!isValidCompanySize(companySize)) {
      return NextResponse.json(
        { error: 'Please select a valid company size' },
        { status: 400 }
      );
    }

    // Validate phone if provided
    if (phone && !isValidPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      first_name: sanitizeString(firstName, 100),
      last_name: sanitizeString(lastName, 100),
      email: sanitizeString(email, 255).toLowerCase(),
      company_name: sanitizeString(companyName, 255),
      company_size: companySize,
      phone: phone ? sanitizeString(phone, 30) : null,
      message: sanitizeString(message, 2000),
      status: 'new' as const,
    };

    // Insert into database
    const supabase = createServiceClient();
    const { error: insertError } = await (supabase
      .from('enterprise_leads')
      .insert as any)(sanitizedData);

    if (insertError) {
      console.error('Failed to insert enterprise lead:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit your request. Please try again.' },
        { status: 500 }
      );
    }

    // Send email notification (don't fail the request if email fails)
    const emailResult = await sendEnterpriseLeadNotification({
      firstName: sanitizedData.first_name,
      lastName: sanitizedData.last_name,
      email: sanitizedData.email,
      companyName: sanitizedData.company_name,
      companySize: sanitizedData.company_size,
      phone: sanitizedData.phone,
      message: sanitizedData.message,
    });

    if (!emailResult.success) {
      console.error('Failed to send lead notification email:', emailResult.error);
      // Continue anyway - the lead is saved in the database
    }

    return NextResponse.json(
      { success: true, message: 'Thank you for your interest. We will be in touch soon.' },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error: unknown) {
    console.error('Enterprise lead API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
