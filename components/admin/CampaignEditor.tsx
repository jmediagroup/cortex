'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Plus, X, Eye } from 'lucide-react';
import { useAdminApi, readError } from './useAdminApi';
import {
  AdminPage,
  Button,
  Callout,
  ConfirmSheet,
  ListGroup,
  ListRow,
  PageSkeleton,
  checkRowClass,
  helpClass,
  inputClass,
  labelClass,
  sectionClass as cardClass,
  sectionTitleClass,
  selectClass,
  useToast,
} from './ui';
import IABAd from '@/components/monetization/IABAd';
import { OfferCard } from '@/components/offers/ResultOffer';
import { offerBlockers, offersEnabled } from '@/lib/offers/eligibility';
import {
  AD_FORMATS,
  AD_FORMAT_LABELS,
  AD_TIERS,
  CAMPAIGN_STATUSES,
  CREATIVE_LIMITS,
  POST_RESULT_PLACEMENT,
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
  tracking_url: string;
  sub_id_template: string;
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
  tracking_url: '',
  sub_id_template: '{tool_id}-{session_short}',
  creatives: [],
};


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
    <span className={`text-[12px] tabular-nums ${left < 0 ? 'font-bold text-[var(--ad-red)]' : 'text-[var(--ad-label-3)]'}`}>
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
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
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
            tracking_url: campaign.tracking_url ?? '',
            sub_id_template: campaign.sub_id_template ?? '',
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
  const isOfferPlacement = placement?.slug === POST_RESULT_PLACEMENT;
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

  // What still keeps this after-the-result offer from showing, against the
  // same rules the site applies (lib/offers/eligibility.ts), as currently edited.
  const offerIssues = useMemo(() => {
    if (!isOfferPlacement) return [];
    const offerCreatives = form.creatives.filter((c) => c.format === 'offer_card' && c.is_active);
    const base = {
      enabled: offersEnabled(),
      placementSlug: placement?.slug ?? null,
      advertiser: advertiser
        ? {
            id: advertiser.id,
            name: advertiser.name,
            is_active: advertiser.is_active,
            program_status: advertiser.program_status ?? 'draft',
            disclosure_text: advertiser.disclosure_text ?? null,
          }
        : null,
      campaign: {
        id: campaignId ?? 'new',
        slug: null,
        status: form.status,
        starts_at: localToIso(form.starts_at),
        ends_at: localToIso(form.ends_at),
        tracking_url: form.tracking_url.trim() || null,
        sub_id_template: form.sub_id_template.trim() || null,
        tool_ids: form.allTools ? null : form.tool_ids,
        hide_for_tiers: form.hide_for_tiers,
        weight: form.weight,
        priority: form.priority,
      },
    };
    const issues = new Set<string>();
    if (!offerCreatives.length) {
      offerBlockers({ ...base, creative: null }).forEach((r) => issues.add(r));
    } else {
      for (const c of offerCreatives) {
        offerBlockers({
          ...base,
          creative: { id: c.localId, format: c.format, headline: c.headline, body: c.body || null, cta: c.cta, weight: c.weight, is_active: c.is_active },
        }).forEach((r) => issues.add(r));
      }
    }
    return [...issues];
  }, [isOfferPlacement, form, placement, advertiser, campaignId]);

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
      tracking_url: form.tracking_url.trim() || null,
      sub_id_template: form.sub_id_template.trim() || null,
      creatives: form.creatives.map((c) => ({
        id: c.id,
        format: c.format,
        headline: c.headline.trim(),
        body: CREATIVE_LIMITS[c.format].body > 0 ? c.body.trim() || null : null,
        body_line2: CREATIVE_LIMITS[c.format].body > 0 && c.format !== 'offer_card' ? c.body_line2.trim() || null : null,
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
        toast('Saved · ad caches refreshed');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!campaignId) return;
    setSaving(true);
    try {
      const res = await api(`/api/admin/ads/campaigns/${campaignId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await readError(res, 'Failed to delete'));
      toast('Campaign deleted');
      router.push('/admin/ads');
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete');
      setConfirmDelete(false);
      setSaving(false);
    }
  }

  const toggleInList = (key: 'tool_ids' | 'exclude_tool_ids' | 'hide_for_tiers', value: string) => {
    const list = form[key];
    set(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const pageTitle = campaignId ? 'Edit campaign' : 'New campaign';
  const back = { href: '/admin/ads', label: 'Ads' };

  if (loading) {
    return (
      <AdminPage title={pageTitle} back={back}>
        <PageSkeleton rows={5} />
      </AdminPage>
    );
  }

  const renderCreativeGroup = (format: AdFormat, muted = false) => {
    const list = form.creatives.filter((c) => c.format === format);
    const lim = CREATIVE_LIMITS[format];
    return (
      <div key={format} className={`${cardClass} ${muted ? 'opacity-70' : ''}`}>
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className={`${sectionTitleClass} !mb-0.5`}>{AD_FORMAT_LABELS[format]}</h2>
            <p className="text-[13px] text-[var(--ad-label-3)]">
              Headline ≤ {lim.headline} · CTA ≤ {lim.cta}
              {lim.body > 0 ? ` · body lines ≤ ${lim.body}` : ' · no body copy'}
              {muted && ' · not rendered by the selected placement'}
            </p>
          </div>
          <Button size="sm" icon={Plus} onClick={() => addCreative(format)}>
            Add
          </Button>
        </div>
        {list.length === 0 && <p className="text-[14px] text-[var(--ad-label-3)]">No creatives for this format yet.</p>}
        <div className="space-y-3">
          {list.map((c) => {
            const isPreview = previewCreative?.localId === c.localId;
            return (
              <div
                key={c.localId}
                className={`rounded-[12px] bg-[var(--ad-bg)] p-3 ring-inset transition ${
                  isPreview ? 'ring-2 ring-[var(--sky)]' : 'ring-0'
                } ${c.is_active ? '' : 'opacity-60'}`}
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[var(--ad-label-2)]">
                    <label className="inline-flex min-h-[36px] cursor-pointer items-center gap-2 font-semibold">
                      <input type="checkbox" checked={c.is_active} onChange={(e) => updateCreative(c.localId, { is_active: e.target.checked })} />
                      Active
                    </label>
                    <label className="inline-flex items-center gap-2">
                      Weight
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        inputMode="numeric"
                        className="h-9 w-16 rounded-[8px] border-[0.5px] border-[var(--ad-sep-strong)] bg-white px-2 text-[16px] text-[var(--ad-label)] sm:text-[14px]"
                        value={c.weight}
                        onChange={(e) => updateCreative(c.localId, { weight: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPreviewId(c.localId)} className={`flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--ad-fill)] ${isPreview ? 'bg-[rgba(78,201,245,0.18)] text-[var(--ad-tint)]' : 'text-[var(--ad-label-3)] hover:text-[var(--ad-label)]'}`} aria-label="Preview creative" title="Preview">
                      <Eye size={17} />
                    </button>
                    <button onClick={() => duplicateCreative(c.localId)} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--ad-fill)] text-[var(--ad-label-3)] hover:text-[var(--ad-label)]" aria-label="Duplicate creative" title="Duplicate">
                      <Copy size={17} />
                    </button>
                    <button onClick={() => removeCreative(c.localId)} className="flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-[var(--ad-fill)] text-[var(--ad-label-3)] hover:text-[var(--ad-red)]" aria-label="Remove creative" title="Remove">
                      <X size={17} />
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
                      {format !== 'offer_card' && (
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <label className={`${labelClass} mb-0`}>Body line 2</label>
                            <Counter format={format} field="body" value={c.body_line2} />
                          </div>
                          <input className={inputClass} value={c.body_line2} onChange={(e) => updateCreative(c.localId, { body_line2: e.target.value })} placeholder="Optional second line" />
                        </div>
                      )}
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
    <AdminPage
      title={pageTitle}
      back={back}
      subtitle={`${advertiser?.name ?? 'No advertiser'} · ${placement?.name ?? 'No placement'}`}
      actions={[{ label: 'Save', variant: 'primary', onClick: onSave, loading: saving, textOnPhone: true }]}
    >
      <div className="space-y-6">
        {error && <Callout tone="error">{error}</Callout>}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Main column */}
          <div className="space-y-6 min-w-0">
            <div className={cardClass}>
              <label className={labelClass}>Campaign name</label>
              <input className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="SoFi — inline top" />
            </div>

            {isOfferPlacement && (
              <div className={cardClass}>
                <h2 className={sectionTitleClass}>Offer link</h2>
                <label className={labelClass}>Affiliate link</label>
                <input
                  className={inputClass}
                  value={form.tracking_url}
                  onChange={(e) => set('tracking_url', e.target.value)}
                  placeholder="<<PASTE_AFFILIATE_URL>>"
                />
                <p className={helpClass}>
                  Paste the link exactly as the network gives it. To pass a sub-ID, put <code>{'{sub_id}'}</code> where the
                  network&apos;s sub-ID parameter goes. Visitors never see this link; they go through /go/.
                </p>
                <label className={`${labelClass} mt-4`}>Sub-ID template</label>
                <input
                  className={inputClass}
                  value={form.sub_id_template}
                  onChange={(e) => set('sub_id_template', e.target.value)}
                  placeholder="{tool_id}-{session_short}"
                />
                <p className={helpClass}>
                  Only <code>{'{tool_id}'}</code> and <code>{'{session_short}'}</code> (a short hash — no personal data).
                </p>
                <div
                  className={`mt-4 rounded-[12px] px-4 py-3 text-[14px] ${
                    offerIssues.length
                      ? 'bg-[rgba(176,115,10,0.09)] text-[var(--ad-label-2)]'
                      : 'bg-[rgba(29,128,114,0.09)] text-[#14594f]'
                  }`}
                >
                  {offerIssues.length ? (
                    <>
                      <p className="mb-1 font-bold text-[var(--ad-label)]">Not showing on the site yet, because:</p>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {offerIssues.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="font-bold">Ready: once saved, this offer can show after a result on its tools.</p>
                  )}
                </div>
              </div>
            )}

            {/* Live preview */}
            <div className={cardClass}>
              <div className="mb-3 flex items-baseline justify-between gap-3">
                <h2 className={`${sectionTitleClass} !mb-0`}>Live preview</h2>
                {previewCreative && (
                  <span className="truncate text-[13px] text-[var(--ad-label-3)]">{AD_FORMAT_LABELS[previewCreative.format]}</span>
                )}
              </div>
              {previewAd && previewCreative?.format === 'offer_card' ? (
                <div className="rounded-[12px] bg-[var(--ad-bg)] p-3 sm:p-6">
                  <OfferCard
                    offer={{
                      advertiserName: previewAd.advertiser.name,
                      headline: previewAd.headline,
                      body: previewAd.body ?? null,
                      cta: previewAd.cta,
                      disclosure: advertiser?.disclosure_text ?? null,
                    }}
                    href="#"
                  />
                </div>
              ) : previewAd ? (
                <div className="flex justify-center overflow-x-auto rounded-[12px] bg-[var(--ad-bg)] p-3 sm:p-6">
                  <IABAd creative={previewAd} onClick={() => {}} />
                </div>
              ) : (
                <p className="text-[14px] text-[var(--ad-label-3)]">Add a creative to see it rendered exactly as it appears on the site.</p>
              )}
              {previewAd && (
                <p className={helpClass}>Preview links open the advertiser URL in a new tab; no events are recorded here.</p>
              )}
            </div>

            {placementFormats.map((f) => renderCreativeGroup(f))}
            {otherFormats.filter((f) => form.creatives.some((c) => c.format === f)).map((f) => renderCreativeGroup(f, true))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className={cardClass}>
              <label className={labelClass}>Status</label>
              <select className={selectClass} value={form.status} onChange={(e) => set('status', e.target.value as CampaignStatus)}>
                {CAMPAIGN_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <p className={helpClass}>Only <strong>active</strong> campaigns inside their schedule are served.</p>

              <label className={`${labelClass} mt-4`}>Advertiser</label>
              <select className={selectClass} value={form.advertiser_id} onChange={(e) => set('advertiser_id', e.target.value)}>
                <option value="">Select…</option>
                {advertisers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                    {a.is_active ? '' : ' (inactive)'}
                  </option>
                ))}
              </select>

              <label className={`${labelClass} mt-4`}>Placement</label>
              <select className={selectClass} value={form.placement_id} onChange={(e) => set('placement_id', e.target.value)}>
                <option value="">Select…</option>
                {placements.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.slug})
                  </option>
                ))}
              </select>
              {placement && (
                <p className={helpClass}>
                  Renders {placement.formats.map((f) => AD_FORMAT_LABELS[f]).join(' / ')}; rotates every {Math.round(placement.rotation_interval_ms / 1000)}s.
                </p>
              )}
            </div>

            <div className={cardClass}>
              <label className={labelClass}>Tools</label>
              <label className={`${checkRowClass} font-semibold`}>
                <input type="checkbox" checked={form.allTools} onChange={(e) => set('allTools', e.target.checked)} />
                All tools
              </label>
              {!form.allTools && (
                <div className="mt-2 grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:max-h-64 lg:grid-cols-1 lg:overflow-y-auto lg:pr-1">
                  {TOOL_IDS.map((t) => (
                    <label key={t} className={checkRowClass}>
                      <input type="checkbox" checked={form.tool_ids.includes(t)} onChange={() => toggleInList('tool_ids', t)} />
                      {t}
                    </label>
                  ))}
                </div>
              )}
              <button onClick={() => setShowExclude((v) => !v)} className="-ml-3 mt-2 inline-flex h-9 items-center rounded-full px-3 text-[14px] font-semibold text-[var(--ad-tint)] hover:bg-[var(--ad-fill)]">
                {showExclude ? 'Hide exclusions' : `Exclude tools${form.exclude_tool_ids.length ? ` (${form.exclude_tool_ids.length})` : ''}`}
              </button>
              {showExclude && (
                <div className="mt-2 grid grid-cols-1 gap-x-4 sm:grid-cols-2 lg:max-h-48 lg:grid-cols-1 lg:overflow-y-auto lg:pr-1">
                  {TOOL_IDS.map((t) => (
                    <label key={t} className={checkRowClass}>
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
                  <input type="number" inputMode="numeric" min={1} max={1000} className={inputClass} value={form.weight} onChange={(e) => set('weight', Math.max(1, parseInt(e.target.value, 10) || 1))} />
                </div>
                <div>
                  <label className={labelClass}>Priority</label>
                  <input type="number" inputMode="numeric" className={inputClass} value={form.priority} onChange={(e) => set('priority', parseInt(e.target.value, 10) || 0)} />
                </div>
              </div>
              <p className={helpClass}>
                Weight sets how often this campaign is the first ad shown; priority orders the rotation (higher first).
              </p>
              <label className={`${labelClass} mt-4`}>Starts</label>
              <input type="datetime-local" className={inputClass} value={form.starts_at} onChange={(e) => set('starts_at', e.target.value)} />
              <label className={`${labelClass} mt-4`}>Ends</label>
              <input type="datetime-local" className={inputClass} value={form.ends_at} onChange={(e) => set('ends_at', e.target.value)} />
              <p className={helpClass}>Leave blank for always-on.</p>
            </div>

            <div className={cardClass}>
              <label className={labelClass}>Hide for tiers</label>
              {AD_TIERS.map((t) => (
                <label key={t} className={checkRowClass}>
                  <input type="checkbox" checked={form.hide_for_tiers.includes(t)} onChange={() => toggleInList('hide_for_tiers', t)} />
                  {t}
                </label>
              ))}
              <p className={helpClass}>Pro subscribers are ad-free by default; guests always see ads.</p>
            </div>

            <div className={cardClass}>
              <label className={labelClass}>Notes</label>
              <textarea className={inputClass} rows={4} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Internal notes" />
            </div>
          </div>
        </div>

        {campaignId && (
          <ListGroup>
            <ListRow title="Delete campaign" destructive centered onClick={() => setConfirmDelete(true)} />
          </ListGroup>
        )}

        {/* Phones: a full-width save at the end of the form, under the thumb. */}
        <div className="lg:hidden">
          <Button variant="primary" size="lg" block loading={saving} onClick={onSave}>
            Save campaign
          </Button>
        </div>
      </div>

      <ConfirmSheet
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={onDelete}
        busy={saving}
        title={`Delete “${form.name || 'this campaign'}”?`}
        message="The campaign and all of its creatives are removed. This can't be undone."
        confirmLabel="Delete campaign"
      />
    </AdminPage>
  );
}
