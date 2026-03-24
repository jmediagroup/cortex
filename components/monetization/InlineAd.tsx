'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';
import { getAffiliatesForContext, type AffiliateConfig } from './affiliates';
import IABAd from './IABAd';

interface InlineAdProps {
  context: string;
  className?: string;
}

/**
 * InlineAd Component
 *
 * Displays a full-width leaderboard ad (728x90) inline above or below calculator content.
 * On mobile, falls back to a mobile banner (320x100).
 * Replaces StickySidebarAd for a better full-width calculator experience.
 *
 * For paying users (finance_pro, elite), returns null entirely.
 */
export default function InlineAd({
  context,
  className = '',
}: InlineAdProps) {
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

  // Rotation effect - every 15 seconds
  useEffect(() => {
    if (affiliateList.length <= 1 || !showAd) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % affiliateList.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [affiliateList.length, showAd]);

  if (isLoading || !showAd || affiliateList.length === 0) {
    return null;
  }

  const currentAffiliate = affiliateList[currentIndex];

  return (
    <div className={`w-full ${className}`}>
      {/* Desktop: leaderboard (728x90) */}
      <div className="hidden md:flex justify-center">
        <IABAd
          affiliate={currentAffiliate}
          size="leaderboard"
          variationIndex={currentIndex}
        />
      </div>
      {/* Mobile: mobile banner (320x100) */}
      <div className="flex md:hidden justify-center">
        <IABAd
          affiliate={currentAffiliate}
          size="mobile-banner"
          variationIndex={currentIndex}
        />
      </div>
      {affiliateList.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {affiliateList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-[#2563EB] w-4'
                  : 'bg-[#E2E8F0] hover:bg-[#CBD5E1]'
              }`}
              aria-label={`Show affiliate ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
