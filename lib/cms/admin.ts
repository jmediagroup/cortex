import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import readingTime from 'reading-time';
import type { SupabaseClient } from '@supabase/supabase-js';
import { authenticateRequest, isAuthError, errorResponse } from '@/lib/auth-helpers';
import { isAdmin } from '@/lib/admin';
import type { Database } from '@/lib/supabase/client';
import { CACHE_TAGS } from './articles';

export type CmsClient = SupabaseClient<Database>;

export const CONTENT_TYPES = ['article', 'guide', 'daily', 'weekly'] as const;
export const CONTENT_STATUSES = ['draft', 'published', 'scheduled', 'archived'] as const;

// Columns the admin API accepts on create/update. Anything else in the body is ignored.
const CONTENT_FIELDS = [
  'type',
  'slug',
  'title',
  'excerpt',
  'body_markdown',
  'status',
  'featured_image_url',
  'featured_image_alt',
  'featured_image_width',
  'featured_image_height',
  'author_name',
  'author_slug',
  'author_avatar',
  'author_bio',
  'seo_title',
  'seo_description',
  'seo_keywords',
  'seo_og_title',
  'seo_og_description',
  'seo_og_image',
  'seo_canonical',
  'metadata',
  'reading_time',
  'published_at',
] as const;

/**
 * Gate an admin API route: Bearer token → valid user → email allowlist.
 * Returns an error `NextResponse` when denied, or `null` when authorized.
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const authResult = await authenticateRequest(request);
  if (isAuthError(authResult)) return errorResponse(authResult.error, authResult.status);
  if (!isAdmin(authResult.user.email)) return errorResponse('Forbidden', 403);
  return null;
}

export function slugify(input: string): string {
  const slug = (input || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return slug || 'untitled';
}

/**
 * Pull only whitelisted content columns out of a request body, with light
 * validation of the constrained fields. Returns the update object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pickContentFields(body: Record<string, any>): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updates: Record<string, any> = {};
  for (const field of CONTENT_FIELDS) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  if (updates.type && !CONTENT_TYPES.includes(updates.type)) {
    throw new CmsValidationError('Invalid content type');
  }
  if (updates.status && !CONTENT_STATUSES.includes(updates.status)) {
    throw new CmsValidationError('Invalid status');
  }
  if (updates.slug !== undefined) {
    updates.slug = slugify(String(updates.slug));
  }

  // Compute reading time from the body when not explicitly provided.
  if (updates.body_markdown !== undefined && updates.reading_time === undefined) {
    updates.reading_time = Math.max(1, Math.round(readingTime(String(updates.body_markdown)).minutes));
  }

  // First transition to published stamps published_at when the caller didn't.
  if (updates.status === 'published' && updates.published_at === undefined) {
    updates.published_at = new Date().toISOString();
  }

  return updates;
}

export class CmsValidationError extends Error {}

// Upsert a set of term names into a taxonomy table, returning their ids.
async function upsertTerms(
  supabase: CmsClient,
  table: 'cms_categories' | 'cms_tags',
  names: string[],
): Promise<string[]> {
  const ids: string[] = [];
  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  for (const rawName of names) {
    const name = String(rawName || '').trim();
    if (!name) continue;
    const slug = slugify(name);
    if (seen.has(slug)) continue;
    seen.add(slug);

    const { data: existing } = await sb.from(table).select('id').eq('slug', slug).maybeSingle();
    if (existing) {
      ids.push(existing.id);
      continue;
    }
    const { data: inserted, error } = await sb
      .from(table)
      .insert({ slug, name })
      .select('id')
      .single();
    if (!error && inserted) ids.push(inserted.id);
  }
  return ids;
}

/**
 * Replace a content row's categories/tags with the provided name lists.
 * Missing categories/tags are created on the fly.
 */
export async function syncTaxonomy(
  supabase: CmsClient,
  contentId: string,
  categoryNames: string[] | undefined,
  tagNames: string[] | undefined,
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  if (categoryNames !== undefined) {
    const catIds = await upsertTerms(supabase, 'cms_categories', categoryNames);
    await sb.from('cms_content_categories').delete().eq('content_id', contentId);
    if (catIds.length) {
      await sb
        .from('cms_content_categories')
        .insert(catIds.map((category_id: string) => ({ content_id: contentId, category_id })));
    }
  }
  if (tagNames !== undefined) {
    const tagIds = await upsertTerms(supabase, 'cms_tags', tagNames);
    await sb.from('cms_content_tags').delete().eq('content_id', contentId);
    if (tagIds.length) {
      await sb
        .from('cms_content_tags')
        .insert(tagIds.map((tag_id: string) => ({ content_id: contentId, tag_id })));
    }
  }
}

// Invalidate the article caches + statically-rendered pages after a write.
// Next 16's revalidateTag takes a cache profile as its second argument.
const EXPIRE_NOW = { expire: 0 };
export function revalidateArticles(slug?: string): void {
  revalidateTag(CACHE_TAGS.articles, EXPIRE_NOW);
  if (slug) {
    revalidateTag(CACHE_TAGS.article(slug), EXPIRE_NOW);
    revalidatePath(`/articles/${slug}`);
  }
  revalidatePath('/articles');
  revalidatePath('/');
  revalidatePath('/sitemap.xml');
}

// Public route base per content type. Guides/outlook still render from the
// Markdown pipeline, so revalidating them is a no-op today but keeps the write
// path correct for when their reads migrate — and avoids busting the article
// caches on a non-article write.
const TYPE_PATH: Record<string, string> = {
  guide: '/guides',
  daily: '/thinking',
  weekly: '/thinking',
};

/** Revalidate the public surfaces for a content write, scoped to its type. */
export function revalidateContent(type: string | undefined, slug?: string): void {
  if (!type || type === 'article') {
    revalidateArticles(slug);
    return;
  }
  const base = TYPE_PATH[type];
  if (base) {
    revalidatePath(base);
    if (slug) revalidatePath(`${base}/${slug}`);
  }
  revalidatePath('/sitemap.xml');
}
