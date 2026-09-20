'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';
import type { AdEventPayload, AdFormat, AdsResponse, ServedAd } from '@/lib/ads/types';
import { orderForRotation, pickWeighted } from '@/lib/ads/select';
import { buildFallbackAds, FALLBACK_ROTATION_MS } from '@/lib/ads/fallback';
import { useAdVisibility } from './AdProvider';
import IABAd from './IABAd';

interface AdSlotProps {
  placement: string;
  toolId: string;
  className?: string;
}

interface CampaignGroup {
  key: string;
  priority: number;
  weight: number;
  byFormat: Partial<Record<AdFormat, ServedAd[]>>;
}

const MIN_HEIGHT: Record<AdFormat, number> = {
  leaderboard: 90,
  mobile_banner: 100,
  medium_rectangle: 250,
  large_rectangle: 280,
};

const SESSION_KEY = 'mgm_ad_session';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const fresh =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem(SESSION_KEY, fresh);
    return fresh;
  } catch {
    return 'anon';
  }
}

function sendAdEvent(payload: AdEventPayload & { tier?: string | null }) {
  try {
    const body = JSON.stringify(payload);
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      if (navigator.sendBeacon('/api/ads/events', body)) return;
    }
    void fetch('/api/ads/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking is best-effort */
  }
}

function groupByCampaign(ads: ServedAd[]): CampaignGroup[] {
  const groups = new Map<string, CampaignGroup>();
  for (const ad of ads) {
    const key = ad.campaignId ?? `fallback:${ad.advertiser.slug}`;
    let g = groups.get(key);
    if (!g) {
      g = { key, priority: ad.priority, weight: 0, byFormat: {} };
      groups.set(key, g);
    }
    g.weight = Math.max(g.weight, ad.weight);
    (g.byFormat[ad.format] ??= []).push(ad);
  }
  return [...groups.values()];
}

/** Pick the desktop + mobile formats this slot renders from what is available. */
function chooseFormats(ads: ServedAd[]): { desktop: AdFormat; mobile: AdFormat } | null {
  const available = new Set(ads.map((a) => a.format));
  if (!available.size) return null;
  const prefer = (list: AdFormat[]) => list.find((f) => available.has(f));
  const desktop = prefer(['leaderboard', 'large_rectangle', 'medium_rectangle', 'mobile_banner'])!;
  const mobile = prefer(['mobile_banner', 'medium_rectangle', 'large_rectangle', 'leaderboard'])!;
  return { desktop, mobile };
}

// ---------------------------------------------------------------------------
// Impression tracking: ≥50% visible for ≥1s, once per creative per page view.
// ---------------------------------------------------------------------------

function TrackedAd({
  creative,
  onImpression,
  onClick,
}: {
  creative: ServedAd;
  onImpression: (creative: ServedAd) => void;
  onClick: (creative: ServedAd) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let fired = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (fired) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          if (!timer) {
            timer = setTimeout(() => {
              fired = true;
              onImpression(creative);
              observer.disconnect();
            }, 1000);
          }
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(node);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [creative, onImpression]);

  return (
    <div ref={ref} className="w-full flex justify-center">
      <IABAd creative={creative} onClick={() => onClick(creative)} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AdSlot
// ---------------------------------------------------------------------------

/**
 * A placement on the page. Fetches the live campaigns for `placement` +
 * `toolId` (falling back to the legacy hard-coded config), picks a weighted
 * starting campaign, rotates through campaigns on the placement's interval,
 * and reports impressions/clicks.
 *
 * Renders both the desktop and mobile format (hidden/flex by breakpoint) so
 * the markup mirrors the original InlineAd behaviour.
 */
export default function AdSlot({ placement, toolId, className = '' }: AdSlotProps) {
  const ctx = useAdVisibility();
  const [selfVisibility, setSelfVisibility] = useState<{ showAds: boolean; tier: Tier | null; ready: boolean }>({
    showAds: false,
    tier: null,
    ready: false,
  });

  // Without an AdProvider above us (rare), resolve visibility locally.
  useEffect(() => {
    if (ctx.hasProvider) return;
    let active = true;
    (async () => {
      const supabase = createBrowserClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        setSelfVisibility({ showAds: true, tier: null, ready: true });
        return;
      }
      const { data: user } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single<{ tier: Tier }>();
      if (!active) return;
      const tier = user?.tier || 'free';
      setSelfVisibility({ showAds: shouldShowAds(tier, true), tier, ready: true });
    })();
    return () => {
      active = false;
    };
  }, [ctx.hasProvider]);

  const showAds = ctx.hasProvider ? ctx.showAds : selfVisibility.showAds;
  const tier = ctx.hasProvider ? ctx.tier : selfVisibility.tier;
  const ready = ctx.hasProvider ? ctx.ready : selfVisibility.ready;

  const [ads, setAds] = useState<ServedAd[] | null>(null);
  const [rotationMs, setRotationMs] = useState(FALLBACK_ROTATION_MS);
  const [index, setIndex] = useState(0);
  const impressed = useRef(new Set<string>());
  const sessionId = useRef<string>('');

  // Load ads once the viewer is known to be ad-eligible.
  useEffect(() => {
    if (!ready || !showAds) return;
    let cancelled = false;
    sessionId.current = getSessionId();

    (async () => {
      let served: ServedAd[] = [];
      let interval = FALLBACK_ROTATION_MS;
      try {
        const qs = new URLSearchParams({ placement, tool: toolId });
        const res = await fetch(`/api/ads?${qs.toString()}`);
        if (res.ok) {
          const json = (await res.json()) as AdsResponse;
          served = Array.isArray(json.ads) ? json.ads : [];
          if (json.rotationIntervalMs) interval = json.rotationIntervalMs;
        }
      } catch {
        /* fall through to the legacy config */
      }
      if (!served.length) served = buildFallbackAds(placement, toolId);
      if (cancelled) return;

      // Tier gating happens here because /api/ads is a public, cached read.
      const eligible = served.filter((ad) => !tier || !ad.hideForTiers?.includes(tier));
      setRotationMs(interval);
      setAds(eligible);
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, showAds, placement, toolId, tier]);

  const formats = useMemo(() => (ads ? chooseFormats(ads) : null), [ads]);

  // Build the rotation order once ads arrive: weighted-random starting
  // campaign (campaign weight × creative weight), then priority-ordered.
  const order = useMemo<CampaignGroup[]>(() => {
    if (!ads || !formats) return [];
    const groups = groupByCampaign(ads);
    if (!groups.length) return [];
    const ordered = orderForRotation(groups, (g) => g.priority, (g) => g.weight);
    const start = pickWeighted(ads, (a) => a.weight);
    const startKey = start ? (start.campaignId ?? `fallback:${start.advertiser.slug}`) : ordered[0].key;
    const startIdx = Math.max(0, ordered.findIndex((g) => g.key === startKey));
    return [...ordered.slice(startIdx), ...ordered.slice(0, startIdx)];
  }, [ads, formats]);

  // Rotate among distinct campaigns.
  useEffect(() => {
    if (order.length <= 1) return;
    const handle = setInterval(() => setIndex((i) => (i + 1) % order.length), rotationMs);
    return () => clearInterval(handle);
  }, [order.length, rotationMs]);

  // Pick one creative per format for the current campaign (re-rolled per visit).
  const safeIndex = order.length ? index % order.length : 0;
  const current = order[safeIndex];
  const picks = useMemo(() => {
    if (!current || !formats) return null;
    const pick = (format: AdFormat) => pickWeighted(current.byFormat[format] ?? [], (a) => a.weight);
    return { desktop: pick(formats.desktop), mobile: pick(formats.mobile) };
  }, [current, formats]);

  const eventBase = useCallback(
    (creative: ServedAd, type: AdEventPayload['type']): AdEventPayload & { tier?: string | null } => ({
      type,
      campaignId: creative.campaignId,
      creativeId: creative.creativeId,
      advertiserId: creative.advertiser.id,
      placement,
      toolId,
      format: creative.format,
      sessionId: sessionId.current || getSessionId(),
      pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
      tier: tier ?? null,
    }),
    [placement, toolId, tier],
  );

  const onImpression = useCallback(
    (creative: ServedAd) => {
      const key = creative.creativeId ?? `${creative.advertiser.slug}:${creative.format}:${creative.headline}`;
      if (impressed.current.has(key)) return;
      impressed.current.add(key);
      sendAdEvent(eventBase(creative, 'impression'));
    },
    [eventBase],
  );

  const onClick = useCallback(
    (creative: ServedAd) => {
      sendAdEvent(eventBase(creative, 'click'));
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'affiliate_click', {
          affiliate_id: creative.advertiser.slug,
          affiliate_name: creative.advertiser.name,
          ad_size: creative.format,
          ad_headline: creative.headline,
          ad_placement: placement,
          tool_id: toolId,
        });
      }
    },
    [eventBase, placement, toolId],
  );

  if (!ready || !showAds) return null;
  // Ads resolved to nothing (e.g. every campaign hidden for this tier).
  if (ads && ads.length === 0) return null;

  const desktopFormat = formats?.desktop ?? 'leaderboard';
  const mobileFormat = formats?.mobile ?? 'mobile_banner';
  const sameFormat = desktopFormat === mobileFormat;

  return (
    <div className={`w-full ${className}`} data-ad-placement={placement}>
      {/* Desktop */}
      <div
        className={`${sameFormat ? 'flex' : 'hidden md:flex'} justify-center`}
        style={{ minHeight: MIN_HEIGHT[desktopFormat] }}
      >
        {picks?.desktop && (
          <TrackedAd key={picks.desktop.creativeId ?? picks.desktop.headline} creative={picks.desktop} onImpression={onImpression} onClick={onClick} />
        )}
      </div>
      {/* Mobile */}
      {!sameFormat && (
        <div className="flex md:hidden justify-center" style={{ minHeight: MIN_HEIGHT[mobileFormat] }}>
          {picks?.mobile && (
            <TrackedAd key={picks.mobile.creativeId ?? picks.mobile.headline} creative={picks.mobile} onImpression={onImpression} onClick={onClick} />
          )}
        </div>
      )}
      {order.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {order.map((g, i) => (
            <button
              key={g.key}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === safeIndex ? 'bg-[var(--sky)] w-4' : 'bg-[#E2E8F0] hover:bg-[#CBD5E1]'
              }`}
              aria-label={`Show ad ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
