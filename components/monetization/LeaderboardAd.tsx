'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';
import { getAffiliatesForContext, type AffiliateConfig } from './affiliates';
import IABAd from './IABAd';

interface LeaderboardAdProps {
  context: string;
  className?: string;
}

/**
 * LeaderboardAd Component
 *
 * Displays a 728x90 Leaderboard ad above the fold.
 * Standard header placement that establishes professional credibility.
 * Best for: Page headers, above calculator content.
 */
export default function LeaderboardAd({
  context,
  className = '',
}: LeaderboardAdProps) {
  const [showAd, setShowAd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [affiliateList, setAffiliateList] = useState<AffiliateConfig[]>([]);

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

  // Set up affiliate list
  useEffect(() => {
    const affiliates = getAffiliatesForContext(context);
    if (affiliates) {
      if (affiliates.rotating && affiliates.rotating.length > 0) {
        setAffiliateList(affiliates.rotating);
        setCurrentIndex(Math.floor(Math.random() * affiliates.rotating.length));
      } else {
        setAffiliateList([affiliates.primary]);
      }
    }
  }, [context]);

  // Rotation effect - every 20 seconds for header
  useEffect(() => {
    if (affiliateList.length <= 1 || !showAd) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % affiliateList.length);
    }, 20000);

    return () => clearInterval(interval);
  }, [affiliateList.length, showAd]);

  if (isLoading || !showAd || affiliateList.length === 0) {
    return null;
  }

  const currentAffiliate = affiliateList[currentIndex];

  return (
    <div className={`flex justify-center ${className}`}>
      <IABAd
        affiliate={currentAffiliate}
        size="leaderboard"
        variationIndex={currentIndex}
      />
    </div>
  );
}
