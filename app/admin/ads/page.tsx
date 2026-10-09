'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Building2, ChevronRight, Megaphone, Plus } from 'lucide-react';
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
import { bannerAdsEnabled } from '@/lib/ads/flags';
import {
  AdminPage,
  Button,
  Callout,
  Card,
  CardTitle,
  DataTable,
  EmptyState,
  FilterChips,
  IconTile,
  ListGroup,
  ListRow,
  Pill,
  SkeletonList,
  StatTile,
  Switch,
  useToast,
  type Tone,
} from '@/components/admin/ui';

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

const STATUS_TONE: Record<CampaignStatus, Tone> = {
  active: 'green',
  draft: 'gray',
  paused: 'amber',
  archived: 'red',
};

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;
const fmtPct = (v: number) => `${(v * 100).toFixed(2)}%`;
const fmtInt = (v: number) => v.toLocaleString('en-US');
const fmtAxis = (v: number) => (v >= 1000 ? `${Number((v / 1000).toFixed(1))}k` : String(v));

function targetingLabel(row: CampaignListRow) {
  if (row.tool_ids === null) {
    return `All tools${row.exclude_tool_ids.length ? ` −${row.exclude_tool_ids.length}` : ''}`;
  }
  return `${row.tool_ids.length} ${row.tool_ids.length === 1 ? 'tool' : 'tools'}`;
}

function targetingTitle(row: CampaignListRow) {
  const parts = [row.tool_ids === null ? 'All tools' : row.tool_ids.join(', ') || 'No tools'];
  if (row.exclude_tool_ids.length) parts.push(`excluding ${row.exclude_tool_ids.join(', ')}`);
  return parts.join(' · ');
}

function scheduleLabel(row: CampaignListRow) {
  return row.starts_at || row.ends_at ? `${fmtDate(row.starts_at) ?? '…'} → ${fmtDate(row.ends_at) ?? '…'}` : 'Always on';
}

export default function AdminAdsList() {
  const api = useAdminApi();
  const router = useRouter();
  const toast = useToast();
  const [rows, setRows] = useState<CampaignListRow[]>([]);
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
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
    setLoading(true);
    void load();
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
      toast(next === 'active' ? 'Campaign activated' : 'Campaign paused');
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

  const toggleable = (row: CampaignListRow) => row.status === 'active' || row.status === 'paused';

  return (
    <AdminPage
      title="Ads"
      subtitle="Campaigns, creatives and advertisers on the calculators"
      onRefresh={load}
      actions={[
        { label: 'Advertisers', icon: Building2, href: '/admin/ads/advertisers' },
        { label: 'New campaign', icon: Plus, variant: 'primary', href: '/admin/ads/campaigns/new' },
      ]}
    >
      <div className="space-y-6">
        {!bannerAdsEnabled() && (
          <Callout tone="warning" title="Banner ads are switched off site-wide.">
            Nothing here is shown to visitors until NEXT_PUBLIC_BANNER_ADS_ENABLED is set to &ldquo;true&rdquo; in Vercel and the
            site is redeployed.
          </Callout>
        )}

        <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
          <StatTile compact label="Impressions" value={fmtInt(stats?.totals.impressions ?? 0)} sub="Last 30 days" />
          <StatTile compact label="Clicks" value={fmtInt(stats?.totals.clicks ?? 0)} sub="Last 30 days" />
          <StatTile compact label="CTR" value={fmtPct(stats?.totals.ctr ?? 0)} sub="Last 30 days" />
        </div>

        <Card>
          <CardTitle>Daily impressions and clicks</CardTitle>
          <div className="-mx-1 h-[200px] sm:h-[240px]">
            <ResponsiveContainer>
              <ComposedChart data={chartData} margin={{ top: 4, right: 0, left: -6, bottom: 0 }}>
                <CartesianGrid stroke="var(--ad-sep)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--ad-label-3)' }} tickLine={false} axisLine={false} minTickGap={28} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: 'var(--ad-label-3)' }} tickLine={false} axisLine={false} allowDecimals={false} width={40} tickFormatter={fmtAxis} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: 'var(--ad-label-3)' }} tickLine={false} axisLine={false} allowDecimals={false} width={32} />
                <Tooltip
                  cursor={{ fill: 'rgba(5,76,125,0.05)' }}
                  contentStyle={{ background: '#fff', border: '0.5px solid var(--ad-sep-strong)', borderRadius: 12, fontSize: 12, boxShadow: 'var(--ad-shadow-lg)' }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" iconSize={8} />
                <Bar yAxisId="left" dataKey="impressions" name="Impressions" fill="var(--ad-blue)" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="clicks" name="Clicks" stroke="var(--ad-green)" strokeWidth={2.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-3">
          <h2 className="px-1 text-[20px] font-bold tracking-[-0.01em]">Campaigns</h2>
          <FilterChips
            groups={[
              {
                label: 'Status',
                value: statusFilter,
                onChange: setStatusFilter,
                options: [{ value: '', label: 'All' }, ...CAMPAIGN_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))],
              },
            ]}
          />
        </div>

        {error && <Callout tone="error">{error}</Callout>}

        {loading ? (
          <SkeletonList rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title={`No ${statusFilter || ''} campaigns yet`}
            message="Until a campaign is live, tools show the legacy fallback ads."
            action={
              <Button variant="primary" icon={Plus} href="/admin/ads/campaigns/new">
                Create a campaign
              </Button>
            }
          />
        ) : (
          <>
            {/* Phones & tablets: one card per campaign */}
            <div className="grid gap-3 md:grid-cols-2 lg:hidden">
              {rows.map((row) => {
                const s = stats?.campaigns[row.id];
                return (
                  <article key={row.id} className="ad-group">
                    <div className="flex items-start gap-3 px-4 pb-3 pt-4">
                      <Link href={`/admin/ads/campaigns/${row.id}`} className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <Pill tone={STATUS_TONE[row.status] ?? 'gray'}>{row.status}</Pill>
                          <span className="truncate text-[12.5px] text-[var(--ad-label-3)]" title={targetingTitle(row)}>
                            {targetingLabel(row)}
                          </span>
                        </span>
                        <span className="mt-1.5 block text-[17px] font-bold leading-snug text-[var(--ad-label)]">{row.name || '(untitled)'}</span>
                        <span className="mt-0.5 block truncate text-[13.5px] text-[var(--ad-label-2)]">
                          {row.advertiser?.name ?? 'No advertiser'} · {row.placement?.slug ?? 'no placement'}
                          {row.advertiser && !row.advertiser.is_active && <span className="text-[var(--ad-red)]"> (advertiser inactive)</span>}
                        </span>
                      </Link>
                      {toggleable(row) && (
                        <Switch
                          checked={row.status === 'active'}
                          disabled={busyId === row.id}
                          onChange={() => toggleStatus(row)}
                          label={row.status === 'active' ? `Pause ${row.name}` : `Activate ${row.name}`}
                        />
                      )}
                    </div>
                    <Link
                      href={`/admin/ads/campaigns/${row.id}`}
                      className="flex items-center border-t-[0.5px] border-[var(--ad-sep-strong)] px-4 py-3 transition-colors active:bg-[var(--ad-pressed)]"
                      aria-label={`Open ${row.name}`}
                    >
                      <dl className="grid flex-1 grid-cols-3 gap-2">
                        {[
                          ['Impr.', fmtInt(s?.impressions ?? 0)],
                          ['Clicks', fmtInt(s?.clicks ?? 0)],
                          ['CTR', fmtPct(s?.ctr ?? 0)],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <dt className="text-[11.5px] font-semibold uppercase tracking-[0.04em] text-[var(--ad-label-3)]">{k}</dt>
                            <dd className="text-[16px] font-bold tabular-nums text-[var(--ad-label)]">{v}</dd>
                          </div>
                        ))}
                      </dl>
                      <ChevronRight size={18} className="shrink-0 text-[var(--ad-label-3)] opacity-60" aria-hidden="true" />
                    </Link>
                  </article>
                );
              })}
            </div>

            {/* Desktop: table */}
            <div className="hidden lg:block">
              <DataTable
                rows={rows}
                rowKey={(r) => r.id}
                onRowClick={(r) => router.push(`/admin/ads/campaigns/${r.id}`)}
                columns={[
                  {
                    key: 'name',
                    header: 'Campaign',
                    cell: (row) => (
                      <span className="block min-w-0">
                        <span className="block max-w-[280px] truncate font-semibold text-[var(--ad-label)]">{row.name || '(untitled)'}</span>
                        <span className="block max-w-[280px] truncate text-[13px] text-[var(--ad-label-3)]">
                          {row.advertiser?.name ?? 'No advertiser'} · {row.placement?.slug ?? 'no placement'} · {row.creative_count}{' '}
                          {row.creative_count === 1 ? 'creative' : 'creatives'}
                          {row.advertiser && !row.advertiser.is_active && <span className="text-[var(--ad-red)]"> (advertiser inactive)</span>}
                        </span>
                      </span>
                    ),
                  },
                  {
                    key: 'targeting',
                    header: 'Targeting',
                    cell: (row) => (
                      <span title={targetingTitle(row)}>
                        <Pill tone={row.tool_ids === null ? 'sky' : 'gray'}>{targetingLabel(row)}</Pill>
                      </span>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    cell: (row) => (
                      <span className="block">
                        <Pill tone={STATUS_TONE[row.status] ?? 'gray'}>{row.status}</Pill>
                        <span className="mt-1 block whitespace-nowrap text-[12px] text-[var(--ad-label-3)]">{scheduleLabel(row)}</span>
                      </span>
                    ),
                  },
                  {
                    key: 'weight',
                    header: 'Weight',
                    cell: (row) => (
                      <>
                        {row.weight}
                        {row.priority !== 0 && <span className="ml-1 text-[12px] text-[var(--ad-label-3)]">p{row.priority}</span>}
                      </>
                    ),
                  },
                  { key: 'impr', header: 'Impr.', align: 'right', cell: (row) => fmtInt(stats?.campaigns[row.id]?.impressions ?? 0) },
                  { key: 'clicks', header: 'Clicks', align: 'right', cell: (row) => fmtInt(stats?.campaigns[row.id]?.clicks ?? 0) },
                  { key: 'ctr', header: 'CTR', align: 'right', cell: (row) => fmtPct(stats?.campaigns[row.id]?.ctr ?? 0) },
                  {
                    key: 'live',
                    header: 'Live',
                    align: 'right',
                    cell: (row) =>
                      toggleable(row) ? (
                        <Switch
                          checked={row.status === 'active'}
                          disabled={busyId === row.id}
                          onChange={() => toggleStatus(row)}
                          label={row.status === 'active' ? `Pause ${row.name}` : `Activate ${row.name}`}
                        />
                      ) : null,
                  },
                ]}
              />
            </div>
          </>
        )}

        <ListGroup className="lg:hidden">
          <ListRow
            href="/admin/ads/advertisers"
            leading={<IconTile icon={Building2} tone="orange" />}
            title="Advertisers"
            subtitle="Affiliate partners whose campaigns run on the site"
          />
        </ListGroup>
      </div>
    </AdminPage>
  );
}
