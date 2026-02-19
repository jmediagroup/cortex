'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import SCorpOptimizer from '@/components/apps/SCorpOptimizer';
import { createBrowserClient } from '@/lib/supabase/client';
import { StickySidebarAd } from '@/components/monetization';
import { Breadcrumb } from '@/components/ui';

function SCorpOptimizerPageInner() {
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

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <SCorpOptimizer isLoggedIn={isLoggedIn} initialValues={initialValues} />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <StickySidebarAd context="s-corp-optimizer" />
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

export default function SCorpOptimizerPage() {
  return (
    <Suspense fallback={null}>
      <SCorpOptimizerPageInner />
    </Suspense>
  );
}
