'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock } from 'lucide-react';
import RetirementStrategyEngine from '@/components/apps/RetirementStrategyEngine';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { StickySidebarAd } from '@/components/monetization';
import { trackToolVisit } from '@/lib/useRecentTools';

function RetirementStrategyPageInner() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();

  // Fetch user tier from database (optional - no redirect)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);

      if (session) {
        // Fetch user tier from database if logged in
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        if (userData?.tier) {
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

  useEffect(() => { trackToolVisit('retirement-strategy', 'Retirement Strategy Engine', '/apps/retirement-strategy'); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-slate-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {!hasSession && (
          <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 grid-bg pointer-events-none" />
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={24} />
                  <h3 className="text-2xl font-black">Unlock 7 More Financial Calculators</h3>
                </div>
                <p className="text-indigo-100 font-medium mb-4">
                  Create a free account to access our complete suite of financial tools: Net Worth Tracker, Debt Paydown Optimizer, Car Affordability, Rent vs Buy, and more.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => router.push('/signup')}
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-md"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="text-white border-2 border-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    View All Tools
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-indigo-200" />
                      <span className="text-indigo-50 font-semibold">Net Worth Tracker</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-indigo-200" />
                      <span className="text-indigo-50 font-semibold">Debt Paydown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-indigo-200" />
                      <span className="text-indigo-50 font-semibold">Car Affordability</span>
                    </div>
                    <div className="text-indigo-200 text-xs font-bold mt-3">+ 4 more tools</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-purple-900 mb-3">Retirement Drawdown Strategy</h2>
          <p className="text-purple-700 font-medium">
            Comprehensive simulation of retirement portfolio withdrawals with RMD calculations, Roth conversion ladder optimization, and Social Security integration. Model multiple withdrawal strategies and stress-test against market volatility.
          </p>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <RetirementStrategyEngine
              isPro={isPro}
              onUpgrade={() => router.push('/pricing')}
              isLoggedIn={hasSession}
              initialValues={initialValues}
            />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <StickySidebarAd context="retirement-strategy" />
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

export default function RetirementStrategyPage() {
  return (
    <Suspense fallback={null}>
      <RetirementStrategyPageInner />
    </Suspense>
  );
}
