import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { CACHE_TAGS } from '@/lib/wordpress/client';

// Secret token to prevent unauthorized revalidation requests
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

// Cache profile for revalidation - expire immediately
const REVALIDATE_NOW = { expire: 0 };

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (REVALIDATION_SECRET && token !== REVALIDATION_SECRET) {
      return NextResponse.json(
        { error: 'Invalid authorization token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, slug } = body;

    // Revalidate based on the type of content change
    switch (type) {
      case 'post_published':
      case 'post_updated':
      case 'post_deleted':
        // Revalidate the specific article and the articles list
        if (slug) {
          revalidateTag(CACHE_TAGS.article(slug), REVALIDATE_NOW);
          revalidatePath(`/articles/${slug}`, 'page');
        }
        revalidateTag(CACHE_TAGS.articles, REVALIDATE_NOW);
        revalidatePath('/articles', 'page');
        revalidatePath('/sitemap.xml', 'page');
        break;

      case 'all':
        // Revalidate everything
        revalidateTag(CACHE_TAGS.articles, REVALIDATE_NOW);
        revalidatePath('/articles', 'page');
        revalidatePath('/sitemap.xml', 'page');
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid revalidation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      revalidated: true,
      type,
      slug: slug || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Revalidation error:', error);
    return NextResponse.json(
      { error: 'Failed to revalidate' },
      { status: 500 }
    );
  }
}

// Also support GET for simple manual revalidation (with secret in query)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const secret = searchParams.get('secret');
  const type = searchParams.get('type') || 'all';
  const slug = searchParams.get('slug');

  if (REVALIDATION_SECRET && secret !== REVALIDATION_SECRET) {
    return NextResponse.json(
      { error: 'Invalid secret' },
      { status: 401 }
    );
  }

  // Revalidate based on params
  if (slug) {
    revalidateTag(CACHE_TAGS.article(slug), REVALIDATE_NOW);
    revalidatePath(`/articles/${slug}`, 'page');
  }

  if (type === 'all' || !slug) {
    revalidateTag(CACHE_TAGS.articles, REVALIDATE_NOW);
    revalidatePath('/articles', 'page');
    revalidatePath('/sitemap.xml', 'page');
  }

  return NextResponse.json({
    revalidated: true,
    type,
    slug: slug || null,
    timestamp: new Date().toISOString(),
  });
}
