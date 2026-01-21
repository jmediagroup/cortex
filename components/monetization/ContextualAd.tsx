'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';
import { getAffiliatesForContext } from './affiliates';
import AffiliateLink from './AffiliateLink';

interface ContextualAdProps {
  context: string;
  variant?: 'card' | 'banner' | 'sidebar';
  className?: string;
}

/**
 * ContextualAd Component
 *
 * Displays contextually relevant affiliate content based on the calculator/app.
 * Automatically handles visibility based on user tier (free/guest sees ads, paid users don't).
 */
export default function ContextualAd({
  context,
  variant = 'card',
  className = '',
}: ContextualAdProps) {
  const [showAd, setShowAd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdVisibility() {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Guest user - show ads
        setShowAd(true);
        setIsLoading(false);
        return;
      }

      // Logged in user - check their tier
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

  // Don't render anything while checking or if user shouldn't see ads
  if (isLoading || !showAd) {
    return null;
  }

  const affiliates = getAffiliatesForContext(context);

  if (!affiliates) {
    // No affiliates configured for this context
    return null;
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-slate-800/80 to-indigo-900/30 border border-slate-700/50 rounded-lg p-4 ${className}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Recommended Tool</p>
            <p className="text-white font-medium">{affiliates.primary.name}</p>
            <p className="text-sm text-slate-400 mt-1">{affiliates.primary.description}</p>
          </div>
          <AffiliateLink affiliate={affiliates.primary} variant="button" className="flex-shrink-0">
            Learn More
          </AffiliateLink>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div className={`space-y-3 ${className}`}>
        <p className="text-xs text-slate-500 uppercase tracking-wide">Recommended</p>
        <AffiliateLink affiliate={affiliates.primary} variant="card" />
        {affiliates.secondary && (
          <AffiliateLink affiliate={affiliates.secondary} variant="card" />
        )}
      </div>
    );
  }

  // Default card variant
  return (
    <div className={className}>
      <AffiliateLink affiliate={affiliates.primary} variant="card" />
    </div>
  );
}
