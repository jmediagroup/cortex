'use client';

import { useEffect, useState } from 'react';
import { Users, TrendingUp, CreditCard, Activity, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

interface Stats {
  users: { total: number; free: number; finance_pro: number; elite: number };
  signups: { last7d: number; last30d: number };
  events: { last7d: number };
  revenue: { mrr: number };
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch('/api/admin/stats', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch stats');
        setStats(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-xl)] border border-red-200 bg-red-50 p-6 text-red-600 text-sm font-medium">
        {error}
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Users',
      value: stats?.users.total || 0,
      icon: Users,
      color: 'var(--color-accent)',
      bg: 'var(--color-accent-light)',
    },
    {
      label: 'Signups (7d)',
      value: stats?.signups.last7d || 0,
      icon: TrendingUp,
      color: 'var(--color-positive)',
      bg: '#dcfce7',
    },
    {
      label: 'MRR',
      value: `$${(stats?.revenue.mrr || 0).toFixed(2)}`,
      icon: CreditCard,
      color: 'var(--color-info)',
      bg: '#dbeafe',
    },
    {
      label: 'Events (7d)',
      value: stats?.events.last7d || 0,
      icon: Activity,
      color: 'var(--color-warning)',
      bg: '#fef3c7',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-tertiary)] font-medium mt-1">Overview of your platform metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5 transition-all hover:shadow-md"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                {kpi.label}
              </span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]"
                style={{ backgroundColor: kpi.bg, color: kpi.color }}
              >
                <kpi.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-[var(--text-primary)]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* User Distribution */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">User Distribution</h2>
        <div className="space-y-3">
          {[
            { label: 'Free', count: stats?.users.free || 0, color: '#94a3b8' },
            { label: 'Finance Pro', count: stats?.users.finance_pro || 0, color: 'var(--color-accent)' },
            { label: 'Elite', count: stats?.users.elite || 0, color: '#9333ea' },
          ].map((tier) => {
            const pct = stats?.users.total ? Math.round((tier.count / stats.users.total) * 100) : 0;
            return (
              <div key={tier.label} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-[var(--text-secondary)] w-28">{tier.label}</span>
                <div className="flex-1 h-6 rounded-full bg-[var(--surface-tertiary)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 2)}%`, backgroundColor: tier.color }}
                  />
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)] w-16 text-right">
                  {tier.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">Signup Trends</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Last 7 days</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{stats?.signups.last7d || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Last 30 days</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">{stats?.signups.last30d || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Avg daily (30d)</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {((stats?.signups.last30d || 0) / 30).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <h2 className="text-base font-bold text-[var(--text-primary)] mb-3">Paid Conversion</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Paid users</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {(stats?.users.finance_pro || 0) + (stats?.users.elite || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Conversion rate</span>
              <span className="text-sm font-bold text-[var(--text-primary)]">
                {stats?.users.total
                  ? (((stats.users.finance_pro + stats.users.elite) / stats.users.total) * 100).toFixed(1)
                  : '0.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
