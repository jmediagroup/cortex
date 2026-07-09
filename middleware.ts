import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

/**
 * Root middleware. Refreshes the Supabase session cookie on every request
 * (edge session refresh) and guards authenticated-only routes. Previously the
 * `updateSession` helper existed but was never wired up, so no session refresh
 * or server-side protection ran at all.
 */
export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image files, so the
     * session refresh runs on real navigations without touching the CDN cache
     * for static content.
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
