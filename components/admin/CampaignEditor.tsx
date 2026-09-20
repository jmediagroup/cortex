'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Copy, Loader2, Plus, Save, Trash2, X, Eye } from 'lucide-react';
import { useAdminApi, readError } from './useAdminApi';
import IABAd from '@/components/monetization/IABAd';
import {
  AD_FORMATS,
  AD_FORMAT_LABELS,
  AD_TIERS,
  CAMPAIGN_STATUSES,
  CREATIVE_LIMITS,
  TOOL_IDS,
  type AdFormat,
  type AdvertiserRow,
  type CampaignStatus,
  type PlacementRow,
  type ServedAd,
} from '@/lib/ads/types';

interface CreativeForm {
  localId: string;
  id?: string;
  format: AdFormat;
  headline: string;
  body: string;
  body_line2: string;
  cta: string;
  weight: number;
  is_active: boolean;
}

interface FormState {
  name: string;
  status: CampaignStatus;
  advertiser_id: string;
  placement_id: string;
  allTools: boolean;
  tool_ids: string[];
  exclude_tool_ids: string[];
  weight: number;
  priority: number;
  starts_at: string; // datetime-local
  ends_at: string; // datetime-local
  hide_for_tiers: string[];
  notes: string;
  creatives: CreativeForm[];
}

const EMPTY: FormState = {
  name: '',
  status: 'draft',
  advertiser_id: '',
  placement_id: '',
  allTools: true,
  tool_ids: [],
  exclude_tool_ids: [],
  weight: 1,
  priority: 0,
  starts_at: '',
  ends_at: '',
  hide_for_tiers: ['finance_pro'],
  notes: '',
  creatives: [],
};

const inputClass =
  'w-full rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--color-accent)] transition-colors';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)] mb-1.5';
const cardClass = 'rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5';

let localCounter = 0;
const newLocalId = () => `new-${Date.now().toString(36)}-${(localCounter += 1)}`;

/** ISO → value for <input type="datetime-local"> in the browser's zone. */
function isoToLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function localToIso(local: string): string | null {
  if (!local) return null;
  const d = new Date(local);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function Counter({ format, field, value }: { format: AdFormat; field: 'headline' | 'body' | 'cta'; value: string }) {
  const max = CREATIVE_LIMITS[format][field];
  const left = max - value.length;
  return (
    <span className={`text-[11px] tabular-nums ${left < 0 ? 'font-bold text-[var(--crimson-500)]' : 'text-[var(--text-tertiary)]'}`}>
      {value.length}/{max}
    </span>
  );
}

export default function CampaignEditor({
  campaignId,
  initialAdvertiserId,
}: {
  campaignId?: string;
  initialAdvertiserId?: string;
}) {
  const api = useAdminApi();
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ ...EMPTY, advertiser_id: initialAdvertiserId ?? '' });
  const [advertisers, setAdvertisers] = useState<AdvertiserRow[]>([]);
  const [placements, setPlacements] = useState<PlacementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [showExclude, setShowExclude] = useState(false);

  // Load reference data (+ the campaign when editing).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [advRes, plRes, campRes] = await Promise.all([
          api('/api/admin/ads/advertisers'),
          api('/api/admin/ads/placements'),
          campaignId ? api(`/api/admin/ads/campaigns/${campaignId}`) : Promise.resolve(null),
        ]);
        if (!advRes.ok) throw new Error(await readError(advRes, 'Failed to load advertisers'));
        if (!plRes.ok) throw new Error(await readError(plRes, 'Failed to load placements'));
        const advList: AdvertiserRow[] = (await advRes.json()).advertisers;
        const plList: PlacementRow[] = (await plRes.json()).placements;
        if (cancelled) return;
        setAdvertisers(advList);
        setPlacements(plList);

        if (campRes) {
          if (!campRes.ok) throw new Error(await readError(campRes, 'Failed to load campaign'));
          const { campaign } = await campRes.json();
          if (cancelled) return;
          const creatives: CreativeForm[] = (campaign.creatives ?? []).map(
            (c: { id: string; format: AdFormat; headline: string; body: string | null; body_line2: string | null; cta: string; weight: number; is_active: boolean }) => ({
              localId: c.id,
              id: c.id,
              format: c.format,
              headline: c.headline ?? '',
              body: c.body ?? '',
              body_line2: c.body_line2 ?? '',
              cta: c.cta ?? '',
              weight: c.weight ?? 1,
              is_active: c.is_active !== false,
            }),
          );
          setForm({
            name: campaign.name ?? '',
            status: campaign.status ?? 'draft',
            advertiser_id: campaign.advertiser_id ?? '',
            placement_id: campaign.placement_id ?? '',
            allTools: campaign.tool_ids === null,
            tool_ids: campaign.tool_ids ?? [],
            exclude_tool_ids: campaign.exclude_tool_ids ?? [],
            weight: campaign.weight ?? 1,
            priority: campaign.priority ?? 0,
            starts_at: isoToLocal(campaign.starts_at),
            ends_at: isoToLocal(campaign.ends_at),
            hide_for_tiers: campaign.hide_for_tiers ?? [],
            notes: campaign.notes ?? '',
            creatives,
          });
          setShowExclude((campaign.exclude_tool_ids ?? []).length > 0);
          setPreviewId(creatives[0]?.localId ?? null);
        } else {
          // Sensible defaults for a new campaign.
          setForm((f) => ({
            ...f,
            placement_id: f.placement_id || plList.find((p) => p.slug === 'tool-inline-top')?.id || plList[0]?.id || '',
            advertiser_id: f.advertiser_id || '',
          }));
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId, api]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const placement = placements.find((p) => p.id === form.placement_id) ?? null;
  const advertiser = advertisers.find((a) => a.id === form.advertiser_id) ?? null;
  const placementFormats: AdFormat[] = placement?.formats?.length ? placement.formats : [...AD_FORMATS];
  const otherFormats = AD_FORMATS.filter((f) => !placementFormats.includes(f));

  // ----- creatives ---------------------------------------------------------
  function updateCreative(localId: string, patch: Partial<CreativeForm>) {
    set(
      'creatives',
      form.creatives.map((c) => (c.localId === localId ? { ...c, ...patch } : c)),
    );
  }
  function addCreative(format: AdFormat) {
    const c: CreativeForm = {
      localId: newLocalId(),
      format,
      headline: '',
      body: '',
      body_line2: '',
      cta: advertiser?.cta ?? '',
      weight: 1,
      is_active: true,
    };
    set('creatives', [...form.creatives, c]);
    setPreviewId(c.localId);
  }
  function duplicateCreative(localId: string) {
    const src = form.creatives.find((c) => c.localId === localId);
    if (!src) return;
    const copy: CreativeForm = { ...src, id: undefined, localId: newLocalId() };
    const idx = form.creatives.findIndex((c) => c.localId === localId);
    const next = [...form.creatives];
    next.splice(idx + 1, 0, copy);
    set('creatives', next);
    setPreviewId(copy.localId);
  }
  function removeCreative(localId: string) {
    set(
      'creatives',
      form.creatives.filter((c) => c.localId !== localId),
    );
    if (previewId === localId) setPreviewId(null);
  }

  const previewCreative = form.creatives.find((c) => c.localId === previewId) ?? form.creatives[0] ?? null;
  const previewAd: ServedAd | null = useMemo(() => {
    if (!previewCreative) return null;
    return {
      campaignId: campaignId ?? null,
      creativeId: previewCreative.id ?? null,
      advertiser: {
        id: advertiser?.id ?? null,
        slug: advertiser?.slug ?? 'preview',
        name: advertiser?.name ?? 'Advertiser',
        url: advertiser?.url ?? '#',
      },
      format: previewCreative.format,
      headline: previewCreative.headline || 'Headline preview',
      body: previewCreative.body || undefined,
      bodyLine2: previewCreative.body_line2 || undefined,
      cta: previewCreative.cta || 'Call to action',
      weight: 1,
      priority: 0,
      hideForTiers: [],
    };
  }, [previewCreative, advertiser, campaignId]);

  // ----- save / delete -----------------------------------------------------
  function validateLocally(): string | null {
    if (!form.name.trim()) return 'Name is required';
    if (!form.advertiser_id) return 'Pick an advertiser';
    if (!form.placement_id) return 'Pick a placement';
    if (!form.allTools && form.tool_ids.length === 0) return 'Select at least one tool or enable "All tools"';
    for (const [i, c] of form.creatives.entries()) {
      const lim = CREATIVE_LIMITS[c.format];
      const label = `Creative #${i + 1} (${AD_FORMAT_LABELS[c.format]})`;
      if (!c.headline.trim()) return `${label}: headline is required`;
      if (c.headline.length > lim.headline) return `${label}: headline over ${lim.headline} characters`;
      if (!c.cta.trim()) return `${label}: CTA is required`;
      if (c.cta.length > lim.cta) return `${label}: CTA over ${lim.cta} characters`;
      if (lim.body > 0 && (c.body.length > lim.body || c.body_line2.length > lim.body)) {
        return `${label}: body lines must be ${lim.body} characters or fewer`;
      }
    }
    return null;
  }

  function buildPayload() {
    return {
      name: form.name.trim(),
      status: form.status,
      advertiser_id: form.advertiser_id,
      placement_id: form.placement_id,
      tool_ids: form.allTools ? null : form.tool_ids,
      exclude_tool_ids: form.exclude_tool_ids,
      weight: form.weight,
      priority: form.priority,
      starts_at: localToIso(form.starts_at),
      ends_at: localToIso(form.ends_at),
      hide_for_tiers: form.hide_for_tiers,
      notes: form.notes.trim() || null,
      creatives: form.creatives.map((c) => ({
        id: c.id,
        format: c.format,
        headline: c.headline.trim(),
        body: CREATIVE_LIMITS[c.format].body > 0 ? c.body.trim() || null : null,
        body_line2: CREATIVE_LIMITS[c.format].body > 0 ? c.body_line2.trim() || null : null,
        cta: c.cta.trim(),
        weight: c.weight,
        is_active: c.is_active,
      })),
    };
  }

  async function onSave() {
    const problem = validateLocally();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = buildPayload();
      const res = campaignId
        ? await api(`/api/admin/ads/campaigns/${campaignId}`, { method: 'PATCH', body: JSON.stringify(payload) })
        : await api('/api/admin/ads/campaigns', { method: 'POST', body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      if (!campaignId) {
        router.replace(`/admin/ads/campaigns/${json.id}`);
        router.refresh();
      } else {
        // Reload so new creatives pick up their database ids.
        const fresh = await api(`/api/admin/ads/campaigns/${campaignId}`);
        if (fresh.ok) {
          const { campaign } = await fresh.json();
          const creatives: CreativeForm[] = (campaign.creatives ?? []).map(
            (c: { id: string; format: AdFormat; headline: string; body: string | null; body_line2: string | null; cta: string; weight: number; is_active: boolean }) => ({
              localId: c.id,
              id: c.id,
              format: c.format,
              headline: c.headline ?? '',
              body: c.body ?? '',
              body_line2: c.body_line2 ?? '',
              cta: c.cta ?? '',
              weight: c.weight ?? 1,
              is_active: c.is_active !== false,
            }),
          );
          set('creatives', creatives);
          if (!creatives.some((c) => c.localId === previewId)) setPreviewId(creatives[0]?.localId ?? null);
        }
        setNotice('Saved. Public ad caches were revalidated.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!campaignId) return;
    if (!confirm('Delete this campaign and all of its creatives?')) return;
    setSaving(true);
    try {
      const res = await api(`/api/admin/ads/campaigns/${campaignId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readError(res, 'Failed to delete'));
      router.push('/admin/ads');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      setSaving(false);
    }
  }

  const toggleInList = (key: 'tool_ids' | 'exclude_tool_ids' | 'hide_for_tiers', value: string) => {
    const list = form[key];
    set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
      </div>
    );
  }

  const renderCreativeGroup = (format: AdFormat, muted = false) => {
    const list = form.creatives.filter((c) => c.format === format);
    const lim = CREATIVE_LIMITS[format];
    return (
      <div key={format} className={`${cardClass} ${muted ? 'opacity-70' : ''}`}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">{AD_FORMAT_LABELS[format]}</h2>
            <p className="text-xs text-[var(--text-tertiary)]">
              Headline ≤ {lim.headline} · CTA ≤ {lim.cta}
              {lim.body > 0 ? ` · body lines ≤ ${lim.body}` : ' · no body copy'}
              {muted && ' · not rendered by the selected placement'}
            </p>
          </div>
          <button onClick={() => addCreative(format)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]">
            <Plus size={14} /> Add creative
          </button>
        </div>
        {list.length === 0 && <p className="text-sm text-[var(--text-tertiary)]">No creatives for this format yet.</p>}
        <div className="space-y-3">
          {list.map((c) => {
            const isPreview = previewCreative?.localId === c.localId;
            return (
              <div
                key={c.localId}
                className={`rounded-[var(--radius-md)] border p-3 ${
                  isPreview ? 'border-[var(--color-accent)]' : 'border-[var(--border-primary)]'
                } ${c.is_active ? '' : 'opacity-60'}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                    <label className="inline-flex items-center gap-1.5 font-semibold">
                      <input type="checkbox" checked={c.is_active} onChange={(e) => updateCreative(c.localId, { is_active: e.target.checked })} />
                      Active
                    </label>
                    <label className="inline-flex items-center gap-1.5">
                      Weight
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        className="w-16 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-2 py-1 text-xs text-[var(--text-primary)]"
                        value={c.weight}
                        onChange={(e) => updateCreative(c.localId, { weight: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreviewId(c.localId)} className={`rounded p-1.5 ${isPreview ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'}`} aria-label="Preview creative" title="Preview">
                      <Eye size={15} />
                    </button>
                    <button onClick={() => duplicateCreative(c.localId)} className="rounded p-1.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Duplicate creative" title="Duplicate">
                      <Copy size={15} />
                    </button>
                    <button onClick={() => removeCreative(c.localId)} className="rounded p-1.5 text-[var(--text-tertiary)] hover:text-[var(--crimson-500)]" aria-label="Remove creative" title="Remove">
                      <X size={15} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className={`${labelClass} mb-0`}>Headline</label>
                      <Counter format={format} field="headline" value={c.headline} />
                    </div>
                    <input className={inputClass} value={c.headline} onChange={(e) => updateCreative(c.localId, { headline: e.target.value })} placeholder="Your calculator shows the goal. We show the leaks." />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className={`${labelClass} mb-0`}>CTA</label>
                      <Counter format={format} field="cta" value={c.cta} />
                    </div>
                    <input className={inputClass} value={c.cta} onChange={(e) => updateCreative(c.localId, { cta: e.target.value })} placeholder="Try it free" />
                  </div>
                  {lim.body > 0 && (
                    <>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label className={`${labelClass} mb-0`}>Body</label>
                          <Counter format={format} field="body" value={c.body} />
                        </div>
                        <input className={inputClass} value={c.body} onChange={(e) => updateCreative(c.localId, { body: e.target.value })} placeholder="First line of supporting copy" />
                      </div>
                      <div>
                        <div className="mb-1 flex items-center justify-between">
                          <label className={`${labelClass} mb-0`}>Body line 2</label>
                          <Counter format={format} field="body" value={c.body_line2} />
                        </div>
                        <input className={inputClass} value={c.body_line2} onChange={(e) => updateCreative(c.localId, { body_line2: e.target.value })} placeholder="Optional second line" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/ads" className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            <ArrowLeft size={12} /> Ads
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">{campaignId ? 'Edit campaign' : 'New campaign'}</h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)] font-medium">
            {advertiser?.name ?? 'No advertiser'} · {placement?.name ?? 'No placement'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {campaignId && (
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="space-y-6 min-w-0">
          <div className={cardClass}>
            <label className={labelClass}>Campaign name</label>
            <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="SoFi — inline top" />
          </div>

          {/* Live preview */}
          <div className={cardClass}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-bold text-[var(--text-primary)]">Live preview</h2>
              {previewCreative && (
                <span className="text-xs text-[var(--text-tertiary)]">{AD_FORMAT_LABELS[previewCreative.format]}</span>
              )}
            </div>
            {previewAd ? (
              <div className="flex justify-center overflow-x-auto rounded-[var(--radius-md)] bg-[var(--surface-secondary)] p-6">
                <IABAd creative={previewAd} onClick={() => {}} />
              </div>
            ) : (
              <p className="text-sm text-[var(--text-tertiary)]">Add a creative to see it rendered exactly as it appears on the site.</p>
            )}
            {previewAd && (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">Preview links open the advertiser URL in a new tab; no events are recorded here.</p>
            )}
          </div>

          {placementFormats.map((f) => renderCreativeGroup(f))}
          {otherFormats.filter((f) => form.creatives.some((c) => c.format === f)).map((f) => renderCreativeGroup(f, true))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className={cardClass}>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={(e) => set('status', e.target.value as CampaignStatus)}>
              {CAMPAIGN_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">Only <strong>active</strong> campaigns inside their schedule are served.</p>

            <label className={`${labelClass} mt-4`}>Advertiser</label>
            <select className={inputClass} value={form.advertiser_id} onChange={(e) => set('advertiser_id', e.target.value)}>
              <option value="">Select…</option>
              {advertisers.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.is_active ? '' : ' (inactive)'}
                </option>
              ))}
            </select>

            <label className={`${labelClass} mt-4`}>Placement</label>
            <select className={inputClass} value={form.placement_id} onChange={(e) => set('placement_id', e.target.value)}>
              <option value="">Select…</option>
              {placements.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.slug})
                </option>
              ))}
            </select>
            {placement && (
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                Renders {placement.formats.map((f) => AD_FORMAT_LABELS[f]).join(' / ')}; rotates every {Math.round(placement.rotation_interval_ms / 1000)}s.
              </p>
            )}
          </div>

          <div className={cardClass}>
            <label className={labelClass}>Tools</label>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
              <input type="checkbox" checked={form.allTools} onChange={(e) => set('allTools', e.target.checked)} />
              All tools
            </label>
            {!form.allTools && (
              <div className="mt-3 grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
                {TOOL_IDS.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" checked={form.tool_ids.includes(t)} onChange={() => toggleInList('tool_ids', t)} />
                    {t}
                  </label>
                ))}
              </div>
            )}
            <button onClick={() => setShowExclude((v) => !v)} className="mt-3 text-xs font-semibold text-[var(--color-accent)]">
              {showExclude ? 'Hide exclusions' : `Exclude tools${form.exclude_tool_ids.length ? ` (${form.exclude_tool_ids.length})` : ''}`}
            </button>
            {showExclude && (
              <div className="mt-2 grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {TOOL_IDS.map((t) => (
                  <label key={t} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <input type="checkbox" checked={form.exclude_tool_ids.includes(t)} onChange={() => toggleInList('exclude_tool_ids', t)} />
                    {t}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className={cardClass}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Weight</label>
                <input type="number" min={1} max={1000} className={inputClass} value={form.weight} onChange={(e) => set('weight', Math.max(1, parseInt(e.target.value, 10) || 1))} />
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <input type="number" className={inputClass} value={form.priority} onChange={(e) => set('priority', parseInt(e.target.value, 10) || 0)} />
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">
              Weight sets how often this campaign is the first ad shown; priority orders the rotation (higher first).
            </p>
            <label className={`${labelClass} mt-4`}>Starts</label>
            <input type="datetime-local" className={inputClass} value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
            <label className={`${labelClass} mt-4`}>Ends</label>
            <input type="datetime-local" className={inputClass} value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">Leave blank for always-on.</p>
          </div>

          <div className={cardClass}>
            <label className={labelClass}>Hide for tiers</label>
            {AD_TIERS.map((t) => (
              <label key={t} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <input type="checkbox" checked={form.hide_for_tiers.includes(t)} onChange={() => toggleInList('hide_for_tiers', t)} />
                {t}
              </label>
            ))}
            <p className="mt-2 text-xs text-[var(--text-tertiary)]">Pro subscribers are ad-free by default; guests always see ads.</p>
          </div>

          <div className={cardClass}>
            <label className={labelClass}>Notes</label>
            <textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes" />
          </div>
        </div>
      </div>
    </div>
  );
}
