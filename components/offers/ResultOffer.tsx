'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { getSessionId, trackEvent } from '@/lib/analytics';
import { POST_RESULT_PLACEMENT } from '@/lib/ads/types';
import { pickWeighted } from '@/lib/ads/select';
import {
  DEFAULT_OFFER_DISCLOSURE,
  offersEnabled,
  offersForViewer,
  type ServedOffer,
} from '@/lib/offers/eligibility';
import { useResultShown } from '@/components/app/ToolFunnel';

type CardOffer = Pick<ServedOffer, 'advertiserName' | 'headline' | 'body' | 'cta' | 'disclosure'>;

/**
 * The offer as the visitor sees it: framed as the next step, one CTA, and
 * the disclosure right beside it (standing rule 9). Presentational only —
 * the admin campaign editor previews creatives with it.
 */
export function OfferCard({ offer, href }: { offer: CardOffer; href: string }) {
  return (
    <aside
      aria-label={`Sponsored offer from ${offer.advertiserName}`}
      style={{
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        padding: 'clamp(18px, 3vw, 24px)',
      }}
    >
      <div className="eyebrow" style={{ color: 'var(--text-tertiary)', marginBottom: 8 }}>
        NEXT STEP · SPONSORED
      </div>
      <h2
        style={{
          fontSize: 'clamp(17px, 2.6vw, 19px)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          lineHeight: 1.3,
          margin: '0 0 6px',
        }}
      >
        {offer.headline}
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
        <strong style={{ color: 'var(--text-primary)' }}>{offer.advertiserName}</strong>
        {offer.body ? ` — ${offer.body}` : null}
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px 16px' }}>
        <a
          href={href}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="mgm-btn mgm-btn--primary mgm-btn--md"
          style={{ whiteSpace: 'nowrap' }}
        >
          {offer.cta} <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens {offer.advertiserName} in a new tab)</span>
        </a>
        <p style={{ flex: '1 1 260px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
          {offer.disclosure || DEFAULT_OFFER_DISCLOSURE}{' '}
          <Link href="/disclosure" style={{ color: 'var(--text-tertiary)', textDecoration: 'underline' }}>
            How we make money
          </Link>
        </p>
      </div>
    </aside>
  );
}

type Props = {
  toolId: string;
  /** The viewer's tier for hide_for_tiers: 'finance_pro', 'free', or null for guests. */
  tier: string | null;
  /** False until the viewer's tier is known, so a Pro user never sees a flash. */
  ready: boolean;
};

/**
 * One disclosed, contextual offer after a calculator result (Phase 1).
 * Renders nothing — and fetches nothing — while NEXT_PUBLIC_OFFERS_ENABLED
 * is off. Must sit inside <ToolFunnel>, which says when a result is showing.
 */
export default function ResultOffer(props: Props) {
  return offersEnabled() ? <LiveResultOffer {...props} /> : null;
}

function sendAdImpression(offer: ServedOffer, toolId: string) {
  const body = JSON.stringify({
    type: 'impression',
    campaignId: offer.campaignId,
    creativeId: offer.creativeId,
    advertiserId: offer.advertiserId,
    placement: POST_RESULT_PLACEMENT,
    toolId,
    format: 'offer_card',
    sessionId: getSessionId(),
    pagePath: window.location.pathname,
  });
  try {
    if (navigator.sendBeacon?.('/api/ads/events', body)) return;
    void fetch('/api/ads/events', { method: 'POST', body, keepalive: true }).catch(() => {});
  } catch {
    /* best effort */
  }
}

function LiveResultOffer({ toolId, tier, ready }: Props) {
  const resultShown = useResultShown();
  const [offer, setOffer] = useState<ServedOffer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);

  // Choose at most one offer for this page view once the viewer's tier is known.
  useEffect(() => {
    if (!ready) return;
    let active = true;
    fetch(`/api/offers?tool=${encodeURIComponent(toolId)}`)
      .then((res) => (res.ok ? res.json() : { offers: [] }))
      .then((json: { offers?: ServedOffer[] }) => {
        if (!active) return;
        const eligible = offersForViewer(Array.isArray(json.offers) ? json.offers : [], tier);
        setOffer(pickWeighted(eligible, (o) => o.weight));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [toolId, tier, ready]);

  // Reveal only after a result, and only where it can't push visible content:
  // at once if this spot is off-screen, otherwise as soon as it scrolls out of
  // view. Nothing the visitor is looking at ever moves (no layout shift).
  useEffect(() => {
    if (!resultShown || !offer || revealed || !anchor.current) return;
    const node = anchor.current;
    const offScreen = (rect: DOMRect) => rect.top >= window.innerHeight || rect.bottom <= 0;
    if (offScreen(node.getBoundingClientRect())) {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        setRevealed(true);
        observer.disconnect();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [resultShown, offer, revealed]);

  // Impression: at least half the card on screen for a second, once per page view.
  useEffect(() => {
    if (!revealed || !offer || !card.current || typeof IntersectionObserver === 'undefined') return;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          timer ??= setTimeout(() => {
            observer.disconnect();
            void trackEvent('offer_impression', {
              tool_id: toolId,
              campaign_slug: offer.ref,
              placement_slug: POST_RESULT_PLACEMENT,
            });
            sendAdImpression(offer, toolId);
          }, 1000);
        } else if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    observer.observe(card.current);
    return () => {
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [revealed, offer, toolId]);

  if (!offer) return null;
  if (!revealed) return <div ref={anchor} aria-hidden="true" />;

  const href = `/go/${encodeURIComponent(offer.ref)}?${new URLSearchParams({
    tool: toolId,
    s: getSessionId(),
    c: offer.creativeId,
  }).toString()}`;

  return (
    <div ref={card} style={{ marginTop: 32 }}>
      <OfferCard offer={offer} href={href} />
    </div>
  );
}
