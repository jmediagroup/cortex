'use client';

import React, { useEffect, useState } from 'react';
/**
 * STABILITY FIX:
 * Using explicit relative paths to ensure successful module resolution 
 * in environments where the '@/' alias might not resolve correctly.
 * * Path Logic from src/app/apps/s-corp-optimizer/page.tsx:
 * ../          -> src/app/apps/
 * ../../       -> src/app/
 * ../../../    -> src/ (Root of source)
 */
import SCorpOptimizer from '../../../components/apps/SCorpOptimizer';
import { ChevronLeft, Scale, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/**
 * S-CORP OPTIMIZER PAGE
 * Route: /apps/s-corp-optimizer
 * * This page acts as the authenticated shell for the S-Corp tool.
 * It ensures the user is logged in before rendering the financial logic.
 */
export default function SCorpPage() {
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // If loading is finished and no user is found, redirect to login.
    // We use window.location for a hard redirect to ensure clean state.
    if (!loading && !user && !isRedirecting) {
      const timer = setTimeout(() => {
        if (!user) {
          setIsRedirecting(true);
          window.location.href = '/login';
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user, loading, isRedirecting]);

  const handleBack = () => {
    window.location.href = '/dashboard';
  };

  // 1. Handle Loading or Redirecting States
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Verifying Access...</p>
        </div>
      </div>
    );
  }

  // 2. Safety check to prevent UI rendering if user is not authenticated
  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOOL HEADER */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleBack}
            className="text-slate-400 hover:text-indigo-600 transition-all active:scale-95 group"
            aria-label="Back to Dashboard"
          >
            <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-xl text-white shadow-lg shadow-amber-200">
              <Scale size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-slate-800">S-Corp Tax Optimizer</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Entity Logic Engine v2.1</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end hidden sm:block mr-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</p>
            <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Verified Session</p>
          </div>
          <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-inner">
            <ShieldCheck size={20} className="text-emerald-500" />
          </div>
        </div>
      </nav>

      {/* TOOL CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl group-hover:bg-amber-100 transition-colors">
            <Info size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black mb-1 text-slate-800 tracking-tight">Strategy Overview</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
              Optimize your business structure by finding the ideal balance between salary and distributions. This tool calculates your potential self-employment tax savings under an S-Corp election.
            </p>
          </div>
        </div>

        {/* Financial Logic Component */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <SCorpOptimizer />
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-[10px] uppercase tracking-widest opacity-60 border-t border-slate-100">
        &copy; {new Date().getFullYear()} Cortex Financial Lab &bull; Strategic Tax Modeling
      </footer>
    </div>
  );
}