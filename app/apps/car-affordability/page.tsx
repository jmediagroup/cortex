'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import CarAffordability from '@/components/apps/CarAffordability';
import { StickySidebarAd } from '@/components/monetization';

export default function CarAffordabilityPage() {
  const router = useRouter();

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-indigo-900 mb-3">20/3/8 Car-Buying Rule</h2>
          <p className="text-indigo-700 font-medium">
            The 20/3/8 car-buying rule helps ensure you keep your finances on-track while financing a vehicle.
            This calculator shows you exactly how much car you can afford based on your income, following the principle
            of 20% down payment, 3-year loan term, and no more than 8% of your pre-tax income for monthly payments.
          </p>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <CarAffordability />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <StickySidebarAd context="car-affordability" />
        </div>
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 font-medium text-sm">
        <p>&copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <a href="/articles" className="text-slate-500 hover:text-slate-700 transition-colors text-xs">
            Articles
          </a>
          <span className="text-slate-300">|</span>
          <a href="/terms" className="text-slate-500 hover:text-slate-700 transition-colors text-xs">
            Terms & Privacy
          </a>
        </div>
      </footer>
    </>
  );
}
