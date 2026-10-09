'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ExternalLink } from 'lucide-react';
import { useAdminApi, readError } from './useAdminApi';
import {
  AdminPage,
  Button,
  Callout,
  ConfirmSheet,
  ListGroup,
  ListRow,
  PageSkeleton,
  Switch,
  helpClass,
  inputClass,
  labelClass,
  sectionClass as cardClass,
  selectClass,
  useToast,
} from './ui';
import {
  AD_NETWORKS,
  ADVERTISER_CATEGORIES,
  PROGRAM_STATUSES,
  type AdNetwork,
  type AdvertiserCategory,
  type ProgramStatus,
} from '@/lib/ads/types';
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
  program_status: ProgramStatus;
  network: AdNetwork | '';
  /** YYYY-MM-DD, or '' when never verified. */
  terms_verified_at: string;
  disclosure_text: string;
  payout_note: string;
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
  program_status: 'draft',
  network: '',
  terms_verified_at: '',
  disclosure_text: '',
  payout_note: '',
};

const PROGRAM_STATUS_HELP: Record<ProgramStatus, string> = {
  draft: 'Not applied yet.',
  applied: 'Application sent; waiting to hear back.',
  approved: 'Approved — its campaigns may show offers once everything else is filled in.',
  paused: 'On hold; nothing shows.',
  rejected: 'The program said no; nothing shows.',
};


export default function AdvertiserEditor({ advertiserId }: { advertiserId?: string }) {
  const api = useAdminApi();
  const router = useRouter();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [slugTouched, setSlugTouched] = useState(false);
  const [loading, setLoading] = useState(Boolean(advertiserId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);

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
          program_status: advertiser.program_status ?? 'draft',
          network: advertiser.network ?? '',
          terms_verified_at: advertiser.terms_verified_at ? String(advertiser.terms_verified_at).slice(0, 10) : '',
          disclosure_text: advertiser.disclosure_text ?? '',
          payout_note: advertiser.payout_note ?? '',
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
        program_status: form.program_status,
        network: form.network || null,
        terms_verified_at: form.terms_verified_at ? `${form.terms_verified_at}T00:00:00Z` : null,
        disclosure_text: form.disclosure_text.trim() || null,
        payout_note: form.payout_note.trim() || null,
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
        toast('Saved');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!advertiserId) return;
    setSaving(true);
    try {
      const res = await api(`/api/admin/ads/advertisers/${advertiserId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readError(res, 'Failed to delete'));
      toast('Advertiser deleted');
      router.push('/admin/ads/advertisers');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      setConfirmDelete(false);
      setSaving(false);
    }
  }

  const pageTitle = advertiserId ? 'Edit advertiser' : 'New advertiser';
  const back = { href: '/admin/ads/advertisers', label: 'Advertisers' };

  if (loading) {
    return (
      <AdminPage title={pageTitle} back={back}>
        <PageSkeleton rows={5} />
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title={form.name.trim() || pageTitle}
      back={back}
      subtitle={<span className="font-mono text-[13px] text-[var(--ad-label-3)]">{effectiveSlug || 'Set a name to generate a slug'}</span>}
      actions={[
        ...(advertiserId
          ? [{ label: 'New campaign', icon: Plus, href: `/admin/ads/campaigns/new?advertiser=${advertiserId}` }]
          : []),
        { label: 'Save', variant: 'primary' as const, onClick: onSave, loading: saving, textOnPhone: true },
      ]}
    >
      <div className="space-y-6">
        {error && <Callout tone="error">{error}</Callout>}

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
                <p className={helpClass}>Used in analytics events; keep it stable once campaigns are live.</p>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Affiliate URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    inputMode="url"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className={inputClass}
                    value={form.url}
                    onChange={(e) => set('url', e.target.value)}
                    placeholder="https://partner.example.com/ref/…"
                  />
                  {form.url && (
                    <a
                      href={form.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--ad-fill-strong)] text-[var(--ad-tint)]"
                      aria-label="Open affiliate URL"
                    >
                      <ExternalLink size={17} />
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
                <p className={helpClass}>{30 - form.cta.length} characters left. Creatives each carry their own CTA; this is the suggested default.</p>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Offer disclosure (optional)</label>
                <textarea
                  className={inputClass}
                  rows={3}
                  maxLength={500}
                  value={form.disclosure_text}
                  onChange={(e) => set('disclosure_text', e.target.value)}
                  placeholder="Leave empty to use the standard wording."
                />
                <p className={helpClass}>
                  Shown right next to the offer&apos;s button. Only fill this in if the program requires its own wording.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className={cardClass}>
              <label className={labelClass}>Category</label>
              <select className={selectClass} value={form.category} onChange={(e) => set('category', e.target.value as AdvertiserCategory)}>
                {ADVERTISER_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <div className="mt-4 flex min-h-[44px] items-center justify-between gap-3">
                <span className="text-[15px] font-semibold text-[var(--ad-label)]">Active</span>
                <Switch checked={form.is_active} onChange={(v) => set('is_active', v)} label="Advertiser active" />
              </div>
              <p className={helpClass}>Inactive advertisers stop serving every campaign, regardless of campaign status.</p>
            </div>
            <div className={cardClass}>
              <label className={labelClass}>Affiliate program</label>
              <select
                className={selectClass}
                value={form.program_status}
                onChange={(e) => set('program_status', e.target.value as ProgramStatus)}
              >
                {PROGRAM_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className={helpClass}>{PROGRAM_STATUS_HELP[form.program_status]}</p>
              <label className={`${labelClass} mt-4`}>Network</label>
              <select className={selectClass} value={form.network} onChange={(e) => set('network', e.target.value as AdNetwork | '')}>
                <option value="">—</option>
                {AD_NETWORKS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <label className={`${labelClass} mt-4`}>Terms verified on</label>
              <input
                type="date"
                className={inputClass}
                value={form.terms_verified_at}
                onChange={(e) => set('terms_verified_at', e.target.value)}
              />
              <p className={helpClass}>The day you checked the program&apos;s current terms yourself.</p>
              <label className={`${labelClass} mt-4`}>Payout note (internal)</label>
              <textarea
                className={inputClass}
                rows={3}
                maxLength={1000}
                value={form.payout_note}
                onChange={(e) => set('payout_note', e.target.value)}
                placeholder="What the program pays, in its own words."
              />
              <p className={helpClass}>Never shown to visitors and never used in any calculation.</p>
            </div>
            <div className={cardClass}>
              <label className={labelClass}>Notes</label>
              <textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Payout terms, contact, renewal dates…" />
            </div>
          </div>
        </div>

        {advertiserId && (
          <ListGroup>
            <ListRow title="Delete advertiser" destructive centered onClick={() => setConfirmDelete(true)} />
          </ListGroup>
        )}

        {/* Phones: a full-width save at the end of the form, under the thumb. */}
        <div className="lg:hidden">
          <Button variant="primary" size="lg" block loading={saving} onClick={onSave}>
            Save advertiser
          </Button>
        </div>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        busy={saving}
        title={`Delete ${form.name || 'this advertiser'}?`}
        message="Every campaign and creative attached to it is deleted too. This can't be undone."
        confirmLabel="Delete advertiser"
      />
    </AdminPage>
  );
}
