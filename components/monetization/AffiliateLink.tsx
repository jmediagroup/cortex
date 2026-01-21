'use client';

import { type AffiliateConfig } from './affiliates';

interface AffiliateLinkProps {
  affiliate: AffiliateConfig;
  variant?: 'inline' | 'button' | 'card';
  className?: string;
  children?: React.ReactNode;
}

/**
 * AffiliateLink Component
 *
 * Renders an affiliate link with proper tracking attributes.
 * Supports multiple display variants for different contexts.
 */
export default function AffiliateLink({
  affiliate,
  variant = 'inline',
  className = '',
  children,
}: AffiliateLinkProps) {
  const handleClick = () => {
    // Track affiliate click for analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'affiliate_click', {
        affiliate_id: affiliate.id,
        affiliate_name: affiliate.name,
        affiliate_category: affiliate.category,
      });
    }
  };

  if (variant === 'inline') {
    return (
      <a
        href={affiliate.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`text-indigo-400 hover:text-indigo-300 underline underline-offset-2 ${className}`}
      >
        {children || affiliate.name}
      </a>
    );
  }

  if (variant === 'button') {
    return (
      <a
        href={affiliate.url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors ${className}`}
      >
        {children || affiliate.cta || `Try ${affiliate.name}`}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  }

  // Card variant
  return (
    <a
      href={affiliate.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={handleClick}
      className={`block p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-indigo-500/50 hover:bg-slate-800 transition-all group ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-500 uppercase tracking-wide">Recommended</span>
          </div>
          <h4 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">
            {affiliate.name}
          </h4>
          {affiliate.tagline && (
            <p className="text-sm text-indigo-400 mt-0.5">{affiliate.tagline}</p>
          )}
          <p className="text-sm text-slate-400 mt-2">{affiliate.description}</p>
        </div>
        <div className="flex-shrink-0 p-2 bg-indigo-600/20 rounded-lg group-hover:bg-indigo-600/30 transition-colors">
          <svg
            className="w-5 h-5 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}

// Add gtag type declaration
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, string>) => void;
  }
}
