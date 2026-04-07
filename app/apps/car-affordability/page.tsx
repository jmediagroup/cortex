'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
const CarAffordability = dynamic(() => import('@/components/apps/CarAffordability'), { ssr: false });
import { createBrowserClient } from '@/lib/supabase/client';
import { InlineAd } from '@/components/monetization';
import { trackToolVisit } from '@/lib/useRecentTools';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';

function CarAffordabilityPageInner() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
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

  useEffect(() => { trackToolVisit('car-affordability', 'Car Affordability', '/apps/car-affordability'); }, []);

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Breadcrumb toolName="Car Affordability Calculator" />
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-indigo-900 mb-3">20/3/8 Car-Buying Rule</h2>
          <p className="text-indigo-700 font-medium">
            The 20/3/8 car-buying rule helps ensure you keep your finances on-track while financing a vehicle.
            This calculator shows you exactly how much car you can afford based on your income, following the principle
            of 20% down payment, 3-year loan term, and no more than 8% of your pre-tax income for monthly payments.
          </p>
        </div>

        {/* Inline Ad - Full width above calculator */}
        <InlineAd context="car-affordability" className="mb-8" />

        {/* Calculator - Full width */}
        <CarAffordability isLoggedIn={isLoggedIn} initialValues={initialValues} />
      </div>

      {/* SEO & AEO Content */}
      <div className="max-w-7xl mx-auto px-6">
        <CalculatorSEOContent content={CALCULATOR_CONTENT['car-affordability']} />
        <RelatedTools tools={getRelatedTools('car-affordability')} />
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

export default function CarAffordabilityPage() {
  return (
    <Suspense fallback={<CalculatorSkeleton />}>
      <CarAffordabilityPageInner />
    </Suspense>
  );
}
