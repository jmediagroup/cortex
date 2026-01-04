import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Authentication result for API routes
 */
export interface AuthResult {
  user: User;
  token: string;
}

/**
 * Authentication error response
 */
export interface AuthError {
  error: string;
  status: number;
}

/**
 * Authenticates a request using Bearer token
 * Automatically handles token refresh if needed
 *
 * @param request - The Next.js request object
 * @returns AuthResult if successful, AuthError if failed
 */
export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult | AuthError> {
  const supabase = createServiceClient();
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return { error: 'Missing authorization header', status: 401 };
  }

  const token = authHeader.replace('Bearer ', '');

  if (!token) {
    return { error: 'Invalid authorization header format', status: 401 };
  }

  try {
    // Get user from token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      // Check if token is expired
      if (authError.message.includes('expired') || authError.message.includes('invalid')) {
        return {
          error: 'Token expired or invalid. Please refresh your session.',
          status: 401
        };
      }

      return { error: authError.message, status: 401 };
    }

    if (!user) {
      return { error: 'User not found', status: 401 };
    }

    return { user, token };
  } catch (error: any) {
    console.error('Authentication error:', error);
    return { error: 'Authentication failed', status: 500 };
  }
}

/**
 * Type guard to check if result is an error
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result;
}

/**
 * Helper to create unauthorized response
 */
export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Helper to create error response
 */
export function errorResponse(
  message: string,
  status: number = 500
): NextResponse {
  return NextResponse.json({ error: message }, { status });
}
