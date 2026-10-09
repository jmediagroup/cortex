'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, CreditCard, FilePlus2, Megaphone, TrendingUp, Upload, Users, Gauge } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import {
  AdminPage,
  Callout,
  Card,
  CardTitle,
  DetailRow,
  IconTile,
  ListGroup,
  ListRow,
  SkeletonTiles,
  SkeletonList,
  StatTile,
} from '@/components/admin/ui';

interface Stats {
  users: { total: number; free: number; finance_pro: number };
  signups: { last7d: number; last30d: number };
  events: { last7d: number };
  revenue: { mrr: number };
}

const fmt = (n: number) => n.toLocaleString('en-US');
const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function AdminOverview() {
  const api = useAdminApi();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api('/api/admin/stats');
      if (!res.ok) throw new Error(await readError(res, 'Failed to fetch stats'));
      setStats(await res.json());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const total = stats?.users.total ?? 0;
  const pro = stats?.users.finance_pro ?? 0;
  const free = stats?.users.free ?? 0;
  const proPct = total ? (pro / total) * 100 : 0;

  return (
    <AdminPage
      title="Overview"
      eyebrow={<span className="text-[13px] font-semibold uppercase tracking-[0.06em] text-[var(--ad-label-3)]">{today}</span>}
      onRefresh={load}
    >
      <div className="space-y-7">
        {error && <Callout tone="error">{error}</Callout>}

        {loading ? (
          <SkeletonTiles count={4} />
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Total users" value={fmt(total)} icon={Users} tone="navy" />
            <StatTile label="Signups · 7d" value={fmt(stats?.signups.last7d ?? 0)} icon={TrendingUp} tone="green" />
            <StatTile label="MRR" value={money(stats?.revenue.mrr ?? 0)} icon={CreditCard} tone="blue" />
            <StatTile label="Events · 7d" value={fmt(stats?.events.last7d ?? 0)} icon={Activity} tone="amber" />
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-2 lg:gap-6">
          {/* Plan mix */}
          <Card>
            <CardTitle>Plan mix</CardTitle>
            {loading ? (
              <SkeletonList rows={2} avatar={false} />
            ) : (
              <>
                <div
                  className="flex h-3 overflow-hidden rounded-full bg-[var(--ad-fill)]"
                  role="img"
                  aria-label={`${fmt(free)} free, ${fmt(pro)} Pro`}
                >
                  <span className="h-full bg-[#9aa6af]" style={{ width: `${100 - proPct}%` }} />
                  <span className="h-full bg-[var(--ad-green)]" style={{ width: `${Math.max(proPct, total ? 1 : 0)}%` }} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div>
                    <dt className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ad-label-2)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#9aa6af]" aria-hidden="true" /> Free
                    </dt>
                    <dd className="mt-1 text-[22px] font-bold tabular-nums">{fmt(free)}</dd>
                    <dd className="text-[13px] text-[var(--ad-label-3)]">{total ? (100 - proPct).toFixed(1) : '0.0'}%</dd>
                  </div>
                  <div>
                    <dt className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--ad-label-2)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--ad-green)]" aria-hidden="true" /> Pro
                    </dt>
                    <dd className="mt-1 text-[22px] font-bold tabular-nums">{fmt(pro)}</dd>
                    <dd className="text-[13px] text-[var(--ad-label-3)]">{proPct.toFixed(1)}% paid conversion</dd>
                  </div>
                </dl>
              </>
            )}
          </Card>

          {/* Signups */}
          <ListGroup header="Signups">
            <DetailRow label="Last 7 days" value={fmt(stats?.signups.last7d ?? 0)} />
            <DetailRow label="Last 30 days" value={fmt(stats?.signups.last30d ?? 0)} />
            <DetailRow label="Daily average (30d)" value={((stats?.signups.last30d ?? 0) / 30).toFixed(1)} />
          </ListGroup>
        </div>

        <ListGroup header="Shortcuts">
          <ListRow
            href="/admin/content/new?type=article"
            title="Write an article"
            subtitle="Draft in Markdown with a live preview"
            leading={<IconTile icon={FilePlus2} tone="blue" />}
          />
          <ListRow
            href="/admin/ads/campaigns/new"
            title="New ad campaign"
            subtitle="Creatives, targeting and schedule"
            leading={<IconTile icon={Megaphone} tone="orange" />}
          />
          <ListRow
            href="/admin/offers"
            title="Record conversions"
            subtitle="Paste your affiliate network's report"
            leading={<IconTile icon={Upload} tone="amber" />}
          />
          <ListRow
            href="/admin/monetization"
            title="Weekly scorecard"
            subtitle="Visits to revenue, by tool"
            leading={<IconTile icon={Gauge} tone="green" />}
          />
        </ListGroup>
      </div>
    </AdminPage>
  );
}
