'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';
import { getAffiliatesForContext, type AffiliateConfig } from './affiliates';
import AffiliateLink from './AffiliateLink';

interface RotatingAdProps {
  context: string;
  variant?: 'card' | 'banner';
  className?: string;
  rotationInterval?: number; // in milliseconds, default 10 seconds
}

/**
 * RotatingAd Component
 *
 * Displays rotating affiliate content for contexts with multiple affiliates.
 * Automatically cycles through available affiliates at a set interval.
 * Falls back to primary affiliate if no rotating affiliates are configured.
 */
export default function RotatingAd({
  context,
  variant = 'card',
  className = '',
  rotationInterval = 10000,
}: RotatingAdProps) {
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
        // Start with a random affiliate for variety
        setCurrentIndex(Math.floor(Math.random() * affiliates.rotating.length));
      } else {
        setAffiliateList([affiliates.primary]);
      }
    }
  }, [context]);

  // Rotation effect
  useEffect(() => {
    if (affiliateList.length <= 1 || !showAd) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % affiliateList.length);
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [affiliateList.length, rotationInterval, showAd]);

  if (isLoading || !showAd || affiliateList.length === 0) {
    return null;
  }

  const currentAffiliate = affiliateList[currentIndex];

  if (variant === 'banner') {
    return (
      <div className={`relative ${className}`}>
        <div className="bg-gradient-to-r from-slate-800/80 to-indigo-900/30 border border-slate-700/50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Recommended Tool</p>
              <p className="text-white font-medium">{currentAffiliate.name}</p>
              {currentAffiliate.tagline && (
                <p className="text-sm text-indigo-400">{currentAffiliate.tagline}</p>
              )}
              <p className="text-sm text-slate-400 mt-1">{currentAffiliate.description}</p>
            </div>
            <AffiliateLink affiliate={currentAffiliate} variant="button" className="flex-shrink-0">
              Learn More
            </AffiliateLink>
          </div>
        </div>
        {affiliateList.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3">
            {affiliateList.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-indigo-500 w-4'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Show affiliate ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`relative ${className}`}>
      <AffiliateLink affiliate={currentAffiliate} variant="card" />
      {affiliateList.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {affiliateList.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-indigo-500 w-4'
                  : 'bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Show affiliate ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
