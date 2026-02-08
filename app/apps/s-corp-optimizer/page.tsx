'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import SCorpOptimizer from '@/components/apps/SCorpOptimizer';
import { StickySidebarAd } from '@/components/monetization';

export default function SCorpOptimizerPage() {
  const router = useRouter();

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
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
            <SCorpOptimizer />
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
