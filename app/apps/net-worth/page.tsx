'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Compass, ShieldCheck } from 'lucide-react';
import NetWorthEngine from '@/components/apps/NetWorthEngine';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { RotatingAd } from '@/components/monetization';

export default function NetWorthPage() {
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Net Worth Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-bold"
          >
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Compass className="text-indigo-600" size={20} />
            <span className="font-black text-xl tracking-tight">Net Worth Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Session</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 mb-8">
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

        <NetWorthEngine isPro={isPro} onUpgrade={() => router.push('/pricing')} />

        {/* Rotating Affiliate Ad */}
        <RotatingAd context="net-worth" variant="banner" className="mt-8" />
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center border-t border-slate-200 mt-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-slate-500 font-medium mb-4 italic">
            "Understanding is the highest form of financial advantage. We build systems that prioritize clarity over comparison."
          </p>
          <p className="text-xs text-slate-400 font-medium">
            &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <a href="/articles" className="text-slate-500 hover:text-slate-700 transition-colors text-xs">
              Articles
            </a>
            <span className="text-slate-300">|</span>
            <a href="/terms" className="text-slate-500 hover:text-slate-700 transition-colors text-xs">
              Terms & Privacy
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
