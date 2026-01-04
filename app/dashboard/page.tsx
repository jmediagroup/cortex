"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import {
  Zap,
  TrendingUp,
  Calculator,
  ShieldCheck,
  ArrowRight,
  Lock,
  LogOut,
  User,
  ArrowLeftRight,
  Car
} from 'lucide-react';

/**
 * APP DATA CONFIGURATION
 * This array defines the tools visible in the dashboard.
 * Apps are organized by category for better navigation.
 * The 'tier' property determines if a user can launch the tool.
 */
const APP_CATEGORIES = [
  {
    id: 'personal-finance',
    name: 'Personal Finance',
    description: 'Tools for individual wealth building and investment planning',
    apps: [
      {
        id: 'compound-interest',
        name: 'Compound Interest',
        description: 'Visualize long-term wealth accumulation with custom contribution schedules.',
        icon: <Calculator className="text-indigo-600" />,
        tier: 'free',
        path: '/apps/compound-interest'
      },
      {
        id: 'car-affordability',
        name: 'Car Affordability Calculator',
        description: 'Apply the 20/3/8 rule to determine how much car you can afford without breaking the bank.',
        icon: <Car className="text-blue-600" />,
        tier: 'free',
        path: '/apps/car-affordability'
      }
    ]
  },
  {
    id: 'business-finance',
    name: 'Business Finance',
    description: 'Optimize your business structure and tax strategy',
    apps: [
      {
        id: 's-corp-optimizer',
        name: 'S-Corp Optimizer',
        description: 'Calculate self-employment tax savings and find your ideal salary/distribution split.',
        icon: <Zap className="text-amber-500" />,
        tier: 'free',
        path: '/apps/s-corp-optimizer'
      },
      {
        id: 's-corp-investment',
        name: 'S-Corp Investment Optimizer',
        description: 'Maximize retirement contributions across Solo 401(k), IRA, HSA, and brokerage accounts with 2026 limits.',
        icon: <TrendingUp className="text-emerald-600" />,
        tier: 'pro',
        path: '/apps/s-corp-investment'
      }
    ]
  },
  {
    id: 'retirement',
    name: 'Retirement',
    description: 'Advanced retirement planning and tax optimization strategies',
    apps: [
      {
        id: 'roth-optimizer',
        name: 'Roth Conversion Ladder',
        description: 'Strategic optimization of traditional to roth conversions to eliminate future tax spikes.',
        icon: <TrendingUp className="text-emerald-500" />,
        tier: 'pro',
        path: '/apps/roth-optimizer'
      },
      {
        id: 'retirement-strategy',
        name: 'Retirement Strategy Engine',
        description: 'Comprehensive drawdown simulation with RMDs, conversions, and Social Security optimization.',
        icon: <TrendingUp className="text-purple-500" />,
        tier: 'free',
        path: '/apps/retirement-strategy'
      }
    ]
  }
];

export default function Dashboard() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userTier, setUserTier] = useState<'free' | 'pro'>('free');

  // Supabase authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        setUser(session.user);

        // Fetch user tier from database
        const { data: userData, error } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Error fetching user data:', error);
          setUserTier('free');
        } else {
          setUserTier(userData.tier);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  // 1. LOADING STATE
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  // 2. AUTH GUARD
  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">

      {/* TOP NAVIGATION BAR */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Zap size={20} fill="currentColor" />
          </div>
          <span className="font-black text-xl tracking-tight">Cortex<span className="text-indigo-600">Hub</span></span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
            <User size={16} className="text-slate-500" />
            <span className="text-sm font-bold text-slate-700">{user.email}</span>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
              userTier === 'pro' ? 'bg-indigo-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              {userTier}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-slate-400 hover:text-rose-500 transition-colors flex items-center gap-2 font-bold text-sm"
          >
            <LogOut size={20} />
            <span className="hidden md:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">App Library</h2>
          <p className="text-slate-500 font-medium text-lg">Select a tool to begin your financial analysis.</p>
        </div>

        {/* GROUPED APPS BY CATEGORY */}
        <div className="space-y-12">
          {APP_CATEGORIES.map((category) => (
            <div key={category.id}>
              {/* Category Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">{category.name}</h3>
                <p className="text-sm text-slate-500 font-medium">{category.description}</p>
              </div>

              {/* Apps Grid for this Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.apps.map((app) => {
                  const isLocked = app.tier === 'pro' && userTier !== 'pro';

                  return (
                    <div
                      key={app.id}
                      onClick={() => !isLocked && router.push(app.path)}
                      className={`group relative bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm transition-all duration-300 ${
                        isLocked
                        ? 'opacity-80 grayscale-[0.5] cursor-default'
                        : 'hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-indigo-100'
                      }`}
                    >
                      <div className="mb-6 flex justify-between items-start">
                        <div className={`p-4 rounded-2xl transition-colors ${isLocked ? 'bg-slate-100' : 'bg-slate-50 group-hover:bg-indigo-50'}`}>
                          {app.icon}
                        </div>
                        {app.tier === 'pro' && (
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl ${
                            isLocked ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}>
                            {isLocked ? <Lock size={10} /> : <ShieldCheck size={10} />}
                            {app.tier}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl font-black mb-3 text-slate-800 tracking-tight">{app.name}</h3>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                        {app.description}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <span className={`text-sm font-black flex items-center gap-2 transition-all ${
                          isLocked ? 'text-slate-400' : 'text-indigo-600 group-hover:gap-3'
                        }`}>
                          {isLocked ? 'Locked (Pro Feature)' : 'Launch Application'}
                          {!isLocked && <ArrowRight size={18} />}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* PRO UPGRADE CALL-TO-ACTION */}
        {userTier !== 'pro' && (
          <div className="mt-20 bg-indigo-900 rounded-[3.5rem] p-12 text-white overflow-hidden relative shadow-2xl border border-indigo-800">
            <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
              <Zap size={250} fill="currentColor" />
            </div>

            <div className="relative z-10 max-w-2xl">
              <span className="bg-indigo-500/30 text-indigo-200 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-indigo-500/50 mb-6 inline-block">
                Premium Access
              </span>
              <h3 className="text-4xl font-black mb-6 tracking-tight">Unlock the full power of Cortex</h3>
              <p className="text-indigo-100 font-medium text-xl mb-10 leading-relaxed opacity-90">
                Get unlimited access to the Roth Conversion Ladder, advanced tax modeling, and scenario saving.
              </p>
              <button
                onClick={() => router.push('/pricing')}
                className="bg-white text-indigo-900 font-black px-10 py-5 rounded-2xl hover:bg-indigo-50 transition-all shadow-xl hover:scale-105 active:scale-95 text-lg"
              >
                Explore Pro Plans
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200 mt-12 text-center text-slate-400 font-medium text-sm">
        <div className="flex items-center justify-center gap-6 mb-4">
          <ArrowLeftRight size={16} />
          <span>Optimized Strategy & Drawdown Intelligence</span>
        </div>
        &copy; {new Date().getFullYear()} Cortex SaaS. Built for mathematical wealth optimization.
      </footer>
    </div>
  );
}
