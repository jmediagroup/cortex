'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';

const SCorpOptimizer = dynamic(() => import('@/components/apps/SCorpOptimizer'), { ssr: false });
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { InlineAd } from '@/components/monetization';
import { trackToolVisit } from '@/lib/useRecentTools';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';

function SCorpOptimizerPageInner() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        if (userData?.tier) {
          setIsPro(hasProAccess('finance', userData.tier));
        }
      }
    };
    checkAuth();
  }, [supabase]);

  useEffect(() => {
    const token = searchParams.get('scenario');
    if (!token) return;
    fetch(`/api/scenarios/shared/${token}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.scenario?.inputs) setInitialValues(data.scenario.inputs); })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => { trackToolVisit('s-corp-optimizer', 'S-Corp Optimizer', '/apps/s-corp-optimizer'); }, []);

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Breadcrumb toolName="S-Corp Optimizer" />
        <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-amber-900 mb-3">S-Corp Tax Optimizer</h2>
          <p className="text-amber-700 font-medium">
            Calculate self-employment tax savings and find your ideal salary/distribution split. Optimize your S-Corp structure to minimize tax liability while staying compliant with IRS guidelines on reasonable compensation.
          </p>
        </div>

        {/* Inline Ad - Full width above calculator */}
        <InlineAd context="s-corp-optimizer" className="mb-8" />

        {/* Calculator - Full width */}
        <SCorpOptimizer isPro={isPro} onUpgrade={() => router.push('/pricing')} isLoggedIn={isLoggedIn} initialValues={initialValues} />
      </div>

      {/* SEO & AEO Content */}
      <div className="max-w-7xl mx-auto px-6">
        <CalculatorSEOContent content={CALCULATOR_CONTENT['s-corp-optimizer']} />
        <RelatedTools tools={getRelatedTools('s-corp-optimizer')} />
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

export default function SCorpOptimizerPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <SCorpOptimizerPageInner />
    </Suspense>
  );
}
