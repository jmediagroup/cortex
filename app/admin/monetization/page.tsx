'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Loader2,
  MousePointerClick,
  Mail,
  HandCoins,
  ShoppingCart,
  UserCheck,
  CircleDollarSign,
  ShieldOff,
  AlertCircle,
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

interface ScorecardResponse {
  setupRequired?: boolean;
  generatedAt?: string;
  excludedUsers?: number;
  traffic?: SiteTrafficRow[];
  funnel?: ToolFunnelRow[];
  revenue?: RevenueRow[];
}

const TOOL_NAMES = new Map(DEFAULT_TOOLS.map((t) => [t.href.replace('/apps/', ''), t.title]));

const card = 'rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]';
const cardShadow = { boxShadow: 'var(--shadow-card)' };

function Tile({
  label,
  value,
  icon: Icon,
  details,
  pending,
}: {
  label: string;
  value: string | number;
  icon: typeof Mail;
  details: [string, string | number][];
  /** Which phase turns this item on, while it isn't built yet. */
  pending?: string;
}) {
  return (
    <div className={`${card} p-5`} style={cardShadow}>
      <div className="flex items-center justify-between mb-3 gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</span>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface-tertiary)] text-[var(--text-secondary)]">
          <Icon size={16} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[var(--text-primary)]">{value}</p>
      {pending && (
        <p className="mt-1 text-xs font-semibold text-[var(--text-tertiary)]">Not live yet · {pending}</p>
      )}
      <dl className="mt-3 space-y-1">
        {details.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 text-sm">
            <dt className="text-[var(--text-secondary)]">{k}</dt>
            <dd className="font-semibold text-[var(--text-primary)]">{v}</dd>
          </div>
        ))}
      </dl>
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

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api('/api/admin/monetization');
        if (!res.ok) throw new Error(await readError(res, 'Failed to load the scorecard'));
        const json = (await res.json()) as ScorecardResponse;
        if (active) setData(json);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Failed to load the scorecard');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api]);

  const tools = useMemo(() => toolLines(data?.funnel ?? [], timeWindow), [data, timeWindow]);
  const totals = useMemo(() => funnelTotals(tools), [tools]);
  const revenue = useMemo(() => revenueLines(data?.revenue ?? [], timeWindow), [data, timeWindow]);
  const traffic = data?.traffic?.find((t) => t.time_window === timeWindow);
  const units = (line: RevenueRow['line']) => revenue.find((r) => r.line === line)?.units ?? 0;
  const knownRevenue = revenue.filter((r) => r.revenue_cents !== null);
  const revenueTotal = knownRevenue.reduce((sum, r) => sum + (r.revenue_cents ?? 0), 0);

  const toggleInternal = () => {
    setInternalTraffic(!internal);
    setInternal(!internal);
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">Monetization</h1>
          <p className="text-sm text-[var(--text-tertiary)] font-medium mt-1">
            The weekly scorecard: visits to revenue, by tool and by line
          </p>
        </div>
        <select
          value={timeWindow}
          onChange={(e) => setTimeWindow(e.target.value as TimeWindow)}
          className="px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          aria-label="Time window"
        >
          {TIME_WINDOWS.map((w) => (
            <option key={w} value={w}>
              {TIME_WINDOW_LABELS[w]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className={`${card} p-4 flex items-start gap-3 text-sm text-[var(--color-negative)]`}>
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {data?.setupRequired && (
        <div className={`${card} p-5 text-sm text-[var(--text-secondary)] space-y-2`} style={cardShadow}>
          <p className="font-bold text-[var(--text-primary)]">The scorecard views aren&apos;t in this database yet.</p>
          <p>
            Apply <code>supabase/migrations/20260929120000_monetization_scorecard.sql</code> in the Supabase SQL
            Editor, then reload this page. Tracking already works without it — events are being recorded.
          </p>
        </div>
      )}

      {/* This browser */}
      <div className={`${card} p-4 flex flex-wrap items-center justify-between gap-3`} style={cardShadow}>
        <div className="flex items-start gap-3 text-sm">
          <ShieldOff size={18} className="shrink-0 mt-0.5 text-[var(--text-tertiary)]" />
          <div>
            <p className="font-semibold text-[var(--text-primary)]">
              {internal ? 'This browser is excluded from the numbers.' : 'This browser counts as a real visitor.'}
            </p>
            <p className="text-[var(--text-tertiary)]">
              Admin sign-ins exclude a browser automatically. Bots, previews and localhost never count
              {data?.excludedUsers ? `; ${data.excludedUsers} admin account${data.excludedUsers === 1 ? '' : 's'} excluded` : ''}.
            </p>
          </div>
        </div>
        <button
          onClick={toggleInternal}
          className="px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--border-primary)] text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-tertiary)]"
        >
          {internal ? 'Count this browser' : 'Exclude this browser'}
        </button>
      </div>

      {!data?.setupRequired && data && (
        <>
          {/* The six scorecard items (HANDOFF.md §14) */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <Tile
              label="1 · Visits & completions"
              value={totals.completions}
              icon={MousePointerClick}
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
              pending="Phase 3"
              details={[['Report requests', totals.report_requests]]}
            />
            <Tile
              label="3 · Affiliate clicks & payouts"
              value={totals.offer_clicks}
              icon={HandCoins}
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
              details={[
                ['Lifetime (Phase 2)', units('lifetime')],
                ['Monthly / annual Pro', units('monthly_subscription')],
                ['Unlock prompts seen', totals.unlock_views],
              ]}
            />
            <Tile
              label="5 · Advisor requests"
              value={units('advisor_referral')}
              icon={UserCheck}
              pending="Phase 4"
              details={[]}
            />
            <Tile
              label="6 · Revenue"
              value={knownRevenue.length ? `$${(revenueTotal / 100).toFixed(2)}` : '—'}
              icon={CircleDollarSign}
              pending={knownRevenue.length ? undefined : 'amounts arrive with Phases 1–2'}
              details={[]}
            />
          </div>

          {/* By tool */}
          <div className={`${card} p-6`} style={cardShadow}>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-1">By tool</h2>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              &ldquo;Page views&rdquo; counts /apps page loads and goes back to January. The funnel columns start
              when Phase 0 tracking shipped. A calculation is &ldquo;completed&rdquo; when a visitor changes an
              input and leaves the result on screen.
            </p>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[760px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                    {['Tool', 'Page views', 'Tool views', 'Sessions', 'Completed', 'Rate', 'Left after result', 'Offer clicks', 'Reports', 'Unlock views', 'Purchases'].map((h) => (
                      <th key={h} className="px-2 py-2 font-bold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tools.map((t) => (
                    <tr key={t.tool_id} className="border-t border-[var(--border-primary)]">
                      <td className="px-2 py-2 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {TOOL_NAMES.get(t.tool_id) ?? t.tool_id}
                      </td>
                      <td className="px-2 py-2">{t.page_views}</td>
                      <td className="px-2 py-2">{t.views}</td>
                      <td className="px-2 py-2">{t.sessions}</td>
                      <td className="px-2 py-2">{t.completions}</td>
                      <td className="px-2 py-2">{formatRate(t.completion_rate)}</td>
                      <td className="px-2 py-2">{t.exits_after_result}</td>
                      <td className="px-2 py-2">{t.offer_clicks}</td>
                      <td className="px-2 py-2">{t.reports_sent}</td>
                      <td className="px-2 py-2">{t.unlock_views}</td>
                      <td className="px-2 py-2">{t.purchases}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By revenue line */}
          <div className={`${card} p-6`} style={cardShadow}>
            <h2 className="text-base font-bold text-[var(--text-primary)] mb-4">By revenue line</h2>
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-[var(--text-tertiary)]">
                    {['Line', 'Units', 'Revenue', 'Source'].map((h) => (
                      <th key={h} className="px-2 py-2 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {revenue.map((r) => (
                    <tr key={r.line} className="border-t border-[var(--border-primary)]">
                      <td className="px-2 py-2 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {REVENUE_LINE_LABELS[r.line] ?? r.line}
                      </td>
                      <td className="px-2 py-2">{r.units}</td>
                      <td className="px-2 py-2">
                        {r.revenue_cents === null ? '—' : `$${(r.revenue_cents / 100).toFixed(2)}`}
                      </td>
                      <td className="px-2 py-2 text-[var(--text-tertiary)]">{r.source_note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.generatedAt && (
            <p className="text-xs text-[var(--text-tertiary)]">
              Updated {new Date(data.generatedAt).toLocaleString()}
            </p>
          )}
        </>
      )}
    </div>
  );
}
