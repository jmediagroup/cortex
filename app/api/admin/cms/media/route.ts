import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/client';
import { errorResponse } from '@/lib/auth-helpers';
import { requireAdmin, slugify } from '@/lib/cms/admin';

const BUCKET = 'cms-media';
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];

/**
 * POST /api/admin/cms/media — upload an image to the cms-media bucket.
 * multipart/form-data with a `file` field. Returns the public URL.
 */
export async function POST(request: NextRequest) {
  try {
    const denied = await requireAdmin(request);
    if (denied) return denied;

    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return errorResponse('No file provided', 400);
    if (!ALLOWED.includes(file.type)) return errorResponse('Unsupported image type', 400);
    if (file.size > MAX_BYTES) return errorResponse('Image exceeds 8 MB limit', 400);

    const extFromName = file.name.includes('.') ? file.name.split('.').pop()! : '';
    const ext = (extFromName || file.type.split('/')[1] || 'bin').toLowerCase();
    const base = slugify(file.name.replace(/\.[^.]+$/, '') || 'image');
    const path = `articles/${Date.now()}-${base}.${ext}`;

    const supabase = createServiceClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error('[CMS media upload] Error:', uploadError);
      return errorResponse('Failed to upload image', 500);
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return NextResponse.json({ url: data.publicUrl, path }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[CMS media upload] Unexpected error:', error);
    return errorResponse(message, 500);
  }
}
