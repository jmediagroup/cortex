'use client';

import React, { useEffect, useState } from 'react';
/**
 * PATH RESOLUTION FIX:
 * The previous version used an incorrect number of directory jumps.
 * File: src/app/apps/compound-interest/page.tsx
 * 1. ../       -> src/app/apps/
 * 2. ../../    -> src/app/
 * 3. ../../../ -> src/ (Source Root)
 * * Target components are located at:
 * - src/components/apps/CompoundInterest
 * - src/context/AuthContext
 */
import CompoundInterest from '../../../components/apps/CompoundInterest';
import { ChevronLeft, Calculator, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/**
 * COMPOUND INTEREST PAGE
 * Route: /compound-interest
 * * This page serves as the primary interface for the wealth accumulation engine.
 */
export default function App() {
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Session Guard: If no user is found after loading, redirect to login
    if (!loading && !user && !isRedirecting) {
      const timer = setTimeout(() => {
        if (!user) {
          setIsRedirecting(true);
          window.location.assign('/login');
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user, loading, isRedirecting]);

  const handleBack = () => {
    window.location.assign('/dashboard');
  };

  // 1. Loading Overlay
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-center p-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            <Calculator className="absolute inset-0 m-auto text-indigo-200" size={24} />
          </div>
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Initialising Growth Model...</p>
        </div>
      </div>
    );
  }

  // 2. Prevent UI flicker if no user session is available
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
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-200">
              <Calculator size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none text-slate-800">Compound Interest Engine</h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Growth Model v1.0</p>
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

      {/* TOOL CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Info Banner */}
        <div className="mb-10 bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 group hover:shadow-md transition-shadow">
          <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl group-hover:bg-indigo-100 transition-colors">
            <Info size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black mb-1 text-slate-800 tracking-tight">Wealth Accumulation Logic</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">
              Visualize the exponential power of time. This engine simulates your portfolio trajectory based on initial principal, recurring monthly contributions, and projected annual returns.
            </p>
          </div>
        </div>

        {/* Financial Calculator Component */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CompoundInterest />
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-[10px] uppercase tracking-widest opacity-60 border-t border-slate-100">
        &copy; {new Date().getFullYear()} Cortex Financial Lab &bull; Strategic Growth Modeling
      </footer>
    </div>
  );
}