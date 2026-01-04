'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, TrendingUp, ShieldCheck } from 'lucide-react';
import SCorpInvestmentOptimizer from '@/components/apps/SCorpInvestmentOptimizer';
import { createBrowserClient } from '@/lib/supabase/client';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function SCorpInvestmentPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  // Read user tier from Supabase
  useEffect(() => {
    const checkUserTier = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single();

      if (userData && userData.tier) {
        setIsPro(userData.tier === 'pro');
      }
      setLoading(false);
    };

    checkUserTier();
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
            <TrendingUp className="text-emerald-600" size={20} />
            <span className="font-black text-xl tracking-tight">S-Corp Investment Optimizer</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Session</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-emerald-900 mb-3">S-Corp Investment Strategy (2026 Limits)</h2>
          <p className="text-emerald-700 font-medium">
            As an S-Corp owner, maximize your retirement savings through strategic allocation across employee deferrals,
            company matching, IRA contributions, and HSA. This optimizer uses 2026 IRS limits to calculate your optimal
            investment strategy and 30-year wealth projection with tax savings.
          </p>
        </div>

        <ErrorBoundary>
          <SCorpInvestmentOptimizer
            isPro={isPro}
            onUpgrade={() => router.push('/pricing')}
          />
        </ErrorBoundary>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
      </footer>
    </div>
  );
}
