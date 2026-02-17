'use client';

import { useEffect, useState } from 'react';
import { Loader2, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { getTierDisplayName } from '@/lib/access-control';

interface Subscription {
  id: string;
  email: string;
  tier: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  created_at: string;
  stripe: {
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
    plan_amount: number | null;
    plan_interval: string | null;
  } | null;
}

interface SubscriptionsResponse {
  subscriptions: Subscription[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  mrr: number;
}

export default function AdminSubscriptions() {
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch(`/api/admin/subscriptions?page=${page}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch subscriptions');
        setData(await res.json());
      } catch {
        // Error handled by empty state
      } finally {
        setLoading(false);
      }
    };
    fetchSubscriptions();
  }, [page]);

  const statusBadge = (status: string | null) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      trialing: 'bg-blue-100 text-blue-700',
      past_due: 'bg-yellow-100 text-yellow-700',
      canceled: 'bg-red-100 text-red-700',
      incomplete: 'bg-gray-100 text-gray-700',
    };
    const s = status || 'unknown';
    return (
      <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${colors[s] || 'bg-gray-100 text-gray-600'}`}>
        {s}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Subscriptions</h1>
        <p className="text-sm text-[var(--text-tertiary)] font-medium mt-1">
          {data?.total || 0} subscribers
        </p>
      </div>

      {/* MRR Card */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-green-100 text-green-600">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">Monthly Recurring Revenue</p>
            <p className="text-3xl font-black text-[var(--text-primary)]">${(data?.mrr || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {!data?.subscriptions.length ? (
          <div className="text-center py-16 text-[var(--text-tertiary)] text-sm font-medium">
            No active subscriptions
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)]">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Email</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Tier</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Status</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Amount</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Renews</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Canceling</th>
                </tr>
              </thead>
              <tbody>
                {data.subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-[var(--border-secondary)] last:border-0 hover:bg-[var(--surface-secondary)] transition-colors">
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">
                      <span className="truncate max-w-[200px] block">{sub.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold">{getTierDisplayName(sub.tier as any)}</span>
                    </td>
                    <td className="px-4 py-3">{statusBadge(sub.stripe?.status || sub.subscription_status)}</td>
                    <td className="px-4 py-3 text-[var(--text-secondary)] text-xs font-medium">
                      {sub.stripe?.plan_amount
                        ? `$${(sub.stripe.plan_amount / 100).toFixed(2)}/${sub.stripe.plan_interval}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--text-tertiary)] text-xs">
                      {sub.stripe?.current_period_end
                        ? new Date(sub.stripe.current_period_end * 1000).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {sub.stripe?.cancel_at_period_end ? (
                        <span className="text-[var(--color-negative)] font-bold">Yes</span>
                      ) : (
                        <span className="text-[var(--text-tertiary)]">No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[var(--border-secondary)] px-4 py-3 bg-[var(--surface-secondary)]">
            <span className="text-xs text-[var(--text-tertiary)] font-medium">
              Page {data.page} of {data.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-md border border-[var(--border-primary)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--surface-primary)] transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="p-1.5 rounded-md border border-[var(--border-primary)] text-[var(--text-secondary)] disabled:opacity-40 hover:bg-[var(--surface-primary)] transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
