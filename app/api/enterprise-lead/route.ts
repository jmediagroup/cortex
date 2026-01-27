import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import {
  validateRequiredFields,
  isValidEmail,
  isValidPhone,
  isValidCompanySize,
  sanitizeString
} from '@/lib/validation';
import { checkRateLimit, getClientIP, RATE_LIMITS } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request.headers);
    const rateLimit = checkRateLimit(`enterprise-lead:${clientIP}`, RATE_LIMITS.enterpriseLead);

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
    const body = await request.json();

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
  } catch (error: any) {
    console.error('Enterprise lead API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
