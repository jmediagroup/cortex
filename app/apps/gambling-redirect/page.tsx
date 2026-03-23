'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Lock } from 'lucide-react';
import GamblingRedirect from '@/components/apps/GamblingRedirect';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { trackToolVisit } from '@/lib/useRecentTools';
import { Breadcrumb } from '@/components/ui';

function GamblingRedirectPageInner() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const [initialValues, setInitialValues] = useState<Record<string, unknown> | undefined>();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);

      if (session) {
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

  useEffect(() => {
    const token = searchParams.get('scenario');
    if (!token) return;
    fetch(`/api/scenarios/shared/${token}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.scenario?.inputs) setInitialValues(data.scenario.inputs); })
      .catch(() => {});
  }, [searchParams]);

  useEffect(() => { trackToolVisit('gambling-redirect', 'Gambling Spend Redirect', '/apps/gambling-redirect'); }, []);

  return (
    <>
      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <Breadcrumb toolName="Gambling Redirect Calculator" />
        {hasSession === false && (
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-700 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 grid-bg pointer-events-none" />
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={24} />
                  <h3 className="text-2xl font-black">Unlock More Financial Tools</h3>
                </div>
                <p className="text-emerald-100 font-medium mb-4">
                  Create a free account to access our complete suite of financial tools: Compound Interest Calculator, Debt Paydown Strategy, Net Worth Tracker, and more.
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
                      <span className="text-emerald-50 font-semibold">Compound Interest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-emerald-200" />
                      <span className="text-emerald-50 font-semibold">Debt Paydown Strategy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-emerald-200" />
                      <span className="text-emerald-50 font-semibold">Net Worth Tracker</span>
                    </div>
                    <div className="text-emerald-200 text-xs font-bold mt-3">+ 8 more tools</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100/80 rounded-2xl p-8 mb-8 shadow-sm">
          <h2 className="text-2xl font-black text-emerald-900 mb-3">Gambling Spend Redirect Calculator</h2>
          <p className="text-emerald-700 font-medium">
            Reframing gambling habits. See the life-changing difference between playing the odds and owning the market. Redirect your spending toward building real, lasting wealth.
          </p>
        </div>

        <GamblingRedirect isPro={isPro} onUpgrade={() => router.push('/pricing')} isLoggedIn={hasSession === true} initialValues={initialValues} />
      </div>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-10 text-center border-t border-slate-100 mt-8">
        <p className="text-xs text-slate-400 font-medium mb-2">Information for educational purposes only. Past market performance does not guarantee future results.</p>
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

export default function GamblingRedirectPage() {
  return (
    <Suspense fallback={null}>
      <GamblingRedirectPageInner />
    </Suspense>
  );
}
