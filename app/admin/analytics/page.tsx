'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, MousePointerClick, TrendingUp } from 'lucide-react';
import { useAdminApi, readError } from '@/components/admin/useAdminApi';
import {
  AdminPage,
  Callout,
  Card,
  CardTitle,
  DataTable,
  ListRow,
  PageSkeleton,
  SegmentedControl,
} from '@/components/admin/ui';

interface AnalyticsData {
  eventCounts: Record<string, number>;
  recentEvents: {
    id: number;
    event_type: string;
    user_id: string | null;
    page_url: string | null;
    created_at: string;
  }[];
  signupsByDay: { date: string; count: number }[];
}

const EVENT_CATEGORIES: Record<string, { label: string; color: string }> = {
  user_signup: { label: 'Signups', color: 'var(--ad-green)' },
  user_login: { label: 'Logins', color: 'var(--ad-blue)' },
  page_view: { label: 'Page views', color: 'var(--ad-tint)' },
  dashboard_visit: { label: 'Dashboard visits', color: '#5b4bc4' },
  app_opened: { label: 'App opens', color: '#c98a0b' },
  calculation_completed: { label: 'Calculations', color: '#2e9e8d' },
  pricing_page_view: { label: 'Pricing views', color: 'var(--ad-orange)' },
  subscription_upgrade: { label: 'Upgrades', color: '#1f9ccc' },
  error_occurred: { label: 'Errors', color: 'var(--ad-red)' },
};

const DAY_OPTIONS = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
];

const shortDate = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const timeAgo = (iso: string) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function AdminAnalytics() {
  const api = useAdminApi();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState('30');

  const load = useCallback(async () => {
    try {
      const res = await api(`/api/admin/analytics?days=${days}`);
      if (!res.ok) throw new Error(await readError(res, 'Failed to fetch analytics'));
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [api, days]);

  useEffect(() => {
    setLoading(true);
    void load();
  }, [load]);

  const totalEvents = Object.values(data?.eventCounts || {}).reduce((a, b) => a + b, 0);
  const sortedEvents = Object.entries(data?.eventCounts || {}).sort(([, a], [, b]) => b - a);
  const maxEventCount = sortedEvents.length > 0 ? sortedEvents[0][1] : 1;
  const signups = data?.signupsByDay ?? [];
  const maxSignups = Math.max(1, ...signups.map((d) => d.count));
  const totalSignups = signups.reduce((s, d) => s + d.count, 0);

  return (
    <AdminPage
      title="Analytics"
      subtitle={data ? `${totalEvents.toLocaleString('en-US')} events in the last ${days} days` : undefined}
      onRefresh={load}
    >
      <div className="space-y-6">
        <SegmentedControl label="Time range" value={days} onChange={setDays} options={DAY_OPTIONS} className="sm:max-w-sm" />

        {error && <Callout tone="error">{error}</Callout>}

        {loading ? (
          <PageSkeleton rows={6} />
        ) : (
          <>
            {signups.length > 0 && (
              <Card>
                <CardTitle icon={TrendingUp} action={<span className="text-[13px] font-semibold text-[var(--ad-label-3)]">{totalSignups.toLocaleString('en-US')} total</span>}>
                  Signups
                </CardTitle>
                <div className="flex h-36 items-end gap-[3px] sm:gap-1" role="img" aria-label={`Signups per day, ${shortDate(signups[0].date)} to ${shortDate(signups[signups.length - 1].date)}`}>
                  {signups.map((day) => (
                    <div
                      key={day.date}
                      title={`${shortDate(day.date)}: ${day.count}`}
                      className="min-h-[3px] flex-1 rounded-t-[4px] bg-[var(--ad-green)] opacity-90 transition-[height] duration-500"
                      style={{ height: `${Math.max((day.count / maxSignups) * 100, 2)}%` }}
                    />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[12px] text-[var(--ad-label-3)]">
                  <span>{shortDate(signups[0].date)}</span>
                  <span>{shortDate(signups[signups.length - 1].date)}</span>
                </div>
              </Card>
            )}

            <Card>
              <CardTitle icon={MousePointerClick}>Events by type</CardTitle>
              {sortedEvents.length === 0 ? (
                <p className="py-6 text-center text-[14px] text-[var(--ad-label-3)]">No events recorded</p>
              ) : (
                <ul className="space-y-3.5">
                  {sortedEvents.map(([type, count]) => {
                    const category = EVENT_CATEGORIES[type];
                    return (
                      <li key={type}>
                        <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[14px]">
                          <span className="truncate font-medium text-[var(--ad-label-2)]">{category?.label || type}</span>
                          <span className="font-bold tabular-nums text-[var(--ad-label)]">{count.toLocaleString('en-US')}</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[var(--ad-fill)]">
                          <div
                            className="h-full rounded-full transition-[width] duration-500"
                            style={{ width: `${Math.max((count / maxEventCount) * 100, 2)}%`, background: category?.color || 'var(--ad-tint)' }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <div className="space-y-3">
              <h2 className="flex items-center gap-2 px-1 text-[20px] font-bold tracking-[-0.01em]">
                <Activity size={18} className="text-[var(--ad-label-3)]" aria-hidden="true" /> Recent events
              </h2>
              {(data?.recentEvents ?? []).length === 0 ? (
                <p className="px-1 text-[14px] text-[var(--ad-label-3)]">No recent events.</p>
              ) : (
                <DataTable
                  rows={(data?.recentEvents ?? []).slice(0, 20)}
                  rowKey={(e) => String(e.id)}
                  mobileRow={(e) => (
                    <ListRow
                      leading={
                        <span
                          aria-hidden="true"
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ background: EVENT_CATEGORIES[e.event_type]?.color || 'var(--ad-label-3)' }}
                        />
                      }
                      title={EVENT_CATEGORIES[e.event_type]?.label || e.event_type}
                      subtitle={e.page_url || '—'}
                      detail={<span className="text-[13px]">{timeAgo(e.created_at)}</span>}
                    />
                  )}
                  columns={[
                    {
                      key: 'type',
                      header: 'Type',
                      cell: (e) => (
                        <span className="flex items-center gap-2 font-semibold text-[var(--ad-label)]">
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full"
                            style={{ background: EVENT_CATEGORIES[e.event_type]?.color || 'var(--ad-label-3)' }}
                          />
                          {EVENT_CATEGORIES[e.event_type]?.label || e.event_type}
                        </span>
                      ),
                    },
                    { key: 'page', header: 'Page', cell: (e) => <span className="block max-w-[420px] truncate">{e.page_url || '—'}</span> },
                    { key: 'time', header: 'Time', align: 'right', cell: (e) => new Date(e.created_at).toLocaleString() },
                  ]}
                />
              )}
            </div>
          </>
        )}
      </div>
    </AdminPage>
  );
}
