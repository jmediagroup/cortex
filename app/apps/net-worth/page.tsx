'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Compass } from 'lucide-react';
import NetWorthEngine from '@/components/apps/NetWorthEngine';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { StickySidebarAd } from '@/components/monetization';

function NetWorthPageInner() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Net Worth Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100/80 rounded-2xl p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Compass size={28} className="text-indigo-600 stroke-[2.5]" />
            <h1 className="text-2xl font-black text-indigo-900">Cortex Net Worth Engine</h1>
          </div>
          <p className="text-indigo-700 font-medium leading-relaxed">
            A decision-support tool optimized for system clarity and long-term agency. Track assets and liabilities,
            analyze liquidity, identify leverage points, and visualize your financial trajectory.
          </p>
          <div className="mt-6 flex items-start gap-3 bg-white/50 rounded-2xl p-4 border border-indigo-100">
            <div className="text-indigo-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-indigo-900 mb-1">Key Insight</p>
              <p className="text-xs text-indigo-700 font-medium">
                Understanding is the highest form of financial advantage. This tool prioritizes clarity over comparison,
                helping you identify structural pivots unique to your financial system.
              </p>
            </div>
          </div>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <NetWorthEngine isPro={isPro} onUpgrade={() => router.push('/pricing')} isLoggedIn={isLoggedIn} initialValues={initialValues} />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <StickySidebarAd context="net-worth" />
        </div>
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-center border-t border-slate-100 mt-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-slate-400 font-medium mb-3 italic">
            "Understanding is the highest form of financial advantage. We build systems that prioritize clarity over comparison."
          </p>
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <a href="/articles" className="text-slate-400 hover:text-slate-600 transition-colors text-xs">Articles</a>
            <span className="text-slate-200">|</span>
            <a href="/pricing" className="text-slate-400 hover:text-slate-600 transition-colors text-xs">Pricing</a>
            <span className="text-slate-200">|</span>
            <a href="/terms" className="text-slate-400 hover:text-slate-600 transition-colors text-xs">Terms & Privacy</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default function NetWorthPage() {
  return (
    <Suspense fallback={null}>
      <NetWorthPageInner />
    </Suspense>
  );
}
