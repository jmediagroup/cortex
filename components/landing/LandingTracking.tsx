'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { landingRef } from '@/lib/landing-pages';

/**
 * Fires one `landing_page_view` per page load with the slug and any UTM
 * parameters, so paid campaigns can be measured end to end against signups
 * (which carry `signup_source = lp-<slug>` in user metadata).
 */
export function LandingViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    void trackEvent('landing_page_view', {
      landing_slug: slug,
      utm_source: params.get('utm_source') ?? undefined,
      utm_medium: params.get('utm_medium') ?? undefined,
      utm_campaign: params.get('utm_campaign') ?? undefined,
      referrer: document.referrer || undefined,
    });
  }, [slug]);
  return null;
}

type CtaProps = {
  slug: string;
  /** Where on the page the CTA sits (for the click event). */
  location: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Override destination; defaults to /signup with attribution. */
  href?: string;
};

/** Signup link that records a `landing_cta_click` and carries `?ref=lp-<slug>`. */
export function LandingCtaLink({ slug, location, children, className, style, href }: CtaProps) {
  const ref = landingRef(slug);
  const target = href ?? `/signup?ref=${encodeURIComponent(ref)}`;
  return (
    <Link
      href={target}
      className={className}
      style={style}
      onClick={() => {
        void trackEvent('landing_cta_click', { landing_slug: slug, cta_location: location }, true);
      }}
    >
      {children}
    </Link>
  );
}
