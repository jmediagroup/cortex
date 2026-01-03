'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calculator, ShieldCheck } from 'lucide-react';

export default function CompoundInterestPage() {
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
            <Calculator className="text-indigo-600" size={20} />
            <span className="font-black text-xl tracking-tight">Compound Interest Calculator</span>
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
          <h2 className="text-2xl font-black text-indigo-900 mb-3">Compound Interest Calculator</h2>
          <p className="text-indigo-700 font-medium">
            Visualize long-term wealth accumulation with custom contribution schedules. This tool helps you understand how your investments can grow over time with compound interest.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-12 shadow-sm">
          <div className="text-center py-20">
            <Calculator className="text-slate-300 mx-auto mb-6" size={64} />
            <h3 className="text-3xl font-black text-slate-900 mb-4">Coming Soon</h3>
            <p className="text-slate-500 font-medium text-lg max-w-md mx-auto">
              The Compound Interest Calculator is currently under development. Check back soon for powerful wealth projection tools.
            </p>
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
