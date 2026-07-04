import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin, slugify } from '@/lib/cms/admin';

/** GET /api/admin/cms/tags — all tags, for the editor picker. */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('cms_tags')
    .select('id,slug,name')
    .order('name', { ascending: true });
  if (error) return errorResponse('Failed to load tags', 500);
  return NextResponse.json({ tags: data ?? [] });
}

/** POST /api/admin/cms/tags — create a tag. */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json();
  const name = String(body.name || '').trim();
  if (!name) return errorResponse('Name is required', 400);

  const supabase = createServiceClient();
  const { data, error } = await (supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('cms_tags') as any)
    .insert({ name, slug: slugify(name) })
    .select('id,slug,name')
    .single();

  if (error) {
    if (error.code === '23505') return errorResponse('Tag already exists', 409);
    return errorResponse('Failed to create tag', 500);
  }
  return NextResponse.json({ tag: data }, { status: 201 });
}
