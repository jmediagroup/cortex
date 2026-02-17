import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/analytics
 * Event analytics for the admin dashboard
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
    const days = Math.min(parseInt(searchParams.get('days') || '30'), 90);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const supabase = createServiceClient();

    // Fetch event counts by type and recent events
    const [eventsByType, recentEvents, signupsByDay] = await Promise.all([
      // Event counts by type
      supabase
        .from('events')
        .select('event_type')
        .gte('created_at', since) as unknown as { data: { event_type: string }[] | null; error: any },

      // Most recent events
      supabase
        .from('events')
        .select('id, event_type, user_id, page_url, created_at')
        .order('created_at', { ascending: false })
        .limit(50) as unknown as { data: any[] | null; error: any },

      // Signups over time
      supabase
        .from('users')
        .select('created_at')
        .gte('created_at', since)
        .order('created_at', { ascending: true }) as unknown as { data: { created_at: string }[] | null; error: any },
    ]);

    // Aggregate event counts
    const eventCounts: Record<string, number> = {};
    if (eventsByType?.data) {
      for (const event of eventsByType.data) {
        eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
      }
    }

    // Aggregate signups by day
    const signupCounts: Record<string, number> = {};
    if (signupsByDay?.data) {
      for (const user of signupsByDay.data) {
        const day = user.created_at.split('T')[0];
        signupCounts[day] = (signupCounts[day] || 0) + 1;
      }
    }

    return NextResponse.json({
      eventCounts,
      recentEvents: recentEvents?.data || [],
      signupsByDay: Object.entries(signupCounts).map(([date, count]) => ({
        date,
        count,
      })),
    });
  } catch (error: any) {
    console.error('[Admin Analytics] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
