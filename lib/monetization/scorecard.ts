/**
 * The monetization scorecard (docs/monetization/HANDOFF.md §14): row shapes
 * for the views in supabase/migrations/20260929120000_monetization_scorecard.sql
 * and the pure helpers that turn them into the six scorecard items.
 *
 * No database or React imports, so Node's test runner can load it.
 */
import { TOOL_IDS } from '../ads/types';

export const TIME_WINDOWS = ['7d', '30d', 'all'] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

export const TIME_WINDOW_LABELS: Record<TimeWindow, string> = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  all: 'All time',
};

/** A row of v_tool_funnel. */
export interface ToolFunnelRow {
  tool_id: string;
  time_window: TimeWindow;
  page_views: number;
  views: number;
  sessions: number;
  completions: number;
  completing_sessions: number;
  exits_after_result: number;
  offer_impressions: number;
  offer_clicks: number;
  report_requests: number;
  reports_sent: number;
  unlock_views: number;
  unlock_clicks: number;
  purchases: number;
  advisor_requests: number;
  completion_rate: number | null;
}

/** A row of v_revenue_by_line. */
export interface RevenueRow {
  line: 'affiliate' | 'lifetime' | 'monthly_subscription' | 'advisor_referral';
  sort_order: number;
  time_window: TimeWindow;
  units: number;
  revenue_cents: number | null;
  source_note: string;
}

/** A row of v_site_traffic. */
export interface SiteTrafficRow {
  time_window: TimeWindow;
  page_views: number;
  sessions: number;
}

export const REVENUE_LINE_LABELS: Record<RevenueRow['line'], string> = {
  affiliate: 'Affiliate offers',
  lifetime: 'Lifetime unlock',
  monthly_subscription: 'Monthly / annual Pro',
  advisor_referral: 'Advisor referrals',
};

const COUNT_KEYS = [
  'page_views',
  'views',
  'sessions',
  'completions',
  'completing_sessions',
  'exits_after_result',
  'offer_impressions',
  'offer_clicks',
  'report_requests',
  'reports_sent',
  'unlock_views',
  'unlock_clicks',
  'purchases',
  'advisor_requests',
] as const;
type CountKey = (typeof COUNT_KEYS)[number];

export type FunnelCounts = Record<CountKey, number> & { completion_rate: number | null };

/** PostgREST returns bigint counts as numbers or strings; normalize to numbers. */
export function toCount(value: unknown): number {
  const n = typeof value === 'string' ? Number(value) : value;
  return typeof n === 'number' && Number.isFinite(n) ? n : 0;
}

function emptyCounts(): FunnelCounts {
  const counts = Object.fromEntries(COUNT_KEYS.map((k) => [k, 0])) as Record<CountKey, number>;
  return { ...counts, completion_rate: null };
}

export function completionRate(completingSessions: number, sessions: number): number | null {
  return sessions > 0 ? completingSessions / sessions : null;
}

export interface ToolLine extends FunnelCounts {
  tool_id: string;
}

/**
 * One line per tool for a window, including tools with no activity (so a
 * dead tool shows up as zeros instead of disappearing), busiest first.
 * Tool ids the views report that aren't in TOOL_IDS (a mistyped /apps URL)
 * are left out.
 */
export function toolLines(rows: readonly ToolFunnelRow[], window: TimeWindow): ToolLine[] {
  const byTool = new Map<string, ToolLine>(
    TOOL_IDS.map((id) => [id, { tool_id: id, ...emptyCounts() }]),
  );
  for (const row of rows) {
    if (row.time_window !== window) continue;
    const line = byTool.get(row.tool_id);
    if (!line) continue;
    for (const key of COUNT_KEYS) line[key] = toCount(row[key]);
    line.completion_rate = completionRate(line.completing_sessions, line.sessions);
  }
  return [...byTool.values()].sort(
    (a, b) => b.views - a.views || b.page_views - a.page_views || a.tool_id.localeCompare(b.tool_id),
  );
}

/**
 * Totals across tools for a window. Sessions are summed per tool, so a
 * visitor who used two tools counts twice; the completion rate is computed
 * from those same per-tool sums, so it stays consistent with the table.
 */
export function funnelTotals(lines: readonly ToolLine[]): FunnelCounts {
  const totals = emptyCounts();
  for (const line of lines) {
    for (const key of COUNT_KEYS) totals[key] += line[key];
  }
  totals.completion_rate = completionRate(totals.completing_sessions, totals.sessions);
  return totals;
}

export function revenueLines(rows: readonly RevenueRow[], window: TimeWindow): RevenueRow[] {
  return rows
    .filter((r) => r.time_window === window)
    .map((r) => ({
      ...r,
      units: toCount(r.units),
      revenue_cents: r.revenue_cents === null ? null : toCount(r.revenue_cents),
    }))
    .sort((a, b) => a.sort_order - b.sort_order);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** User ids from the comma-separated ANALYTICS_EXCLUDED_USER_IDS; anything malformed is skipped. */
export function parseUserIdList(value: string | undefined | null): string[] {
  const ids = (value ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter((s) => UUID_RE.test(s));
  return [...new Set(ids)];
}

export function formatRate(rate: number | null): string {
  return rate === null ? '—' : `${(rate * 100).toFixed(rate > 0 && rate < 0.1 ? 1 : 0)}%`;
}
