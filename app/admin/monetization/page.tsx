'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MousePointerClick,
  Mail,
  HandCoins,
  ShoppingCart,
  UserCheck,
  CircleDollarSign,
  ShieldOff,
} from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import { isInternalTraffic, setInternalTraffic } from '@/lib/analytics';
import { DEFAULT_TOOLS } from '@/lib/tools-registry';
import {
  REVENUE_LINE_LABELS,
  TIME_WINDOWS,
  TIME_WINDOW_LABELS,
  formatRate,
  funnelTotals,
  revenueLines,
  toCount,
  toolLines,
  type RevenueRow,
  type SiteTrafficRow,
  type TimeWindow,
  type ToolFunnelRow,
} from '@/lib/monetization/scorecard';
import {
  AdminPage,
  Callout,
  DataTable,
  IconTile,
  ListGroup,
  ListRow,
  PageSkeleton,
  SegmentedControl,
  Switch,
  type Tone,
} from '@/components/admin/ui';

interface ScorecardResponse {
  setupRequired?: boolean;
  generatedAt?: string;
  excludedUsers?: number;
  traffic?: SiteTrafficRow[];
  funnel?: ToolFunnelRow[];
  revenue?: RevenueRow[];
}

const TOOL_NAMES = new Map(DEFAULT_TOOLS.map((t) => [t.href.replace('/apps/', ''), t.title]));

const fmtNum = (v: string | number) => (typeof v === 'number' ? v.toLocaleString('en-US') : v);

const WINDOW_SHORT: Record<TimeWindow, string> = { '7d': '7 days', '30d': '30 days', all: 'All time' };

function Tile({
  label,
  value,
  icon,
  tone,
  details,
  pending,
}: {
  label: string;
  value: string | number;
  icon: typeof Mail;
  tone: Tone;
  details: [string, string | number][];
  /** Which phase turns this item on, while it isn't built yet. */
  pending?: string;
}) {
  return (
    <div className="ad-group flex flex-col p-4 sm:p-5">
      <div className="flex items-center gap-2.5">
        <IconTile icon={icon} tone={tone} size={28} />
        <span className="min-w-0 text-[14px] font-semibold leading-tight text-[var(--ad-label-2)]">{label}</span>
      </div>
      <p className="mt-3 text-[30px] font-bold tabular-nums tracking-[-0.02em] text-[var(--ad-label)]">{fmtNum(value)}</p>
      {pending && <p className="text-[12.5px] font-semibold text-[var(--ad-label-3)]">Not live yet · {pending}</p>}
      {details.length > 0 && (
        <dl className="mt-3 space-y-1.5 border-t-[0.5px] border-[var(--ad-sep-strong)] pt-3">
          {details.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-3 text-[14px]">
              <dt className="text-[var(--ad-label-2)]">{k}</dt>
              <dd className="font-semibold tabular-nums text-[var(--ad-label)]">{fmtNum(v)}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default function AdminMonetization() {
  const api = useAdminApi();
  const [data, setData] = useState<ScorecardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d');
  const [internal, setInternal] = useState(false);

  useEffect(() => {
    setInternal(isInternalTraffic());
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await api('/api/admin/monetization');
      if (!res.ok) throw new Error(await readError(res, 'Failed to load the scorecard'));
      setData((await res.json()) as ScorecardResponse);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load the scorecard');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    void load();
  }, [load]);

  const tools = useMemo(() => toolLines(data?.funnel ?? [], timeWindow), [data, timeWindow]);
  const totals = useMemo(() => funnelTotals(tools), [tools]);
  const revenue = useMemo(() => revenueLines(data?.revenue ?? [], timeWindow), [data, timeWindow]);
  const traffic = data?.traffic?.find((t) => t.time_window === timeWindow);
  const units = (line: RevenueRow['line']) => revenue.find((r) => r.line === line)?.units ?? 0;
  const knownRevenue = revenue.filter((r) => r.revenue_cents !== null);
  const revenueTotal = knownRevenue.reduce((sum, r) => sum + (r.revenue_cents ?? 0), 0);

  const toggleInternal = (next: boolean) => {
    setInternalTraffic(next);
    setInternal(next);
  };

  return (
    <AdminPage title="Monetization" subtitle="The weekly scorecard: visits to revenue, by tool and by line" onRefresh={load}>
      <div className="space-y-7">
        <SegmentedControl<TimeWindow>
          label="Time window"
          value={timeWindow}
          onChange={setTimeWindow}
          options={TIME_WINDOWS.map((w) => ({ value: w, label: WINDOW_SHORT[w] }))}
          className="sm:max-w-sm"
        />

        {error && <Callout tone="error">{error}</Callout>}

        {data?.setupRequired && (
          <Callout tone="warning" title="The scorecard views aren’t in this database yet.">
            Apply <code>supabase/migrations/20260929120000_monetization_scorecard.sql</code> in the Supabase SQL Editor, then reload
            this page. Tracking already works without it — events are being recorded.
          </Callout>
        )}

        {/* This browser */}
        <ListGroup
          footer={`Admin sign-ins exclude a browser automatically. Bots, previews and localhost never count${
            data?.excludedUsers ? `; ${data.excludedUsers} admin account${data.excludedUsers === 1 ? '' : 's'} excluded` : ''
          }.`}
        >
          <ListRow
            leading={<IconTile icon={ShieldOff} tone="gray" />}
            title="Exclude this browser"
            subtitle={internal ? 'Not counted in the numbers' : 'Counted as a real visitor'}
            trailing={<Switch checked={internal} onChange={toggleInternal} label="Exclude this browser from the numbers" />}
          />
        </ListGroup>

        {loading ? (
          <PageSkeleton tiles={6} rows={5} />
        ) : (
          !data?.setupRequired &&
          data && (
            <>
              {/* The six scorecard items (HANDOFF.md §14) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Tile
                  label="1 · Visits & completions"
                  value={totals.completions}
                  icon={MousePointerClick}
                  tone="navy"
                  details={[
                    ['Site sessions', toCount(traffic?.sessions)],
                    ['Page views', toCount(traffic?.page_views)],
                    ['Tool views', totals.views],
                    ['Completion rate', formatRate(totals.completion_rate)],
                  ]}
                />
                <Tile
                  label="2 · Results emailed"
                  value={totals.reports_sent}
                  icon={Mail}
                  tone="blue"
                  pending="Phase 3"
                  details={[['Report requests', totals.report_requests]]}
                />
                <Tile
                  label="3 · Affiliate clicks & payouts"
                  value={totals.offer_clicks}
                  icon={HandCoins}
                  tone="amber"
                  pending="Phase 1"
                  details={[
                    ['Offer impressions', totals.offer_impressions],
                    ['Confirmed payouts', units('affiliate')],
                  ]}
                />
                <Tile
                  label="4 · Purchases"
                  value={units('lifetime') + units('monthly_subscription')}
                  icon={ShoppingCart}
                  tone="violet"
                  details={[
                    ['Lifetime (Phase 2)', units('lifetime')],
                    ['Monthly / annual Pro', units('monthly_subscription')],
                    ['Unlock prompts seen', totals.unlock_views],
                  ]}
                />
                <Tile label="5 · Advisor requests" value={units('advisor_referral')} icon={UserCheck} tone="sky" pending="Phase 4" details={[]} />
                <Tile
                  label="6 · Revenue"
                  value={knownRevenue.length ? `$${(revenueTotal / 100).toFixed(2)}` : '—'}
                  icon={CircleDollarSign}
                  tone="green"
                  pending={knownRevenue.length ? undefined : 'amounts arrive with Phases 1–2'}
                  details={[]}
                />
              </div>

              {/* By tool */}
              <section className="space-y-3">
                <div className="px-1">
                  <h2 className="text-[20px] font-bold tracking-[-0.01em]">By tool</h2>
                  <p className="mt-1 text-[13px] leading-snug text-[var(--ad-label-3)]">
                    &ldquo;Page views&rdquo; counts /apps page loads and goes back to January. The funnel columns start when Phase 0
                    tracking shipped. A calculation is &ldquo;completed&rdquo; when a visitor changes an input and leaves the result
                    on screen.
                  </p>
                </div>
                <DataTable
                  rows={tools}
                  rowKey={(t) => t.tool_id}
                  minWidth={900}
                  mobileRow={(t) => (
                    <ListRow
                      title={TOOL_NAMES.get(t.tool_id) ?? t.tool_id}
                      subtitle={`${t.views} tool views · ${t.completions} completed`}
                      meta={`${t.page_views} page views · ${t.sessions} sessions · ${t.exits_after_result} left after result · ${t.offer_clicks} offer clicks · ${t.reports_sent} reports · ${t.unlock_views} unlock views · ${t.purchases} purchases`}
                      detail={<span className="font-semibold text-[var(--ad-label)]">{formatRate(t.completion_rate)}</span>}
                    />
                  )}
                  columns={[
                    {
                      key: 'tool',
                      header: 'Tool',
                      cell: (t) => <span className="whitespace-nowrap font-semibold text-[var(--ad-label)]">{TOOL_NAMES.get(t.tool_id) ?? t.tool_id}</span>,
                    },
                    { key: 'pv', header: 'Page views', align: 'right', cell: (t) => t.page_views },
                    { key: 'v', header: 'Tool views', align: 'right', cell: (t) => t.views },
                    { key: 's', header: 'Sessions', align: 'right', cell: (t) => t.sessions },
                    { key: 'c', header: 'Completed', align: 'right', cell: (t) => t.completions },
                    { key: 'r', header: 'Rate', align: 'right', cell: (t) => formatRate(t.completion_rate) },
                    { key: 'x', header: 'Left after result', align: 'right', cell: (t) => t.exits_after_result },
                    { key: 'o', header: 'Offer clicks', align: 'right', cell: (t) => t.offer_clicks },
                    { key: 'rep', header: 'Reports', align: 'right', cell: (t) => t.reports_sent },
                    { key: 'u', header: 'Unlock views', align: 'right', cell: (t) => t.unlock_views },
                    { key: 'p', header: 'Purchases', align: 'right', cell: (t) => t.purchases },
                  ]}
                />
              </section>

              {/* By revenue line */}
              <ListGroup header={`By revenue line · ${TIME_WINDOW_LABELS[timeWindow]}`}>
                {revenue.map((r) => (
                  <ListRow
                    key={r.line}
                    title={REVENUE_LINE_LABELS[r.line] ?? r.line}
                    subtitle={r.source_note}
                    detail={
                      <span className="block leading-tight">
                        <span className="block font-semibold text-[var(--ad-label)]">
                          {r.revenue_cents === null ? '—' : `$${(r.revenue_cents / 100).toFixed(2)}`}
                        </span>
                        <span className="block text-[12.5px] text-[var(--ad-label-3)]">
                          {r.units} unit{r.units === 1 ? '' : 's'}
                        </span>
                      </span>
                    }
                  />
                ))}
              </ListGroup>

              {data.generatedAt && (
                <p className="px-1 text-[12.5px] text-[var(--ad-label-3)]">Updated {new Date(data.generatedAt).toLocaleString()}</p>
              )}
            </>
          )
        )}
      </div>
    </AdminPage>
  );
}
