import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin } from '@/lib/cms/admin';
import { renderMarkdown } from '@/lib/outlook/markdown';

/**
 * POST /api/admin/cms/preview — render markdown to HTML with the exact same
 * pipeline the public article pages use, so the editor preview matches prod.
 * Admin-gated so it isn't a general-purpose render endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    const markdown = typeof body.markdown === 'string' ? body.markdown : '';
    const html = await renderMarkdown(markdown);
    return NextResponse.json({ html });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CMS preview] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
