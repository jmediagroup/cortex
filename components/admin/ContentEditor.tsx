'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Save,
  Trash2,
  Loader2,
  Eye,
  Pencil,
  ImagePlus,
  Plus,
  X,
  ExternalLink,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import {
  getContentTypeMeta,
  normalizeContentType,
  type ContentTypeKey,
} from '@/lib/cms/content-types';
import '@/app/articles/[slug]/article-styles.css';

type Status = 'draft' | 'published' | 'scheduled' | 'archived';

interface FaqItem {
  question: string;
  answer: string;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  body_markdown: string;
  status: Status;
  featured_image_url: string;
  featured_image_alt: string;
  author_name: string;
  categories: string; // comma-separated
  tags: string; // comma-separated
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_og_image: string;
  // article-only
  related_calculator: string;
  cta_text: string;
  cta_link: string;
  faq: FaqItem[];
  // guide-only
  topic: string;
  related_tools: string; // comma-separated
  // outlook-only (daily / weekly)
  tickers: string; // comma-separated
  sectors: string; // comma-separated
}

const EMPTY: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  body_markdown: '',
  status: 'draft',
  featured_image_url: '',
  featured_image_alt: '',
  author_name: 'Money Guy Mutants Team',
  categories: '',
  tags: '',
  seo_title: '',
  seo_description: '',
  seo_keywords: '',
  seo_og_image: '',
  related_calculator: '',
  cta_text: '',
  cta_link: '',
  faq: [],
  topic: '',
  related_tools: '',
  tickers: '',
  sectors: '',
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5';
const cardClass =
  'rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5';

const splitCsv = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

export default function ContentEditor({
  contentId,
  initialType = 'article',
}: {
  contentId?: string;
  initialType?: ContentTypeKey;
}) {
  const router = useRouter();
  const supabase = useRef(createBrowserClient()).current;
  const [form, setForm] = useState<FormState>(EMPTY);
  const [type, setType] = useState<ContentTypeKey>(initialType);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(Boolean(contentId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [previewHtml, setPreviewHtml] = useState('');
  const [uploadingFeatured, setUploadingFeatured] = useState(false);
  const [uploadingInline, setUploadingInline] = useState(false);

  const meta = getContentTypeMeta(type);
  const isArticle = type === 'article';
  const isGuide = type === 'guide';
  const isOutlook = type === 'daily' || type === 'weekly';

  const token = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? '';
  }, [supabase]);

  const api = useCallback(
    async (path: string, init: RequestInit = {}) => {
      const t = await token();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${t}`,
        ...(init.headers as Record<string, string> | undefined),
      };
      if (init.body && !(init.body instanceof FormData)) headers['Content-Type'] = 'application/json';
      return fetch(path, { ...init, headers });
    },
    [token],
  );

  // Load existing content into the form (edit mode).
  useEffect(() => {
    if (!contentId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api(`/api/admin/cms/content/${contentId}`);
        if (!res.ok) throw new Error((await res.json()).error || 'Failed to load');
        const { content } = await res.json();
        if (cancelled) return;
        const m = content.metadata ?? {};
        const csv = (v: unknown) => (Array.isArray(v) ? v.join(', ') : '');
        setType(normalizeContentType(content.type));
        setForm({
          title: content.title ?? '',
          slug: content.slug ?? '',
          excerpt: content.excerpt ?? '',
          body_markdown: content.body_markdown ?? '',
          status: content.status ?? 'draft',
          featured_image_url: content.featured_image_url ?? '',
          featured_image_alt: content.featured_image_alt ?? '',
          author_name: content.author_name ?? 'Money Guy Mutants Team',
          categories: (content.categories ?? []).join(', '),
          tags: (content.tags ?? []).join(', '),
          seo_title: content.seo_title ?? '',
          seo_description: content.seo_description ?? '',
          seo_keywords: content.seo_keywords ?? '',
          seo_og_image: content.seo_og_image ?? '',
          related_calculator: m.related_calculator ?? '',
          cta_text: m.cta?.text ?? '',
          cta_link: m.cta?.link ?? '',
          faq: Array.isArray(m.faq) ? m.faq : [],
          topic: m.topic ?? '',
          related_tools: csv(m.related_tools),
          tickers: csv(m.tickers),
          sectors: csv(m.sectors),
        });
        setSlugTouched(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contentId, api]);

  // Debounced live preview mirroring the production render pipeline.
  useEffect(() => {
    if (tab !== 'preview') return;
    const handle = setTimeout(async () => {
      try {
        const res = await api('/api/admin/cms/preview', {
          method: 'POST',
          body: JSON.stringify({ markdown: form.body_markdown }),
        });
        if (res.ok) setPreviewHtml((await res.json()).html);
      } catch {
        /* preview is best-effort */
      }
    }, 400);
    return () => clearTimeout(handle);
  }, [tab, form.body_markdown, api]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const effectiveSlug = slugTouched ? form.slug : slugify(form.title);

  async function uploadImage(file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api('/api/admin/cms/media', { method: 'POST', body: fd });
    if (!res.ok) {
      setError((await res.json()).error || 'Upload failed');
      return null;
    }
    return (await res.json()).url as string;
  }

  async function onFeaturedFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFeatured(true);
    setError(null);
    const url = await uploadImage(file);
    if (url) set('featured_image_url', url);
    setUploadingFeatured(false);
    e.target.value = '';
  }

  async function onInlineFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingInline(true);
    setError(null);
    const url = await uploadImage(file);
    if (url) {
      const snippet = `\n\n![${file.name.replace(/\.[^.]+$/, '')}](${url})\n\n`;
      set('body_markdown', form.body_markdown + snippet);
    }
    setUploadingInline(false);
    e.target.value = '';
  }

  function buildMetadata(): Record<string, unknown> {
    const metadata: Record<string, unknown> = {};
    if (isArticle) {
      if (form.faq.length) metadata.faq = form.faq.filter((f) => f.question.trim() && f.answer.trim());
      if (form.cta_text.trim() && form.cta_link.trim())
        metadata.cta = { text: form.cta_text.trim(), link: form.cta_link.trim() };
      if (form.related_calculator.trim()) metadata.related_calculator = form.related_calculator.trim();
    } else if (isGuide) {
      if (form.topic.trim()) metadata.topic = form.topic.trim();
      if (form.related_tools.trim()) metadata.related_tools = splitCsv(form.related_tools);
    } else if (isOutlook) {
      if (form.tickers.trim()) metadata.tickers = splitCsv(form.tickers);
      if (form.sectors.trim()) metadata.sectors = splitCsv(form.sectors);
    }
    return metadata;
  }

  function buildPayload() {
    return {
      type,
      title: form.title.trim(),
      slug: effectiveSlug,
      excerpt: form.excerpt.trim() || null,
      body_markdown: form.body_markdown,
      status: form.status,
      featured_image_url: form.featured_image_url.trim() || null,
      featured_image_alt: form.featured_image_alt.trim() || null,
      author_name: form.author_name.trim() || 'Money Guy Mutants Team',
      seo_title: form.seo_title.trim() || null,
      seo_description: form.seo_description.trim() || null,
      seo_keywords: form.seo_keywords.trim() || null,
      seo_og_image: form.seo_og_image.trim() || null,
      metadata: buildMetadata(),
      // Only taxonomy-backed types manage categories/tags; clear them otherwise.
      categories: meta.usesTaxonomy ? splitCsv(form.categories) : [],
      tags: meta.usesTaxonomy ? splitCsv(form.tags) : [],
    };
  }

  async function onSave() {
    if (!form.title.trim()) {
      setError('Title is required');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = buildPayload();
      const res = contentId
        ? await api(`/api/admin/cms/content/${contentId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await api('/api/admin/cms/content', {
            method: 'POST',
            body: JSON.stringify(payload),
          });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');

      if (!contentId) {
        router.replace(`/admin/content/${json.id}`);
        router.refresh();
      } else {
        setNotice('Saved.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!contentId) return;
    if (!confirm('Delete this content permanently?')) return;
    setSaving(true);
    try {
      const res = await api(`/api/admin/cms/content/${contentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed to delete');
      router.push('/admin/content');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
      </div>
    );
  }

  const typeLabel = meta.label.toLowerCase();
  const showLiveLink = meta.publicReadsFromDb && form.status === 'published' && effectiveSlug;

  return (
    <div className="space-y-6">
      {/* Header / actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
              style={{ backgroundColor: meta.badge.bg, color: meta.badge.color }}
            >
              {meta.short}
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
              {contentId ? `Edit ${typeLabel}` : `New ${typeLabel}`}
            </h1>
          </div>
          <p className="mt-1 text-sm text-[var(--text-tertiary)] font-medium">
            {effectiveSlug ? (
              <>
                {meta.pathPrefix}/{effectiveSlug}
                {showLiveLink && (
                  <a
                    href={`${meta.pathPrefix}/${effectiveSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 inline-flex items-center gap-1 text-[var(--color-accent)]"
                  >
                    view <ExternalLink size={11} />
                  </a>
                )}
              </>
            ) : (
              'Set a title to generate a slug'
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {contentId && (
            <button
              onClick={onDelete}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--crimson-border)] px-3 py-2 text-sm font-semibold text-[var(--crimson-500)] hover:bg-[var(--crimson-50)] disabled:opacity-50"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
          <button
            onClick={onSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-navy px-4 py-2 text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--crimson-border)] bg-[var(--crimson-50)] px-4 py-3 text-sm font-medium text-[var(--crimson-500)]">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)]">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
        {/* Main column */}
        <div className="space-y-6 min-w-0">
          <div className={cardClass}>
            <label className={labelClass}>Title</label>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder={
                isOutlook
                  ? 'Markets reopen at records; today’s flow story'
                  : 'How compound interest actually works'
              }
            />
            <div className="mt-4">
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
                placeholder="how-compound-interest-works"
              />
            </div>
            <div className="mt-4">
              <label className={labelClass}>{isArticle ? 'Excerpt' : 'Summary'}</label>
              <textarea
                className={inputClass}
                rows={2}
                value={form.excerpt}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="One or two sentences used in cards, search, and meta description."
              />
            </div>
          </div>

          {/* Body editor */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex rounded-[var(--radius-md)] border border-[var(--border-primary)] overflow-hidden">
                {(['write', 'preview'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                      tab === t
                        ? 'bg-navy text-white'
                        : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {t === 'write' ? <Pencil size={12} /> : <Eye size={12} />}
                    {t}
                  </button>
                ))}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)]">
                {uploadingInline ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                Insert image
                <input type="file" accept="image/*" className="hidden" onChange={onInlineFile} />
              </label>
            </div>

            {tab === 'write' ? (
              <textarea
                className={`${inputClass} font-mono`}
                style={{ minHeight: 420, lineHeight: 1.6 }}
                value={form.body_markdown}
                onChange={(e) => set('body_markdown', e.target.value)}
                placeholder="Write in Markdown. GitHub-flavored Markdown (tables, task lists) is supported."
              />
            ) : (
              <div
                className="article-content"
                style={{ minHeight: 420 }}
                dangerouslySetInnerHTML={{ __html: previewHtml || '<p>Nothing to preview yet.</p>' }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className={cardClass}>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => set('status', e.target.value as Status)}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
            {meta.publicReadsFromDb ? (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Only <strong>published</strong> content is visible on the public site.
              </p>
            ) : (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Managed here in the CMS. Public {meta.pathPrefix} pages still render from the existing
                content pipeline until that read path is migrated.
              </p>
            )}
          </div>

          <div className={cardClass}>
            <label className={labelClass}>Featured image</label>
            {form.featured_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.featured_image_url}
                alt={form.featured_image_alt || 'Featured'}
                className="mb-2 w-full rounded-[var(--radius-md)] border border-[var(--border-primary)] object-cover"
                style={{ maxHeight: 140 }}
              />
            ) : null}
            <label className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border-primary)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:border-[var(--color-accent)]">
              {uploadingFeatured ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <ImagePlus size={14} />
              )}
              {form.featured_image_url ? 'Replace image' : 'Upload image'}
              <input type="file" accept="image/*" className="hidden" onChange={onFeaturedFile} />
            </label>
            {form.featured_image_url && (
              <input
                className={`${inputClass} mt-2`}
                value={form.featured_image_alt}
                onChange={(e) => set('featured_image_alt', e.target.value)}
                placeholder="Alt text"
              />
            )}
          </div>

          {/* Taxonomy — articles & guides */}
          {meta.usesTaxonomy && (
            <div className={cardClass}>
              <label className={labelClass}>Categories</label>
              <input
                className={inputClass}
                value={form.categories}
                onChange={(e) => set('categories', e.target.value)}
                placeholder="Investing, Retirement"
              />
              <label className={`${labelClass} mt-4`}>Tags</label>
              <input
                className={inputClass}
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder="compound-interest, 401k"
              />
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Comma-separated. New ones are created automatically.
              </p>
            </div>
          )}

          {/* Guide-specific fields */}
          {isGuide && (
            <div className={cardClass}>
              <label className={labelClass}>Topic</label>
              <input
                className={inputClass}
                value={form.topic}
                onChange={(e) => set('topic', e.target.value)}
                placeholder="Debt payoff strategy (avalanche vs snowball)"
              />
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Used for dedup and internal topic tracking.
              </p>
              <label className={`${labelClass} mt-4`}>Related tools</label>
              <input
                className={inputClass}
                value={form.related_tools}
                onChange={(e) => set('related_tools', e.target.value)}
                placeholder="debt-paydown, budget, net-worth"
              />
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Comma-separated app slugs under <code>/apps/</code>.
              </p>
            </div>
          )}

          {/* Outlook-specific fields — daily & weekly */}
          {isOutlook && (
            <div className={cardClass}>
              <label className={labelClass}>Tickers</label>
              <input
                className={inputClass}
                value={form.tickers}
                onChange={(e) => set('tickers', e.target.value)}
                placeholder="SPCX, TSM, CMCSA"
              />
              <label className={`${labelClass} mt-4`}>Sectors</label>
              <input
                className={inputClass}
                value={form.sectors}
                onChange={(e) => set('sectors', e.target.value)}
                placeholder="semiconductors, industrials"
              />
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">Comma-separated.</p>
            </div>
          )}

          {/* Article-specific: related calculator + CTA */}
          {isArticle && (
            <div className={cardClass}>
              <label className={labelClass}>Related calculator</label>
              <input
                className={inputClass}
                value={form.related_calculator}
                onChange={(e) => set('related_calculator', e.target.value)}
                placeholder="compound-interest"
              />
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                An app slug under <code>/apps/</code>. Powers the &ldquo;try it yourself&rdquo; band.
              </p>
              <label className={`${labelClass} mt-4`}>CTA text</label>
              <input
                className={inputClass}
                value={form.cta_text}
                onChange={(e) => set('cta_text', e.target.value)}
                placeholder="Run your own numbers"
              />
              <label className={`${labelClass} mt-4`}>CTA link</label>
              <input
                className={inputClass}
                value={form.cta_link}
                onChange={(e) => set('cta_link', e.target.value)}
                placeholder="/apps/compound-interest"
              />
            </div>
          )}
        </div>
      </div>

      {/* FAQ — articles only */}
      {isArticle && (
        <div className={cardClass}>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text-primary)]">FAQ</h2>
            <button
              onClick={() => set('faq', [...form.faq, { question: '', answer: '' }])}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]"
            >
              <Plus size={14} /> Add question
            </button>
          </div>
          {form.faq.length === 0 && (
            <p className="text-sm text-[var(--text-tertiary)]">
              Optional. FAQ entries render on the article and emit FAQ schema.
            </p>
          )}
          <div className="space-y-3">
            {form.faq.map((item, i) => (
              <div key={i} className="rounded-[var(--radius-md)] border border-[var(--border-primary)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <input
                    className={inputClass}
                    value={item.question}
                    onChange={(e) => {
                      const faq = [...form.faq];
                      faq[i] = { ...faq[i], question: e.target.value };
                      set('faq', faq);
                    }}
                    placeholder="Question"
                  />
                  <button
                    onClick={() => set('faq', form.faq.filter((_, j) => j !== i))}
                    className="text-[var(--text-tertiary)] hover:text-[var(--crimson-500)]"
                    aria-label="Remove question"
                  >
                    <X size={16} />
                  </button>
                </div>
                <textarea
                  className={inputClass}
                  rows={2}
                  value={item.answer}
                  onChange={(e) => {
                    const faq = [...form.faq];
                    faq[i] = { ...faq[i], answer: e.target.value };
                    set('faq', faq);
                  }}
                  placeholder="Answer"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO */}
      <div className={cardClass}>
        <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">SEO overrides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Meta title</label>
            <input
              className={inputClass}
              value={form.seo_title}
              onChange={(e) => set('seo_title', e.target.value)}
              placeholder={`Defaults to the ${typeLabel} title`}
            />
          </div>
          <div>
            <label className={labelClass}>Keywords</label>
            <input
              className={inputClass}
              value={form.seo_keywords}
              onChange={(e) => set('seo_keywords', e.target.value)}
              placeholder="comma, separated"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Meta description</label>
            <textarea
              className={inputClass}
              rows={2}
              value={form.seo_description}
              onChange={(e) => set('seo_description', e.target.value)}
              placeholder="Defaults to the excerpt"
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>OG image URL</label>
            <input
              className={inputClass}
              value={form.seo_og_image}
              onChange={(e) => set('seo_og_image', e.target.value)}
              placeholder="Defaults to the featured image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
