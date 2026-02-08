'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import DebtPaydownOptimizer from '@/components/apps/DebtPaydownOptimizer';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { StickySidebarAd } from '@/components/monetization';

export default function DebtPaydownPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-indigo-900 mb-3">Debt Paydown Strategy Optimizer</h2>
          <p className="text-indigo-700 font-medium">
            Where mathematical efficiency meets behavioral momentum. Compare avalanche vs snowball vs hybrid strategies,
            accounting for tax-deductible debt, psychological weighting, and opportunity cost of investing.
            This tool helps you decide which debts to prioritize based on both logic and behavioral economics.
          </p>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <DebtPaydownOptimizer isPro={isPro} onUpgrade={() => router.push('/pricing')} />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <StickySidebarAd context="debt-paydown" />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        <p>&copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <a href="/articles" className="text-slate-500 hover:text-slate-700 transition-colors text-xs">
            Articles
          </a>
          <span className="text-slate-300">|</span>
          <a href="/terms" className="text-slate-500 hover:text-slate-700 transition-colors text-xs">
            Terms & Privacy
          </a>
        </div>
      </footer>
    </>
  );
}
