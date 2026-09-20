'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Trash2, Plus, ExternalLink } from 'lucide-react';
import { useAdminApi, readError } from './useAdminApi';
import { ADVERTISER_CATEGORIES, type AdvertiserCategory } from '@/lib/ads/types';
import { slugify } from '@/lib/ads/validation';

interface FormState {
  slug: string;
  name: string;
  url: string;
  category: AdvertiserCategory;
  tagline: string;
  description: string;
  cta: string;
  is_active: boolean;
  notes: string;
}

const EMPTY: FormState = {
  slug: '',
  name: '',
  url: '',
  category: 'banking',
  tagline: '',
  description: '',
  cta: '',
  is_active: true,
  notes: '',
};

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5';
const cardClass = 'rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5';

export default function AdvertiserEditor({ advertiserId }: { advertiserId?: string }) {
  const api = useAdminApi();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(Boolean(advertiserId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!advertiserId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api(`/api/admin/ads/advertisers/${advertiserId}`);
        if (!res.ok) throw new Error(await readError(res, 'Failed to load advertiser'));
        const { advertiser } = await res.json();
        if (cancelled) return;
        setForm({
          slug: advertiser.slug ?? '',
          name: advertiser.name ?? '',
          url: advertiser.url ?? '',
          category: advertiser.category ?? 'banking',
          tagline: advertiser.tagline ?? '',
          description: advertiser.description ?? '',
          cta: advertiser.cta ?? '',
          is_active: Boolean(advertiser.is_active),
          notes: advertiser.notes ?? '',
        });
        setSlugTouched(true);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load advertiser');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [advertiserId, api]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const effectiveSlug = slugTouched ? form.slug : slugify(form.name);

  async function onSave() {
    if (!form.name.trim() || !form.url.trim()) {
      setError('Name and URL are required');
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = {
        slug: effectiveSlug,
        name: form.name.trim(),
        url: form.url.trim(),
        category: form.category,
        tagline: form.tagline.trim() || null,
        description: form.description.trim() || null,
        cta: form.cta.trim() || null,
        is_active: form.is_active,
        notes: form.notes.trim() || null,
      };
      const res = advertiserId
        ? await api(`/api/admin/ads/advertisers/${advertiserId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api('/api/admin/ads/advertisers', { method: 'POST', body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      if (!advertiserId) {
        router.replace(`/admin/ads/advertisers/${json.id}`);
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
    if (!advertiserId) return;
    if (!confirm('Delete this advertiser? Every campaign and creative attached to it will be deleted too.')) return;
    setSaving(true);
    try {
      const res = await api(`/api/admin/ads/advertisers/${advertiserId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readError(res, 'Failed to delete'));
      router.push('/admin/ads/advertisers');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/ads/advertisers" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={12} /> Advertisers
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {advertiserId ? 'Edit advertiser' : 'New advertiser'}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)] font-medium">{effectiveSlug || 'Set a name to generate a slug'}</p>
        </div>
        <div className="flex items-center gap-2">
          {advertiserId && (
            <>
              <Link
                href={`/admin/ads/campaigns/new?advertiser=${advertiserId}`}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-primary)] px-3 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <Plus size={15} /> New campaign
              </Link>
              <button
                onClick={onDelete}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--crimson-border)] px-3 py-2 text-sm font-semibold text-[var(--crimson-500)] hover:bg-[var(--crimson-50)] disabled:opacity-50"
              >
                <Trash2 size={15} /> Delete
              </button>
            </>
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6 min-w-0">
          <div className={cardClass}>
            <label className={labelClass}>Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Rocket Money" />
            <div className="mt-4">
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', slugify(e.target.value));
                }}
                placeholder="rocket-money"
              />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">Used in analytics events; keep it stable once campaigns are live.</p>
            </div>
            <div className="mt-4">
              <label className={labelClass}>Affiliate URL</label>
              <div className="flex items-center gap-2">
                <input className={inputClass} value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://partner.example.com/ref/…" />
                {form.url && (
                  <a href={form.url} target="_blank" rel="noreferrer" className="text-[var(--text-tertiary)] hover:text-[var(--color-accent)]" aria-label="Open affiliate URL">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <label className={labelClass}>Tagline</label>
            <input className={inputClass} value={form.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="The money app that works for you" />
            <div className="mt-4">
              <label className={labelClass}>Description</label>
              <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Internal reference — not shown in ads." />
            </div>
            <div className="mt-4">
              <label className={labelClass}>Default CTA</label>
              <input className={inputClass} value={form.cta} onChange={(e) => set('cta', e.target.value.slice(0, 30))} placeholder="Try it free" />
              <p className="mt-1 text-xs text-[var(--text-tertiary)]">{30 - form.cta.length} characters left. Creatives each carry their own CTA; this is the suggested default.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={cardClass}>
            <label className={labelClass}>Category</label>
            <select className={inputClass} value={form.category} onChange={(e) => set('category', e.target.value as AdvertiserCategory)}>
              {ADVERTISER_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set('is_active', e.target.checked)} />
              Active
            </label>
            <p className="mt-1 text-xs text-[var(--text-tertiary)]">Inactive advertisers stop serving every campaign, regardless of campaign status.</p>
          </div>
          <div className={cardClass}>
            <label className={labelClass}>Notes</label>
            <textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Payout terms, contact, renewal dates…" />
          </div>
        </div>
      </div>
    </div>
  );
}
