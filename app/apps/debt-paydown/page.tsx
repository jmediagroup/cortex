'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

const DebtPaydownOptimizer = dynamic(() => import('@/components/apps/DebtPaydownOptimizer'), { ssr: false });
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { InlineAd } from '@/components/monetization';
import { trackToolVisit } from '@/lib/useRecentTools';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';

function DebtPaydownPageInner() {
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

  useEffect(() => { trackToolVisit('debt-paydown', 'Debt Paydown Strategy Optimizer', '/apps/debt-paydown'); }, []);

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
        <Breadcrumb toolName="Debt Paydown Optimizer" />
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/40 dark:to-slate-900 border border-indigo-100/80 dark:border-indigo-800/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-indigo-900 dark:text-indigo-100 mb-3">Debt Paydown Strategy Optimizer</h2>
          <p className="text-indigo-700 dark:text-indigo-300 font-medium">
            Where mathematical efficiency meets behavioral momentum. Compare avalanche vs snowball vs hybrid strategies,
            accounting for tax-deductible debt, psychological weighting, and opportunity cost of investing.
            This tool helps you decide which debts to prioritize based on both logic and behavioral economics.
          </p>
        </div>

        {/* Inline Ad - Full width above calculator */}
        <InlineAd context="debt-paydown" className="mb-8" />

        {/* Calculator - Full width */}
        <DebtPaydownOptimizer isPro={isPro} onUpgrade={() => router.push('/pricing')} isLoggedIn={isLoggedIn} initialValues={initialValues} />
      </div>

      {/* SEO & AEO Content */}
      <div className="max-w-7xl mx-auto px-6">
        <CalculatorSEOContent content={CALCULATOR_CONTENT['debt-paydown']} />
        <RelatedTools tools={getRelatedTools('debt-paydown')} />
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

export default function DebtPaydownPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <DebtPaydownPageInner />
    </Suspense>
  );
}
