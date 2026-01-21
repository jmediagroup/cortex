'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';
import { type AffiliateConfig } from './affiliates';
import { getAdCopy, type AdCopy } from './ad-copy';

type AdSize = 'medium-rectangle' | 'leaderboard' | 'mobile-banner' | 'large-rectangle';

interface IABAdProps {
  affiliate: AffiliateConfig;
  size: AdSize;
  variationIndex?: number;
  className?: string;
}

/**
 * IAB-Compliant Ad Component - Financial Minimalist Design
 *
 * Design System:
 * - Background: #FFFFFF (clean, trustworthy)
 * - Headline: #0F172A (Deep Navy - Slate 900)
 * - Body: #475569 (Mid-Slate)
 * - CTA: #2563EB (Trust Blue)
 * - Border: #E2E8F0 (Light Gray)
 * - Success/Bonus: #16A34A (Growth Green)
 *
 * Supports standard IAB ad sizes:
 * - 300x250 (Medium Rectangle): Best for sidebars
 * - 728x90 (Leaderboard): Best for headers
 * - 320x100 (Large Mobile Banner): High-impact mobile
 * - 336x280 (Large Rectangle): Below results
 */
export default function IABAd({
  affiliate,
  size,
  variationIndex,
  className = '',
}: IABAdProps) {
  const [showAd, setShowAd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adCopy, setAdCopy] = useState<AdCopy | null>(null);

  useEffect(() => {
    async function checkAdVisibility() {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setShowAd(true);
        setIsLoading(false);
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single<{ tier: Tier }>();

      const userTier = user?.tier || 'free';
      setShowAd(shouldShowAds(userTier, true));
      setIsLoading(false);
    }

    checkAdVisibility();
  }, []);

  // Get ad copy based on size
  useEffect(() => {
    const sizeMap: Record<AdSize, 'mediumRectangle' | 'leaderboard' | 'mobileBanner' | 'largeRectangle'> = {
      'medium-rectangle': 'mediumRectangle',
      'leaderboard': 'leaderboard',
      'mobile-banner': 'mobileBanner',
      'large-rectangle': 'largeRectangle',
    };

    const copy = getAdCopy(affiliate.id, sizeMap[size], variationIndex);
    setAdCopy(copy);
  }, [affiliate.id, size, variationIndex]);

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        affiliate_id: affiliate.id,
        affiliate_name: affiliate.name,
        ad_size: size,
        ad_headline: adCopy?.headline || '',
      });
    }
  };

  if (isLoading || !showAd || !adCopy) {
    return null;
  }

  // Helper to highlight numbers in green (for bonuses/cash back)
  const highlightNumbers = (text: string) => {
    return text.replace(/(\$[\d,]+(?:\.\d{2})?|\d+(?:\.\d+)?%)/g, '<span class="text-green-600 font-semibold">$1</span>');
  };

  // Medium Rectangle (300x250) - F-Pattern Layout
  if (size === 'medium-rectangle') {
    return (
      <a
        href={affiliate.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`block w-[300px] h-[250px] bg-white border border-[#E2E8F0] rounded-md overflow-hidden hover:shadow-lg transition-shadow group ${className}`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="h-full flex flex-col p-5">
          {/* Sponsored label - top left */}
          <span className="text-[10px] text-[#64748B] uppercase tracking-wide font-normal">
            Sponsored
          </span>

          {/* Content area - F-pattern: headline top-left, body below */}
          <div className="flex-1 flex flex-col justify-center mt-2">
            <h3
              className="text-lg font-semibold text-[#0F172A] leading-tight tracking-tight mb-3"
              style={{ letterSpacing: '-0.02em' }}
              dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.headline) }}
            />
            <p className="text-sm text-[#475569] leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.body || '') }} />
              {adCopy.bodyLine2 && (
                <>
                  <br />
                  <span dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.bodyLine2) }} />
                </>
              )}
            </p>
          </div>

          {/* CTA Button - bottom right aligned */}
          <div className="flex justify-end mt-4">
            <span
              className="inline-block px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors group-hover:bg-[#1D4ED8]"
              style={{
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                borderRadius: '6px'
              }}
            >
              {adCopy.cta}
            </span>
          </div>
        </div>
      </a>
    );
  }

  // Leaderboard (728x90)
  if (size === 'leaderboard') {
    return (
      <a
        href={affiliate.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`block w-full max-w-[728px] h-[90px] bg-white border border-[#E2E8F0] rounded-md overflow-hidden hover:shadow-lg transition-shadow group ${className}`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="h-full flex items-center justify-between px-6 gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-[10px] text-[#64748B] uppercase tracking-wide font-normal shrink-0">
              Ad
            </span>
            <p
              className="text-[#0F172A] font-medium text-sm lg:text-base truncate"
              style={{ letterSpacing: '-0.02em' }}
              dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.headline) }}
            />
          </div>
          <span
            className="shrink-0 px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold rounded-md transition-colors group-hover:bg-[#1D4ED8]"
            style={{
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              borderRadius: '6px'
            }}
          >
            {adCopy.cta}
          </span>
        </div>
      </a>
    );
  }

  // Mobile Banner (320x100)
  if (size === 'mobile-banner') {
    return (
      <a
        href={affiliate.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`block w-full max-w-[320px] h-[100px] bg-white border border-[#E2E8F0] rounded-md overflow-hidden hover:shadow-lg transition-shadow group mx-auto ${className}`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="h-full flex flex-col items-center justify-center p-4 text-center">
          <span className="text-[9px] text-[#64748B] uppercase tracking-wide font-normal mb-1">
            Sponsored
          </span>
          <h3
            className="text-[15px] font-semibold text-[#0F172A] mb-2 leading-tight"
            style={{ letterSpacing: '-0.02em' }}
            dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.headline) }}
          />
          <span
            className="px-5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold rounded-md transition-colors group-hover:bg-[#1D4ED8]"
            style={{
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              borderRadius: '6px'
            }}
          >
            {adCopy.cta}
          </span>
        </div>
      </a>
    );
  }

  // Large Rectangle (336x280) - F-Pattern Layout
  if (size === 'large-rectangle') {
    return (
      <a
        href={affiliate.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`block w-full max-w-[336px] h-[280px] bg-white border border-[#E2E8F0] rounded-md overflow-hidden hover:shadow-lg transition-shadow group ${className}`}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <div className="h-full flex flex-col p-6">
          {/* Sponsored label - top left */}
          <span className="text-[10px] text-[#64748B] uppercase tracking-wide font-normal">
            Sponsored
          </span>

          {/* Content area - F-pattern */}
          <div className="flex-1 flex flex-col justify-center mt-2">
            <h3
              className="text-xl font-semibold text-[#0F172A] leading-tight tracking-tight mb-3"
              style={{ letterSpacing: '-0.02em' }}
              dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.headline) }}
            />
            <p className="text-sm text-[#475569] leading-relaxed">
              <span dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.body || '') }} />
              {adCopy.bodyLine2 && (
                <>
                  <br />
                  <span dangerouslySetInnerHTML={{ __html: highlightNumbers(adCopy.bodyLine2) }} />
                </>
              )}
            </p>
          </div>

          {/* CTA Button - bottom right aligned */}
          <div className="flex justify-end mt-4">
            <span
              className="inline-block px-6 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold rounded-md transition-colors group-hover:bg-[#1D4ED8]"
              style={{
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                borderRadius: '6px'
              }}
            >
              {adCopy.cta}
            </span>
          </div>
        </div>
      </a>
    );
  }

  return null;
}
