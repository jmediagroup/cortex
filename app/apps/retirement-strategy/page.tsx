'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, TrendingUp, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import RetirementStrategyEngine from '@/components/apps/RetirementStrategyEngine';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';

export default function RetirementStrategyPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<Tier>('free');

  // Fetch user tier from database (optional - no redirect)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
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
            <TrendingUp className="text-purple-500" size={20} />
            <span className="font-black text-xl tracking-tight">Retirement Strategy Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Session</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {userTier === 'free' && (
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 mb-8 text-white shadow-xl">
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

        <div className="bg-purple-50 border border-purple-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-purple-900 mb-3">Retirement Drawdown Strategy</h2>
          <p className="text-purple-700 font-medium">
            Comprehensive simulation of retirement portfolio withdrawals with RMD calculations, Roth conversion ladder optimization, and Social Security integration. Model multiple withdrawal strategies and stress-test against market volatility.
          </p>
        </div>

        <RetirementStrategyEngine
          isPro={isPro}
          onUpgrade={() => router.push('/pricing')}
        />
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
      </footer>
    </div>
  );
}
