'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { shouldShowAds, type Tier } from '@/lib/access-control';

interface AdContainerProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

/**
 * AdContainer Component
 *
 * A wrapper component that conditionally renders its children based on
 * whether the user should see ads (guests and free tier users).
 *
 * Use this to wrap any ad content - affiliate links, banners, etc.
 */
export default function AdContainer({
  children,
  fallback = null,
  className = '',
}: AdContainerProps) {
  const [showAds, setShowAds] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAdVisibility() {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // Guest user - show ads
        setShowAds(true);
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
      setShowAds(shouldShowAds(userTier, true));
      setIsLoading(false);
    }

    checkAdVisibility();
  }, []);

  // Show nothing while loading
  if (isLoading) {
    return null;
  }

  // Show fallback for paid users (ad-free experience)
  if (!showAds) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  // Show ads for guests and free users
  return <div className={className}>{children}</div>;
}
