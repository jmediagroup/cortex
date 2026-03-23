'use client';

import { useEffect, useState } from 'react';
import { Loader2, TrendingUp, MousePointerClick, AlertCircle } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';

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
  user_signup: { label: 'Signups', color: 'var(--color-positive)' },
  user_login: { label: 'Logins', color: 'var(--color-info)' },
  page_view: { label: 'Page Views', color: 'var(--color-accent)' },
  dashboard_visit: { label: 'Dashboard Visits', color: '#8b5cf6' },
  app_opened: { label: 'App Opens', color: '#f59e0b' },
  calculation_completed: { label: 'Calculations', color: '#10b981' },
  pricing_page_view: { label: 'Pricing Views', color: '#ec4899' },
  subscription_upgrade: { label: 'Upgrades', color: '#14b8a6' },
  error_occurred: { label: 'Errors', color: 'var(--color-negative)' },
};

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      try {
        const res = await fetch(`/api/admin/analytics?days=${days}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch analytics');
        setData(await res.json());
      } catch {
        // Error handled by empty state
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={28} />
      </div>
    );
  }

  const totalEvents = Object.values(data?.eventCounts || {}).reduce((a, b) => a + b, 0);

  // Sort events by count descending
  const sortedEvents = Object.entries(data?.eventCounts || {})
    .sort(([, a], [, b]) => b - a);

  const maxEventCount = sortedEvents.length > 0 ? sortedEvents[0][1] : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)]">Analytics</h1>
          <p className="text-sm text-[var(--text-tertiary)] font-medium mt-1">
            {totalEvents.toLocaleString()} events in the last {days} days
          </p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(parseInt(e.target.value))}
          className="px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--border-primary)] bg-[var(--surface-primary)] text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {/* Signup Trend */}
      {data?.signupsByDay && data.signupsByDay.length > 0 && (
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[var(--color-positive)]" />
            <h2 className="text-base font-bold text-[var(--text-primary)]">Signups Over Time</h2>
          </div>
          <div className="flex items-end gap-1 h-32">
            {data.signupsByDay.map((day) => {
              const maxSignups = Math.max(...data.signupsByDay.map(d => d.count));
              const height = maxSignups > 0 ? (day.count / maxSignups) * 100 : 0;
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1" title={`${day.date}: ${day.count}`}>
                  <span className="text-[9px] font-bold text-[var(--text-tertiary)]">{day.count}</span>
                  <div
                    className="w-full rounded-t-sm bg-[var(--color-accent)] transition-all min-h-[2px]"
                    style={{ height: `${Math.max(height, 2)}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[9px] text-[var(--text-tertiary)]">{data.signupsByDay[0]?.date}</span>
            <span className="text-[9px] text-[var(--text-tertiary)]">{data.signupsByDay[data.signupsByDay.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Event Breakdown */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <MousePointerClick size={18} className="text-[var(--color-accent)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">Events by Type</h2>
        </div>
        {sortedEvents.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-8">No events recorded</p>
        ) : (
          <div className="space-y-2.5">
            {sortedEvents.map(([type, count]) => {
              const category = EVENT_CATEGORIES[type];
              const pct = (count / maxEventCount) * 100;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[var(--text-secondary)] w-40 truncate">
                    {category?.label || type}
                  </span>
                  <div className="flex-1 h-5 rounded-full bg-[var(--surface-tertiary)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        backgroundColor: category?.color || 'var(--color-accent)',
                      }}
                    />
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] w-16 text-right">
                    {count.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Events */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] overflow-hidden"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[var(--border-secondary)]">
          <AlertCircle size={18} className="text-[var(--color-warning)]" />
          <h2 className="text-base font-bold text-[var(--text-primary)]">Recent Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--surface-secondary)] border-b border-[var(--border-secondary)]">
                <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Type</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Page</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-[var(--text-tertiary)]">Time</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentEvents || []).slice(0, 20).map((event) => (
                <tr key={event.id} className="border-b border-[var(--border-secondary)] last:border-0 hover:bg-[var(--surface-secondary)] transition-colors">
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-semibold">
                      {EVENT_CATEGORIES[event.event_type]?.label || event.event_type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--text-tertiary)] truncate max-w-[250px]">
                    {event.page_url || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-[var(--text-tertiary)]">
                    {new Date(event.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
