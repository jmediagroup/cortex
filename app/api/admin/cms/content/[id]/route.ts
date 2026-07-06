import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import {
  requireAdmin,
  pickContentFields,
  syncTaxonomy,
  revalidateContent,
  CmsValidationError,
} from '@/lib/cms/admin';

const FULL_SELECT =
  '*,cms_content_categories(cms_categories(name,slug)),cms_content_tags(cms_tags(name,slug))';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function taxonomyNames(embed: any[] | null | undefined, key: string): string[] {
  return (embed ?? [])
    .map((e) => e?.[key]?.name)
    .filter((n: unknown): n is string => typeof n === 'string');
}

/**
 * GET /api/admin/cms/content/:id — full row + category/tag names for the editor.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    const supabase = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('cms_content') as any)
      .select(FULL_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error || !data) return errorResponse('Content not found', 404);

    const { cms_content_categories, cms_content_tags, ...row } = data;
    return NextResponse.json({
      content: {
        ...row,
        categories: taxonomyNames(cms_content_categories, 'cms_categories'),
        tags: taxonomyNames(cms_content_tags, 'cms_tags'),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CMS content get] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/**
 * PATCH /api/admin/cms/content/:id — update fields + taxonomy.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    const body = await request.json();
    const updates = pickContentFields(body);

    const supabase = createServiceClient();

    // Grab the current slug + type so we can revalidate the old path if the slug
    // changes, scoped to the right content type.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('cms_content') as any)
      .select('slug,type')
      .eq('id', id)
      .maybeSingle();
    if (!existing) return errorResponse('Content not found', 404);
    const contentType = updates.type ?? existing.type;

    let updated = existing;
    if (Object.keys(updates).length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase.from('cms_content') as any)
        .update(updates)
        .eq('id', id)
        .select('id,slug')
        .single();
      if (error) {
        if (error.code === '23505') {
          return errorResponse('A piece of content with that slug already exists', 409);
        }
        console.error('[CMS content update] Error:', error);
        return errorResponse('Failed to update content', 500);
      }
      updated = data;
    }

    await syncTaxonomy(supabase, id, body.categories, body.tags);

    revalidateContent(contentType, updated.slug);
    if (existing.slug && existing.slug !== updated.slug) revalidateContent(contentType, existing.slug);

    return NextResponse.json({ id, slug: updated.slug });
  } catch (error) {
    if (error instanceof CmsValidationError) return errorResponse(error.message, 400);
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CMS content update] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}

/**
 * DELETE /api/admin/cms/content/:id — remove the row (joins cascade).
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const { id } = await params;
    const supabase = createServiceClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('cms_content') as any)
      .select('slug,type')
      .eq('id', id)
      .maybeSingle();

    const { error } = await supabase.from('cms_content').delete().eq('id', id);
    if (error) {
      console.error('[CMS content delete] Error:', error);
      return errorResponse('Failed to delete content', 500);
    }

    revalidateContent(existing?.type, existing?.slug);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CMS content delete] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
