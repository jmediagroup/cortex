import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/admin';

/**
 * GET /api/admin/users/:id
 * Get a single user's details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    if (!isAdmin(authResult.user.email)) {
      return errorResponse('Forbidden', 403);
    }

    const { id } = await params;
    const supabase = createServiceClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single() as { data: any; error: any };

    if (error) {
      return errorResponse('User not found', 404);
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[Admin User Detail] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

/**
 * PATCH /api/admin/users/:id
 * Update a user's tier or details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    if (!isAdmin(authResult.user.email)) {
      return errorResponse('Forbidden', 403);
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow updating specific fields
    const allowedFields = ['tier', 'first_name', 'last_name'];
    const updates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (updates.tier && !['free', 'finance_pro', 'elite'].includes(updates.tier)) {
      return errorResponse('Invalid tier value', 400);
    }

    if (Object.keys(updates).length === 0) {
      return errorResponse('No valid fields to update', 400);
    }

    const supabase = createServiceClient();

    const { data: user, error } = await (supabase
      .from('users') as any)
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Admin User Update] Error:', error);
      return errorResponse('Failed to update user', 500);
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error('[Admin User Update] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}

/**
 * DELETE /api/admin/users/:id
 * Delete a user account
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (isAuthError(authResult)) {
      return errorResponse(authResult.error, authResult.status);
    }

    if (!isAdmin(authResult.user.email)) {
      return errorResponse('Forbidden', 403);
    }

    const { id } = await params;
    const supabase = createServiceClient();

    // Delete from users table
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('[Admin User Delete] DB error:', deleteError);
      return errorResponse('Failed to delete user record', 500);
    }

    // Delete from auth
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(id);

    if (authDeleteError) {
      console.error('[Admin User Delete] Auth error:', authDeleteError);
      return errorResponse('Failed to delete auth user', 500);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[Admin User Delete] Unexpected error:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
}
