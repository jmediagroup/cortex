'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

const GeographicArbitrageCalculator = dynamic(() => import('@/components/apps/GeographicArbitrageCalculator'), { ssr: false });
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { InlineAd } from '@/components/monetization';
import { trackToolVisit } from '@/lib/useRecentTools';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';

function GeographicArbitragePageInner() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPro, setIsPro] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (!searchParams.get('scenario')) {
          router.push('/login');
          return;
        }
        setLoading(false);
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

  useEffect(() => {
    const token = searchParams.get('scenario');
    if (!token) return;
    fetch(`/api/scenarios/shared/${token}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.scenario?.inputs) setInitialValues(data.scenario.inputs); })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => { trackToolVisit('geographic-arbitrage', 'Geographic Arbitrage Calculator', '/apps/geographic-arbitrage'); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Breadcrumb toolName="Geographic Arbitrage Calculator" />
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-900 border border-indigo-100/80 dark:border-indigo-800/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-3">Geographic Arbitrage Calculator</h2>
          <p className="text-indigo-700 dark:text-indigo-300 font-medium">
            Relocation isn&apos;t just a move—it&apos;s an investment strategy. Compare your financial trajectory
            across all 50 U.S. state capitals and major hubs. This calculator accounts for state income tax,
            cost of living indices, housing costs, and lifestyle adjustments to show you the true wealth-building
            potential of geographic arbitrage. See how much you could save by relocating to a lower-cost area
            while maintaining or even increasing your income.
          </p>
        </div>

        {/* Inline Ad - Full width above calculator */}
        <InlineAd context="geographic-arbitrage" className="mb-8" />

        {/* Calculator - Full width */}
        <GeographicArbitrageCalculator isPro={isPro} onUpgrade={() => router.push('/pricing')} isLoggedIn={isLoggedIn} initialValues={initialValues} />
      </div>

      {/* SEO & AEO Content */}
      <div className="max-w-7xl mx-auto px-6">
        <CalculatorSEOContent content={CALCULATOR_CONTENT['geographic-arbitrage']} />
        <RelatedTools tools={getRelatedTools('geographic-arbitrage')} />
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-10 text-center border-t border-slate-100 dark:border-slate-800 mt-8">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">&copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <a href="/articles" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xs">Articles</a>
          <span className="text-slate-200 dark:text-slate-700">|</span>
          <a href="/pricing" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xs">Pricing</a>
          <span className="text-slate-200 dark:text-slate-700">|</span>
          <a href="/terms" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors text-xs">Terms & Privacy</a>
        </div>
      </footer>
    </>
  );
}

export default function GeographicArbitragePage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <GeographicArbitragePageInner />
    </Suspense>
  );
}
