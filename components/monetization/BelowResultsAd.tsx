'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';
import { getAffiliatesForContext, type AffiliateConfig } from './affiliates';
import IABAd from './IABAd';

interface BelowResultsAdProps {
  context: string;
  className?: string;
}

/**
 * BelowResultsAd Component
 *
 * Displays a 336x280 Large Rectangle ad below calculator results.
 * Placed immediately after the 'Calculate' button for high conversion.
 * Users who just saw their numbers are looking for the "Next Step."
 */
export default function BelowResultsAd({
  context,
  className = '',
}: BelowResultsAdProps) {
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

  // Rotation effect - every 12 seconds
  useEffect(() => {
    if (affiliateList.length <= 1 || !showAd) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % affiliateList.length);
    }, 12000);

    return () => clearInterval(interval);
  }, [affiliateList.length, showAd]);

  if (isLoading || !showAd || affiliateList.length === 0) {
    return null;
  }

  const currentAffiliate = affiliateList[currentIndex];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <IABAd
        affiliate={currentAffiliate}
        size="large-rectangle"
        variationIndex={currentIndex}
      />
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
