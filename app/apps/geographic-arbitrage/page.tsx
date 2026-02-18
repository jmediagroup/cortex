'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import GeographicArbitrageCalculator from '@/components/apps/GeographicArbitrageCalculator';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { StickySidebarAd } from '@/components/monetization';

export default function GeographicArbitragePage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      setIsLoggedIn(true);

      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single() as { data: { tier: Tier } | null };

      if (userData?.tier) {
        setIsPro(hasProAccess('finance', userData.tier));
      }
      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-indigo-900 mb-3">Geographic Arbitrage Calculator</h2>
          <p className="text-indigo-700 font-medium">
            Relocation isn&apos;t just a move—it&apos;s an investment strategy. Compare your financial trajectory
            across all 50 U.S. state capitals and major hubs. This calculator accounts for state income tax,
            cost of living indices, housing costs, and lifestyle adjustments to show you the true wealth-building
            potential of geographic arbitrage. See how much you could save by relocating to a lower-cost area
            while maintaining or even increasing your income.
          </p>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <GeographicArbitrageCalculator isPro={isPro} onUpgrade={() => router.push('/pricing')} isLoggedIn={isLoggedIn} />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <StickySidebarAd context="geographic-arbitrage" />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-10 text-center border-t border-slate-100 mt-8">
        <p className="text-xs text-slate-400 font-medium">&copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <a href="/articles" className="text-slate-400 hover:text-slate-600 transition-colors text-xs">Articles</a>
          <span className="text-slate-200">|</span>
          <a href="/pricing" className="text-slate-400 hover:text-slate-600 transition-colors text-xs">Pricing</a>
          <span className="text-slate-200">|</span>
          <a href="/terms" className="text-slate-400 hover:text-slate-600 transition-colors text-xs">Terms & Privacy</a>
        </div>
      </footer>
    </>
  );
}
