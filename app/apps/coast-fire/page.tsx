'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Anchor, ShieldCheck, Sparkles, Lock } from 'lucide-react';
import CoastFIRE from '@/components/apps/CoastFIRE';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { StickySidebarAd } from '@/components/monetization';

export default function CoastFIREPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);

      if (session) {
        // Fetch user tier from database if logged in
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        if (userData?.tier) {
          setIsPro(hasProAccess('finance', userData.tier));
        }
      }

      setLoading(false);
    };
    checkAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors font-bold"
          >
            <ChevronLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Anchor className="text-emerald-600" size={20} />
            <span className="font-black text-xl tracking-tight">Coast FIRE Calculator</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Session</span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {hasSession === false && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 mb-8 text-white shadow-xl">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={24} />
                  <h3 className="text-2xl font-black">Unlock the Full Financial Toolkit</h3>
                </div>
                <p className="text-emerald-100 font-medium mb-4">
                  Create a free account to access our complete suite of financial tools: Retirement Strategy, Budget Optimizer, Net Worth Tracker, Debt Paydown, and more.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => router.push('/signup')}
                    className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-md"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="text-white border-2 border-white px-6 py-3 rounded-xl font-bold hover:bg-white/10 transition-all"
                  >
                    View All Tools
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-emerald-200" />
                      <span className="text-emerald-50 font-semibold">Retirement Strategy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-emerald-200" />
                      <span className="text-emerald-50 font-semibold">Budget Optimizer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-emerald-200" />
                      <span className="text-emerald-50 font-semibold">Net Worth Tracker</span>
                    </div>
                    <div className="text-emerald-200 text-xs font-bold mt-3">+ 9 more tools</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-8 mb-8">
          <h2 className="text-2xl font-black text-emerald-900 mb-3">Coast FIRE Calculator</h2>
          <p className="text-emerald-700 font-medium">
            Calculate if you have enough invested to "coast" to retirement without further contributions.
            Coast FIRE is the point where your current investments will grow to your target retirement number
            through compound growth alone, even if you never save another dollar.
          </p>
        </div>

        {/* Main content with sidebar layout */}
        <div className="flex gap-8">
          {/* Calculator - Main content area */}
          <div className="flex-1 min-w-0">
            <CoastFIRE isPro={isPro} onUpgrade={() => router.push('/pricing')} />
          </div>

          {/* Sticky Sidebar Ad - Desktop only (renders nothing for paying users) */}
          <StickySidebarAd context="coast-fire" />
        </div>
      </main>

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
    </div>
  );
}
