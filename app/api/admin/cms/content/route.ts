import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import {
  requireAdmin,
  pickContentFields,
  slugify,
  syncTaxonomy,
  revalidateArticles,
  CmsValidationError,
} from '@/lib/cms/admin';

/**
 * GET /api/admin/cms/content
 * List content rows for the admin table. Optional ?type= and ?status= filters.
 */
export async function GET(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase.from('cms_content') as any)
      .select('id,type,slug,title,status,published_at,updated_at,created_at')
      .order('updated_at', { ascending: false })
      .limit(500);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[CMS content list] Error:', error);
      return errorResponse('Failed to load content', 500);
    }
    return NextResponse.json({ content: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CMS content list] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/**
 * POST /api/admin/cms/content
 * Create a new content row (+ its categories/tags).
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const body = await request.json();
    if (!body.title || String(body.title).trim() === '') {
      return errorResponse('Title is required', 400);
    }

    const updates = pickContentFields(body);
    updates.type = updates.type || 'article';
    updates.slug = updates.slug || slugify(String(body.title));

    const supabase = createServiceClient();
    const { data, error } = await (supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('cms_content') as any)
      .insert(updates)
      .select('id,slug')
      .single();

    if (error) {
      if (error.code === '23505') {
        return errorResponse('A piece of content with that slug already exists', 409);
      }
      console.error('[CMS content create] Error:', error);
      return errorResponse('Failed to create content', 500);
    }

    await syncTaxonomy(supabase, data.id, body.categories, body.tags);
    revalidateArticles(data.slug);

    return NextResponse.json({ id: data.id, slug: data.slug }, { status: 201 });
  } catch (error) {
    if (error instanceof CmsValidationError) return errorResponse(error.message, 400);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CMS content create] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
