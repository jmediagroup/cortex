'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, TrendingUp, ShieldCheck, Lock } from 'lucide-react';

export default function RothOptimizerPage() {
  const router = useRouter();

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
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
          <Lock size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Pro Feature</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-emerald-900 mb-3">Roth Conversion Ladder</h2>
          <p className="text-emerald-700 font-medium">
            Strategic optimization of traditional to Roth conversions to eliminate future tax spikes. Algorithmically determine the optimal conversion amount to stay in low tax brackets.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-sm">
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <TrendingUp className="text-slate-300" size={64} />
              <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-2 rounded-full">
                <Lock size={20} />
              </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-4">Pro Feature Required</h3>
            <p className="text-slate-500 font-medium text-lg max-w-md mx-auto mb-8">
              The Roth Conversion Ladder optimizer is available exclusively to Pro subscribers. Upgrade to access advanced tax optimization tools.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="bg-indigo-600 text-white font-black px-10 py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl hover:scale-105 active:scale-95 text-lg"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
      </footer>
    </div>
  );
}
