'use client';

import { useCallback, useEffect, useState } from 'react';
import { CreditCard } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import { getTierDisplayName, type Tier } from '@/lib/access-control';
import {
  AdminPage,
  Avatar,
  Callout,
  DataTable,
  EmptyState,
  ListRow,
  Pager,
  Pill,
  SkeletonList,
  type Tone,
} from '@/components/admin/ui';

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

const STATUS_TONE: Record<string, Tone> = {
  active: 'green',
  trialing: 'blue',
  past_due: 'amber',
  canceled: 'red',
  incomplete: 'gray',
};

const statusOf = (s: Subscription) => s.stripe?.status || s.subscription_status || 'unknown';
const amountOf = (s: Subscription) =>
  s.stripe?.plan_amount ? `$${(s.stripe.plan_amount / 100).toFixed(2)}/${s.stripe.plan_interval}` : '—';
const renewsOf = (s: Subscription) =>
  s.stripe?.current_period_end
    ? new Date(s.stripe.current_period_end * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

function StatusPill({ sub }: { sub: Subscription }) {
  const status = statusOf(sub);
  return <Pill tone={STATUS_TONE[status] ?? 'gray'}>{status.replace('_', ' ')}</Pill>;
}

export default function AdminSubscriptions() {
  const api = useAdminApi();
  const [data, setData] = useState<SubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      const res = await api(`/api/admin/subscriptions?page=${page}`);
      if (!res.ok) throw new Error(await readError(res, 'Failed to fetch subscriptions'));
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  }, [api, page]);

  useEffect(() => {
    void load();
  }, [load]);

  const mrr = (data?.mrr ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <AdminPage
      title="Subscriptions"
      subtitle={data ? `${data.total.toLocaleString('en-US')} subscriber${data.total === 1 ? '' : 's'}` : undefined}
      onRefresh={load}
    >
      <div className="space-y-6">
        <div className="mgm-band relative overflow-hidden !rounded-[16px] p-5 sm:p-6">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[rgba(255,255,255,0.7)]">Monthly recurring revenue</p>
          <p className="mt-1 text-[38px] font-extrabold tabular-nums tracking-[-0.03em] text-white sm:text-[44px]">{loading ? '—' : mrr}</p>
          <CreditCard size={88} className="pointer-events-none absolute -bottom-4 -right-3 text-white opacity-[0.08]" aria-hidden="true" />
        </div>

        {error && <Callout tone="error">{error}</Callout>}

        {loading ? (
          <SkeletonList rows={6} />
        ) : !data?.subscriptions.length ? (
          <EmptyState icon={CreditCard} title="No active subscriptions" />
        ) : (
          <DataTable
            rows={data.subscriptions}
            rowKey={(s) => s.id}
            mobileRow={(s) => (
              <ListRow
                leading={<Avatar name={s.email} tone="violet" />}
                title={s.email}
                subtitle={`${amountOf(s)} · renews ${renewsOf(s)}`}
                meta={
                  <span className="flex flex-wrap items-center gap-2">
                    <StatusPill sub={s} />
                    {s.stripe?.cancel_at_period_end && <span className="font-semibold text-[var(--ad-red)]">Cancels at period end</span>}
                  </span>
                }
              />
            )}
            columns={[
              {
                key: 'email',
                header: 'Subscriber',
                cell: (s) => <span className="block max-w-[300px] truncate font-semibold text-[var(--ad-label)]">{s.email}</span>,
              },
              { key: 'tier', header: 'Plan', cell: (s) => getTierDisplayName(s.tier as Tier) },
              { key: 'status', header: 'Status', cell: (s) => <StatusPill sub={s} /> },
              { key: 'amount', header: 'Amount', align: 'right', cell: amountOf },
              { key: 'renews', header: 'Renews', align: 'right', cell: renewsOf },
              {
                key: 'cancel',
                header: 'Canceling',
                align: 'right',
                cell: (s) =>
                  s.stripe?.cancel_at_period_end ? <span className="font-bold text-[var(--ad-red)]">Yes</span> : 'No',
              },
            ]}
          />
        )}

        {data && <Pager page={data.page} totalPages={data.totalPages} onPage={setPage} />}
      </div>
    </AdminPage>
  );
}
