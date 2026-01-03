'use client';

import React from 'react';
import { Zap, TrendingUp, ShieldCheck, ArrowRight, BarChart3, PieChart } from 'lucide-react';

/**
 * LANDING PAGE (Root Route: /)
 * This is what users see when they first visit your domain.
 * It explains the value of Cortex and directs them to the Login/Register flow.
 * * NOTE: Switched to standard <a> tags for navigation to ensure 
 * compatibility across all build environments.
 */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* NAVIGATION */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-black text-2xl tracking-tight">Cortex</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/login" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">
            Sign In
          </a>
          <a 
            href="/login" 
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95"
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center lg:text-left grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-indigo-100">
            <Zap size={14} fill="currentColor" />
            Next-Gen Wealth Optimization
          </div>
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
            Mathematical <span className="text-indigo-600">Precision</span> for your Retirement.
          </h1>
          <p className="text-xl text-slate-500 font-medium mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Stop guessing your tax strategy. Cortex uses advanced decumulation algorithms to maximize your portfolio longevity and minimize IRS liability.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <a 
              href="/login" 
              className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200 flex items-center justify-center gap-2 group"
            >
              Build Your Strategy
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="/pricing" 
              className="w-full sm:w-auto bg-white text-slate-600 border border-slate-200 px-10 py-5 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all"
            >
              View Pricing
            </a>
          </div>
        </div>

        {/* MOCKUP / ILLUSTRATION AREA */}
        <div className="relative">
          <div className="bg-indigo-600/5 absolute inset-0 blur-3xl rounded-full translate-x-10 translate-y-10" />
          <div className="relative bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <div className="h-4 w-32 bg-slate-100 rounded-full" />
                <div className="h-3 w-20 bg-slate-50 rounded-full" />
              </div>
              <ShieldCheck className="text-emerald-500" size={32} />
            </div>
            <div className="space-y-4">
              <div className="h-40 bg-slate-50 rounded-3xl flex items-end justify-around p-4 gap-2">
                <div className="w-full bg-indigo-200 h-1/2 rounded-t-lg" />
                <div className="w-full bg-indigo-400 h-3/4 rounded-t-lg" />
                <div className="w-full bg-indigo-600 h-full rounded-t-lg" />
                <div className="w-full bg-indigo-300 h-2/3 rounded-t-lg" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-20 bg-emerald-50 rounded-2xl border border-emerald-100 p-4">
                  <TrendingUp className="text-emerald-600 mb-1" size={16} />
                  <div className="h-3 w-12 bg-emerald-200 rounded-full" />
                </div>
                <div className="h-20 bg-indigo-50 rounded-2xl border border-indigo-100 p-4">
                  <BarChart3 className="text-indigo-600 mb-1" size={16} />
                  <div className="h-3 w-12 bg-indigo-200 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FEATURES SECTION */}
      <section className="bg-slate-50 py-32 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Built for modern FI/RE</h2>
            <p className="text-slate-500 font-medium">Tools designed to solve the most complex drawdown problems.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <PieChart />, title: "Asset Allocation", text: "Visualize your taxable vs. tax-deferred mix across your entire retirement horizon." },
              { icon: <TrendingUp />, title: "Roth Ladders", text: "Algorithmically determine the optimal conversion amount to stay in low tax brackets." },
              { icon: <ShieldCheck />, title: "Sequence Risk", text: "Stress test your portfolio against early-retirement market crashes automatically." }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
                <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl w-fit mb-6">
                  {f.icon}
                </div>
                <h4 className="text-xl font-black mb-3 text-slate-800">{f.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-slate-400 font-medium text-sm">
        &copy; {new Date().getFullYear()} Cortex Financial Technology. All rights reserved.
      </footer>
    </div>
  );
}