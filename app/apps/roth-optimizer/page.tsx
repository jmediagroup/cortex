'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, TrendingUp, ShieldCheck } from 'lucide-react';
import RothOptimizer from '@/components/apps/RothOptimizer';

export default function RothOptimizerPage() {
  const router = useRouter();

  // Demo mode - in production this would come from auth context
  const isPro = false; // Free tier for demo

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
            <TrendingUp className="text-emerald-500" size={20} />
            <span className="font-black text-xl tracking-tight">Roth Conversion Ladder</span>
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
          <h2 className="text-2xl font-black text-emerald-900 mb-3">Roth Conversion Ladder Optimizer</h2>
          <p className="text-emerald-700 font-medium">
            Strategic optimization of traditional to Roth conversions to eliminate future tax spikes. Use our advanced algorithms to determine the optimal conversion amount to stay in low tax brackets and maximize portfolio longevity.
          </p>
        </div>

        <RothOptimizer
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
