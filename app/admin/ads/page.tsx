'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Loader2, Megaphone, Building2, Pause, Play, Eye, MousePointerClick, Percent } from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import { CAMPAIGN_STATUSES, type CampaignStatus } from '@/lib/ads/types';

interface CampaignListRow {
  id: string;
  name: string;
  status: CampaignStatus;
  tool_ids: string[] | null;
  exclude_tool_ids: string[];
  weight: number;
  priority: number;
  starts_at: string | null;
  ends_at: string | null;
  updated_at: string;
  advertiser: { id: string; slug: string; name: string; is_active: boolean } | null;
  placement: { id: string; slug: string; name: string } | null;
  creative_count: number;
}

interface Totals {
  impressions: number;
  clicks: number;
  ctr: number;
}

interface StatsResponse {
  days: number;
  totals: Totals;
  daily: Array<{ day: string; impressions: number; clicks: number }>;
  campaigns: Record<string, Totals>;
  creatives: Record<string, Totals>;
}

const STATUS_STYLES: Record<CampaignStatus, { bg: string; color: string }> = {
  active: { bg: '#dcfce7', color: 'var(--color-positive)' },
  draft: { bg: 'var(--surface-tertiary)', color: 'var(--text-tertiary)' },
  paused: { bg: '#fef3c7', color: 'var(--color-warning)' },
  archived: { bg: '#fee2e2', color: 'var(--crimson-500)' },
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;
const fmtInt = (v: number) => v.toLocaleString('en-US');

function TargetingChip({ row }: { row: CampaignListRow }) {
  if (row.tool_ids === null) {
    return (
      <span className="inline-block rounded-full bg-sky px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-navy">
        All tools{row.exclude_tool_ids.length ? ` −${row.exclude_tool_ids.length}` : ''}
      </span>
    );
  }
  const list = row.tool_ids;
  return (
    <span className="group relative inline-block">
      <span className="inline-block cursor-default rounded-full bg-[var(--surface-tertiary)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
        {list.length} {list.length === 1 ? 'tool' : 'tools'}
      </span>
      {list.length > 0 && (
        <span className="pointer-events-none absolute left-0 top-full z-20 mt-1 hidden w-56 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-2 text-xs text-[var(--text-secondary)] shadow-lg group-hover:block">
          {list.join(', ')}
          {row.exclude_tool_ids.length > 0 && (
            <span className="mt-1 block text-[var(--crimson-500)]">excluding {row.exclude_tool_ids.join(', ')}</span>
          )}
        </span>
      )}
    </span>
  );
}

export default function AdminAdsList() {
  const api = useAdminApi();
  const [rows, setRows] = useState<CampaignListRow[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : '';
      const [campaignsRes, statsRes] = await Promise.all([
        api(`/api/admin/ads/campaigns${qs}`),
        api('/api/admin/ads/stats?days=30'),
      ]);
      if (!campaignsRes.ok) throw new Error(await readError(campaignsRes, 'Failed to load campaigns'));
      setRows((await campaignsRes.json()).campaigns);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, [api, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleStatus(row: CampaignListRow) {
    const next: CampaignStatus = row.status === 'active' ? 'paused' : 'active';
    setBusyId(row.id);
    setError(null);
    try {
      const res = await api(`/api/admin/ads/campaigns/${row.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error(await readError(res, 'Failed to update campaign'));
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update campaign');
    } finally {
      setBusyId(null);
    }
  }

  const chartData = useMemo(
    () =>
      (stats?.daily ?? []).map((d) => ({
        ...d,
        label: new Date(`${d.day}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      })),
    [stats],
  );

  const kpis = [
    { label: 'Impressions (30d)', value: fmtInt(stats?.totals.impressions ?? 0), icon: Eye, color: 'var(--color-info)', bg: '#dbeafe' },
    { label: 'Clicks (30d)', value: fmtInt(stats?.totals.clicks ?? 0), icon: MousePointerClick, color: 'var(--color-positive)', bg: '#dcfce7' },
    { label: 'CTR (30d)', value: fmtPct(stats?.totals.ctr ?? 0), icon: Percent, color: 'var(--color-warning)', bg: '#fef3c7' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Ads</h1>
          <p className="mt-1 text-sm text-[var(--text-tertiary)] font-medium">
            Campaigns, creatives and advertisers served on the calculators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/ads/advertisers"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <Building2 size={16} /> Advertisers
          </Link>
          <Link
            href="/admin/ads/campaigns/new"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-navy px-4 py-2 text-sm font-bold text-white hover:opacity-90"
          >
            <Plus size={16} /> New campaign
          </Link>
        </div>
      </div>

      {/* KPIs + chart */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{kpi.label}</span>
              <div
                className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-md)]"
                style={{ backgroundColor: kpi.bg, color: kpi.color }}
              >
                <kpi.icon size={16} />
              </div>
            </div>
            <p className="text-2xl font-bold text-[var(--text-primary)]">{kpi.value}</p>
          </div>
        ))}
      </div>

      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h2 className="mb-3 text-base font-bold text-[var(--text-primary)]">Daily impressions and clicks</h2>
        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer>
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid stroke="var(--border-primary)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-primary)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="var(--chart-blue)" radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="var(--chart-green)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap items-center gap-2">
        {['', ...CAMPAIGN_STATUSES].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors ${
              statusFilter === s
                ? 'bg-sky text-navy'
                : 'bg-[var(--surface-tertiary)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {s || 'All statuses'}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-[var(--radius-md)] border border-[var(--crimson-border)] bg-[var(--crimson-50)] px-4 py-3 text-sm font-medium text-[var(--crimson-500)]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-12 text-center">
          <Megaphone className="mx-auto mb-3 text-[var(--text-tertiary)]" size={28} />
          <p className="text-sm font-medium text-[var(--text-secondary)]">
            No {statusFilter || ''} campaigns yet. Until a campaign is live, tools show the legacy fallback ads.
          </p>
          <Link href="/admin/ads/campaigns/new" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[var(--color-accent)]">
            <Plus size={14} /> Create your first campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-[var(--border-primary)] text-left text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
                <th className="px-5 py-3">Campaign</th>
                <th className="px-5 py-3">Targeting</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Weight</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3 text-right">Impr.</th>
                <th className="px-5 py-3 text-right">Clicks</th>
                <th className="px-5 py-3 text-right">CTR</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const badge = STATUS_STYLES[row.status] ?? STATUS_STYLES.draft;
                const s = stats?.campaigns[row.id];
                const schedule =
                  row.starts_at || row.ends_at
                    ? `${fmtDate(row.starts_at) ?? '…'} → ${fmtDate(row.ends_at) ?? '…'}`
                    : 'Always on';
                return (
                  <tr key={row.id} className="border-b border-[var(--border-primary)] last:border-0 hover:bg-[var(--surface-secondary)]">
                    <td className="px-5 py-3">
                      <Link href={`/admin/ads/campaigns/${row.id}`} className="font-semibold text-[var(--text-primary)] hover:text-[var(--color-accent)]">
                        {row.name || '(untitled)'}
                      </Link>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        {row.advertiser?.name ?? 'No advertiser'} · {row.placement?.slug ?? 'no placement'} · {row.creative_count}{' '}
                        {row.creative_count === 1 ? 'creative' : 'creatives'}
                        {row.advertiser && !row.advertiser.is_active && (
                          <span className="ml-1 text-[var(--crimson-500)]">(advertiser inactive)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <TargetingChip row={row} />
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                        style={{ backgroundColor: badge.bg, color: badge.color }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[var(--text-secondary)]">
                      {row.weight}
                      {row.priority !== 0 && <span className="ml-1 text-xs text-[var(--text-tertiary)]">p{row.priority}</span>}
                    </td>
                    <td className="px-5 py-3 text-xs text-[var(--text-tertiary)]">{schedule}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-[var(--text-secondary)]">{fmtInt(s?.impressions ?? 0)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-[var(--text-secondary)]">{fmtInt(s?.clicks ?? 0)}</td>
                    <td className="px-5 py-3 text-right tabular-nums text-[var(--text-secondary)]">{fmtPct(s?.ctr ?? 0)}</td>
                    <td className="px-5 py-3 text-right">
                      {(row.status === 'active' || row.status === 'paused') && (
                        <button
                          onClick={() => toggleStatus(row)}
                          disabled={busyId === row.id}
                          className="inline-flex items-center gap-1 rounded-[var(--radius-md)] border border-[var(--border-primary)] px-2.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-50"
                          title={row.status === 'active' ? 'Pause campaign' : 'Activate campaign'}
                        >
                          {busyId === row.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : row.status === 'active' ? (
                            <Pause size={12} />
                          ) : (
                            <Play size={12} />
                          )}
                          {row.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
