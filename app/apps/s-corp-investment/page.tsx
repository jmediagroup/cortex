'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SCorpInvestmentOptimizer from '@/components/apps/SCorpInvestmentOptimizer';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import ToolRecommendationSidebar from '@/components/dashboard/ToolRecommendationSidebar';

function SCorpInvestmentPageInner() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<Tier>('free');
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();

  // Fetch user tier from database (optional - no redirect)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session) {
        // Fetch user tier from database if logged in
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        if (userData?.tier) {
          setUserTier(userData.tier);
          setIsPro(hasProAccess('finance', userData.tier));
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    const token = searchParams.get('scenario');
    if (!token) return;
    fetch(`/api/scenarios/shared/${token}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.scenario?.inputs) setInitialValues(data.scenario.inputs); })
      .catch(() => {});
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-emerald-900 mb-3">S-Corp Investment Strategy (2026 Limits)</h2>
          <p className="text-emerald-700 font-medium">
            As an S-Corp owner, maximize your retirement savings through strategic allocation across employee deferrals,
            company matching, IRA contributions, and HSA. This optimizer uses 2026 IRS limits to calculate your optimal
            investment strategy and 30-year wealth projection with tax savings.
          </p>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <SCorpInvestmentOptimizer
              isPro={isPro}
              onUpgrade={() => router.push('/pricing')}
              isLoggedIn={isLoggedIn}
              initialValues={initialValues}
            />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <ToolRecommendationSidebar context="s-corp-investment" />
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

export default function SCorpInvestmentPage() {
  return (
    <Suspense fallback={null}>
      <SCorpInvestmentPageInner />
    </Suspense>
  );
}
