import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin, slugify } from '@/lib/cms/admin';

/** GET /api/admin/cms/categories — all categories, for the editor picker. */
export async function GET(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('cms_categories')
    .select('id,slug,name,description')
    .order('name', { ascending: true });
  if (error) return errorResponse('Failed to load categories', 500);
  return NextResponse.json({ categories: data ?? [] });
}

/** POST /api/admin/cms/categories — create a category. */
export async function POST(request: NextRequest) {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const body = await request.json();
  const name = String(body.name || '').trim();
  if (!name) return errorResponse('Name is required', 400);

  const supabase = createServiceClient();
  const { data, error } = await (supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('cms_categories') as any)
    .insert({ name, slug: slugify(name), description: body.description ?? null })
    .select('id,slug,name')
    .single();

  if (error) {
    if (error.code === '23505') return errorResponse('Category already exists', 409);
    return errorResponse('Failed to create category', 500);
  }
  return NextResponse.json({ category: data }, { status: 201 });
}
