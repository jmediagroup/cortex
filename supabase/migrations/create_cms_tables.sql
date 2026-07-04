-- Custom CMS — core content tables + taxonomy + media bucket
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor).
--
-- Design notes:
--   * `cms_content` is content-type-generic (type = article | guide | daily | weekly)
--     so Guides/Thinking can move onto the same table in a later phase. Phase 1
--     only writes type='article'.
--   * `body_markdown` is the source of truth; the app renders it to HTML at read
--     time via lib/outlook/markdown.ts `renderMarkdown` (remark + gfm + html).
--   * Type-specific fields (article faq/cta/relatedCalculator, guide topic/tools,
--     thinking tickers/sectors) live in the `metadata` JSONB column.
--   * RLS: public may read PUBLISHED rows only; all writes flow through
--     service-role API routes (mirrors the outlook_* tables). The public data
--     layer additionally filters status='published' explicitly (defense in depth).

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. Core content table
-- ============================================================
create table if not exists public.cms_content (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'article'
    check (type in ('article', 'guide', 'daily', 'weekly')),
  slug text not null,
  title text not null,
  excerpt text,
  body_markdown text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'published', 'scheduled', 'archived')),

  -- Featured image
  featured_image_url text,
  featured_image_alt text,
  featured_image_width integer,
  featured_image_height integer,

  -- Author (single-team authorship; a cms_authors table can come later)
  author_name text not null default 'Money Guy Mutants Team',
  author_slug text not null default 'money-guy-mutants-team',
  author_avatar text,
  author_bio text,

  -- SEO overrides (defaults are derived in the data layer when null)
  seo_title text,
  seo_description text,
  seo_keywords text,
  seo_og_title text,
  seo_og_description text,
  seo_og_image text,
  seo_canonical text,

  -- Type-specific fields: article -> { faq: [{question,answer}], cta: {text,link},
  -- related_calculator }, guide -> { topic, related_tools }, thinking -> { tickers, sectors }
  metadata jsonb not null default '{}'::jsonb,

  -- Optional manual reading-time override; computed from body when null
  reading_time integer,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (type, slug)
);

create index if not exists idx_cms_content_type_status
  on public.cms_content (type, status);
create index if not exists idx_cms_content_published_at
  on public.cms_content (published_at desc);
create index if not exists idx_cms_content_metadata
  on public.cms_content using gin (metadata);

-- Keep updated_at fresh (reuses the shared trigger function).
drop trigger if exists set_cms_content_updated_at on public.cms_content;
create trigger set_cms_content_updated_at
  before update on public.cms_content
  for each row execute function public.update_updated_at_column();

-- ============================================================
-- 2. Taxonomy: categories + tags
-- ============================================================
create table if not exists public.cms_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.cms_content_categories (
  content_id uuid not null references public.cms_content(id) on delete cascade,
  category_id uuid not null references public.cms_categories(id) on delete cascade,
  primary key (content_id, category_id)
);

create table if not exists public.cms_content_tags (
  content_id uuid not null references public.cms_content(id) on delete cascade,
  tag_id uuid not null references public.cms_tags(id) on delete cascade,
  primary key (content_id, tag_id)
);

-- content_id is the leading PK column; index the other FK for reverse lookups.
create index if not exists idx_cms_content_categories_category
  on public.cms_content_categories (category_id);
create index if not exists idx_cms_content_tags_tag
  on public.cms_content_tags (tag_id);

-- ============================================================
-- 3. Row Level Security
--   Public: read published content + all taxonomy. No write policies — writes
--   go through service-role API routes (service role bypasses RLS).
-- ============================================================
alter table public.cms_content enable row level security;
alter table public.cms_categories enable row level security;
alter table public.cms_tags enable row level security;
alter table public.cms_content_categories enable row level security;
alter table public.cms_content_tags enable row level security;

drop policy if exists "Public can read published content" on public.cms_content;
create policy "Public can read published content"
  on public.cms_content for select
  using (status = 'published');

drop policy if exists "Public can read categories" on public.cms_categories;
create policy "Public can read categories"
  on public.cms_categories for select using (true);

drop policy if exists "Public can read tags" on public.cms_tags;
create policy "Public can read tags"
  on public.cms_tags for select using (true);

drop policy if exists "Public can read content categories" on public.cms_content_categories;
create policy "Public can read content categories"
  on public.cms_content_categories for select using (true);

drop policy if exists "Public can read content tags" on public.cms_content_tags;
create policy "Public can read content tags"
  on public.cms_content_tags for select using (true);

-- ============================================================
-- 4. Media storage bucket (first use of Supabase Storage in this repo)
--   Public-read bucket; uploads happen only via the service-role media API route.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('cms-media', 'cms-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read cms-media" on storage.objects;
create policy "Public read cms-media"
  on storage.objects for select
  using (bucket_id = 'cms-media');

-- ============================================================
-- 5. Verify
-- ============================================================
-- select tablename, rowsecurity from pg_tables
--   where schemaname = 'public' and tablename like 'cms_%';
-- select id, public from storage.buckets where id = 'cms-media';
