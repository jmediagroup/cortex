'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bookmark,
  ArrowLeft,
  Trash2,
  Play,
  Loader2,
  Calendar,
  Wrench,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { type Tier } from '@/lib/access-control';
import { DashboardShell } from '@/components/navigation';
import type { Scenario } from '@/lib/useScenarios';

// Map tool_id to the URL path
const TOOL_PATHS: Record<string, string> = {
  'budget': '/apps/budget',
  'car-affordability': '/apps/car-affordability',
  'coast-fire': '/apps/coast-fire',
  'compound-interest': '/apps/compound-interest',
  'debt-paydown': '/apps/debt-paydown',
  'geographic-arbitrage': '/apps/geographic-arbitrage',
  'index-fund-visualizer': '/apps/index-fund-visualizer',
  'net-worth': '/apps/net-worth',
  'rent-vs-buy': '/apps/rent-vs-buy',
  'retirement-strategy': '/apps/retirement-strategy',
  's-corp-investment': '/apps/s-corp-investment',
  's-corp-optimizer': '/apps/s-corp-optimizer',
};

export default function ScenariosPage() {
  const router = useRouter();
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUser(session.user);

      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single() as { data: { tier: Tier } | null };

      if (userData?.tier) setUserTier(userData.tier);

      // Fetch scenarios
      const res = await fetch('/api/scenarios', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setScenarios(data.scenarios);
      }

      setLoading(false);
    };

    init();
  }, [router, supabase]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await fetch(`/api/scenarios?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      setScenarios(prev => prev.filter(s => s.id !== id));
    }
    setDeletingId(null);
  };

  const handleLoad = (scenario: Scenario) => {
    const path = TOOL_PATHS[scenario.tool_id];
    if (!path) return;

    // Store inputs in sessionStorage for the tool to pick up
    sessionStorage.setItem(`scenario_load_${scenario.tool_id}`, JSON.stringify(scenario.inputs));
    router.push(path);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--surface-secondary)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading scenarios...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const userName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';

  // Group scenarios by tool
  const grouped = scenarios.reduce<Record<string, Scenario[]>>((acc, s) => {
    if (!acc[s.tool_name]) acc[s.tool_name] = [];
    acc[s.tool_name].push(s);
    return acc;
  }, {});

  return (
    <DashboardShell
      user={{ email: user.email, name: userName }}
      userTier={userTier}
      onSignOut={handleSignOut}
    >
      <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft size={16} />
            Back to Apps
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Bookmark size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">My Scenarios</h1>
              <p className="text-sm text-slate-500">
                {scenarios.length} saved scenario{scenarios.length !== 1 ? 's' : ''} across {Object.keys(grouped).length} tool{Object.keys(grouped).length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Empty state */}
        {scenarios.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Bookmark size={28} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">No saved scenarios yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
              Use the &quot;Save Scenario&quot; button on any financial tool to save your current inputs and results for later.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              <Wrench size={16} />
              Browse Tools
            </Link>
          </div>
        )}

        {/* Scenarios by tool */}
        {Object.entries(grouped).map(([toolName, toolScenarios]) => (
          <div key={toolName} className="mb-8">
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Wrench size={14} />
              {toolName}
            </h2>
            <div className="space-y-3">
              {toolScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-indigo-200 transition-colors shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 mb-1">
                        {scenario.key_result || 'Saved scenario'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(scenario.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleLoad(scenario)}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
                      >
                        <Play size={12} />
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(scenario.id)}
                        disabled={deletingId === scenario.id}
                        className="flex items-center gap-1.5 px-3 py-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl text-xs font-semibold transition-colors"
                      >
                        {deletingId === scenario.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <footer className="mx-auto max-w-7xl border-t border-[var(--border-primary)] px-6 py-8 text-center text-xs text-[var(--text-tertiary)]">
        &copy; {new Date().getFullYear()} Cortex Technologies. Built for smarter financial decisions.
      </footer>
    </DashboardShell>
  );
}
