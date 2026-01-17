'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Zap, ShieldCheck } from 'lucide-react';
import SCorpOptimizer from '@/components/apps/SCorpOptimizer';

export default function SCorpOptimizerPage() {
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
            <Zap className="text-amber-500" size={20} />
            <span className="font-black text-xl tracking-tight">S-Corp Tax Optimizer</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Session</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-amber-900 mb-3">S-Corp Tax Optimizer</h2>
          <p className="text-amber-700 font-medium">
            Calculate self-employment tax savings and find your ideal salary/distribution split. Optimize your S-Corp structure to minimize tax liability while staying compliant with IRS guidelines on reasonable compensation.
          </p>
        </div>

        <SCorpOptimizer />
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        <p>&copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.</p>
        <a href="/terms" className="text-slate-500 hover:text-slate-700 transition-colors text-xs mt-2 inline-block">
          Terms & Privacy
        </a>
      </footer>
    </div>
  );
}
