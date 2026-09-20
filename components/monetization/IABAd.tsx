'use client';

import type { ServedAd } from '@/lib/ads/types';
import { splitHighlightSegments } from '@/lib/ads/select';

interface IABAdProps {
  creative: ServedAd;
  onClick?: () => void;
  className?: string;
}

/**
 * Highlight money amounts / percentages in green. Renders React nodes, so
 * admin-entered copy can never inject markup.
 */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {splitHighlightSegments(text).map((seg, i) =>
        seg.highlight ? (
          <span key={i} className="text-[var(--emerald-500)] font-semibold">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </>
  );
}

const ctaStyle = { boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderRadius: '6px' } as const;
const fontStyle = { fontFamily: 'Inter, system-ui, sans-serif' } as const;

/**
 * IAB-Compliant Ad Component - Financial Minimalist Design
 *
 * Purely presentational: takes one served creative and renders it in its
 * IAB size. Visibility, rotation and tracking live in AdSlot.
 *
 * Supports standard IAB ad sizes:
 * - 300x250 (Medium Rectangle): Best for sidebars
 * - 728x90 (Leaderboard): Best for headers
 * - 320x100 (Large Mobile Banner): High-impact mobile
 * - 336x280 (Large Rectangle): Below results
 */
export default function IABAd({ creative, onClick, className = '' }: IABAdProps) {
  const { advertiser, format } = creative;
  const linkProps = {
    href: advertiser.url,
    target: '_blank',
    rel: 'noopener noreferrer sponsored',
    onClick,
    style: fontStyle,
    'aria-label': `${creative.headline} — ${advertiser.name}`,
  } as const;

  // Medium Rectangle (300x250) / Large Rectangle (336x280) - F-Pattern Layout
  if (format === 'medium_rectangle' || format === 'large_rectangle') {
    const isLarge = format === 'large_rectangle';
    return (
      <a
        {...linkProps}
        className={`block ${
          isLarge ? 'w-full max-w-[336px] h-[280px]' : 'w-[300px] h-[250px]'
        } bg-[var(--bg-card)] border border-[#E0DBDB] rounded-md overflow-hidden hover:shadow-lg transition-shadow group ${className}`}
      >
        <div className={`h-full flex flex-col ${isLarge ? 'p-6' : 'p-5'}`}>
          <span className="text-[10px] text-[#48494A] uppercase tracking-wide font-normal">Sponsored</span>
          <div className="flex-1 flex flex-col justify-center mt-2">
            <h3
              className={`${isLarge ? 'text-xl' : 'text-lg'} font-semibold text-[var(--navy)] leading-tight tracking-tight mb-3`}
              style={{ letterSpacing: '-0.02em' }}
            >
              <Highlighted text={creative.headline} />
            </h3>
            <p className="text-sm text-[#3D5666] leading-relaxed">
              <Highlighted text={creative.body || ''} />
              {creative.bodyLine2 && (
                <>
                  <br />
                  <Highlighted text={creative.bodyLine2} />
                </>
              )}
            </p>
          </div>
          <div className="flex justify-end mt-4">
            <span
              className={`inline-block px-6 py-3 bg-[var(--orange)] hover:bg-[#d94f1e] text-white ${
                isLarge ? '' : 'text-sm '
              }font-semibold rounded-md transition-colors group-hover:bg-[#d94f1e]`}
              style={ctaStyle}
            >
              {creative.cta}
            </span>
          </div>
        </div>
      </a>
    );
  }

  // Leaderboard (728x90)
  if (format === 'leaderboard') {
    return (
      <a
        {...linkProps}
        className={`block w-full max-w-[728px] h-[90px] bg-[var(--bg-card)] border border-[#E0DBDB] rounded-md overflow-hidden hover:shadow-lg transition-shadow group ${className}`}
      >
        <div className="h-full flex items-center justify-between px-6 gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <span className="text-[10px] text-[#48494A] uppercase tracking-wide font-normal shrink-0">Ad</span>
            <p
              className="text-[var(--navy)] font-medium text-sm lg:text-base truncate"
              style={{ letterSpacing: '-0.02em' }}
            >
              <Highlighted text={creative.headline} />
            </p>
          </div>
          <span
            className="shrink-0 px-6 py-3 bg-[var(--orange)] hover:bg-[#d94f1e] text-white text-sm font-semibold rounded-md transition-colors group-hover:bg-[#d94f1e]"
            style={ctaStyle}
          >
            {creative.cta}
          </span>
        </div>
      </a>
    );
  }

  // Mobile Banner (320x100)
  return (
    <a
      {...linkProps}
      className={`block w-full max-w-[320px] h-[100px] bg-[var(--bg-card)] border border-[#E0DBDB] rounded-md overflow-hidden hover:shadow-lg transition-shadow group mx-auto ${className}`}
    >
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <span className="text-[9px] text-[#48494A] uppercase tracking-wide font-normal mb-1">Sponsored</span>
        <h3
          className="text-[15px] font-semibold text-[var(--navy)] mb-2 leading-tight"
          style={{ letterSpacing: '-0.02em' }}
        >
          <Highlighted text={creative.headline} />
        </h3>
        <span
          className="px-5 py-2 bg-[var(--orange)] hover:bg-[#d94f1e] text-white text-[13px] font-semibold rounded-md transition-colors group-hover:bg-[#d94f1e]"
          style={ctaStyle}
        >
          {creative.cta}
        </span>
      </div>
    </a>
  );
}
