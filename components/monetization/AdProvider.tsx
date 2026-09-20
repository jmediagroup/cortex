'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { shouldShowAds, type Tier } from '@/lib/access-control';

export interface AdVisibility {
  /** Whether this viewer should see ads at all (guests + free tier). */
  showAds: boolean;
  /** The viewer's tier, or null for guests. */
  tier: Tier | null;
  /** False until the session/tier lookup has settled. */
  ready: boolean;
  /** Internal: whether an AdProvider is mounted above the consumer. */
  hasProvider: boolean;
}

const AdContext = createContext<AdVisibility>({
  showAds: false,
  tier: null,
  ready: false,
  hasProvider: false,
});

interface AdProviderProps {
  /** Null/undefined while unknown or for guests. */
  tier: Tier | null | undefined;
  isLoggedIn: boolean;
  /** True once the session + tier lookup has completed. */
  ready: boolean;
  children: ReactNode;
}

/**
 * Computes ad visibility once per shell (AppShellClient already fetches the
 * session + tier) so every AdSlot on the page shares the answer instead of
 * each hitting Supabase.
 */
export function AdProvider({ tier, isLoggedIn, ready, children }: AdProviderProps) {
  const value = useMemo<AdVisibility>(
    () => ({
      showAds: ready ? shouldShowAds(isLoggedIn ? (tier ?? 'free') : null, isLoggedIn) : false,
      tier: isLoggedIn ? (tier ?? 'free') : null,
      ready,
      hasProvider: true,
    }),
    [tier, isLoggedIn, ready],
  );
  return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
}

export function useAdVisibility(): AdVisibility {
  return useContext(AdContext);
}
