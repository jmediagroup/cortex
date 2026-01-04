'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Car, ShieldCheck } from 'lucide-react';
import CarAffordability from '@/components/apps/CarAffordability';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function CarAffordabilityPage() {
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
            <Car className="text-indigo-600" size={20} />
            <span className="font-black text-xl tracking-tight">Car Affordability Calculator</span>
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
          <h2 className="text-2xl font-black text-indigo-900 mb-3">20/3/8 Car-Buying Rule</h2>
          <p className="text-indigo-700 font-medium">
            The 20/3/8 car-buying rule helps ensure you keep your finances on-track while financing a vehicle.
            This calculator shows you exactly how much car you can afford based on your income, following the principle
            of 20% down payment, 3-year loan term, and no more than 8% of your pre-tax income for monthly payments.
          </p>
        </div>

        <ErrorBoundary>
          <CarAffordability />
        </ErrorBoundary>
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
      </footer>
    </div>
  );
}
