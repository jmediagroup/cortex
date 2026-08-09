import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/users
 * List users with search, pagination, and tier filtering
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    if (!isAdmin(authResult.user.email)) {
      return errorResponse('Forbidden', 403);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || '';
    // Signup-abuse filters. `unverified` is the one that matters: a
    // never-confirmed account is the signature of the bot signups that filled
    // this list up, since the profile row is created at signup time — before
    // anyone clicks the verification link.
    const status = searchParams.get('status') || '';
    const offset = (page - 1) * limit;

    const supabase = createServiceClient();

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' });

    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
    }

    if (tier === 'free' || tier === 'finance_pro') {
      query = query.eq('tier', tier);
    }

    if (status === 'verified') {
      query = query.not('email_verified_at', 'is', null);
    } else if (status === 'unverified') {
      query = query.is('email_verified_at', null);
    } else if (status === 'flagged') {
      query = query.eq('is_flagged', true);
    }

    const { data: users, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1) as {
        data: any[] | null;
        count: number | null;
        error: any;
      };

    if (error) {
      console.error('[Admin Users] Query error:', error);
      return errorResponse('Failed to fetch users', 500);
    }

    // Headline abuse numbers, so the page can show "X unverified" without a
    // second round trip. Non-fatal: the list still renders if this fails
    // (e.g. before harden_signup_abuse.sql has been applied).
    const { data: summaryRows, error: summaryError } = await supabase
      .from('signup_abuse_summary')
      .select('*')
      .limit(1);

    if (summaryError) {
      console.error('[Admin Users] Summary query error:', summaryError);
    }

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
      summary: summaryRows?.[0] ?? null,
    });
  } catch (error: any) {
    console.error('[Admin Users] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
