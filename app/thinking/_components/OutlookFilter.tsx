'use client';

import { Fragment, Suspense, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  matchesOutlookFilter,
  parseOutlookFilter,
  type OutlookCounts,
  type OutlookFilter,
} from '@/lib/outlook/filter';
import type { OutlookType } from '@/lib/outlook/types';

/** One server-rendered outlook card plus what the filter needs to know about it. */
export interface OutlookCardEntry {
  slug: string;
  type: OutlookType;
  card: ReactNode;
}

/*
 * The `?type=daily|weekly` filter runs here, in the browser, so /thinking can
 * be a static page instead of rendering on the server for every visit. Each
 * island reads `useSearchParams()` inside its own Suspense boundary (the same
 * pattern as components/app/ToolIsland.tsx): the prerendered HTML carries the
 * fallback — every outlook, with "All outlooks" selected — so crawlers and
 * visitors without JavaScript still get the full list, and the browser then
 * applies the filter from the URL.
 */

function useOutlookFilter(): OutlookFilter {
  return parseOutlookFilter(useSearchParams().get('type'));
}

export function OutlookFilterNav({ counts }: { counts: OutlookCounts }) {
  return (
    <Suspense fallback={<FilterNavList active="all" counts={counts} />}>
      <FilterNavFromUrl counts={counts} />
    </Suspense>
  );
}

export function OutlookFilterGrid({ entries }: { entries: OutlookCardEntry[] }) {
  return (
    <Suspense fallback={<OutlookGrid entries={entries} filter="all" />}>
      <OutlookGridFromUrl entries={entries} />
    </Suspense>
  );
}

function FilterNavFromUrl({ counts }: { counts: OutlookCounts }) {
  return <FilterNavList active={useOutlookFilter()} counts={counts} />;
}

function OutlookGridFromUrl({ entries }: { entries: OutlookCardEntry[] }) {
  return <OutlookGrid entries={entries} filter={useOutlookFilter()} />;
}

function FilterNavList({ active, counts }: { active: OutlookFilter; counts: OutlookCounts }) {
  return (
    <ul
      style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <FilterLink href="/thinking" active={active === 'all'} label="All outlooks" count={counts.all} />
      <FilterLink
        href="/thinking?type=daily"
        active={active === 'daily'}
        label="Daily"
        count={counts.daily}
      />
      <FilterLink
        href="/thinking?type=weekly"
        active={active === 'weekly'}
        label="Weekly"
        count={counts.weekly}
      />
    </ul>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <li>
      <Link
        href={href}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 13,
          fontWeight: active ? 700 : 500,
          textDecoration: 'none',
          color: active ? 'var(--navy)' : 'var(--text-secondary)',
          background: active ? 'var(--off-white)' : 'transparent',
          border: `1px solid ${active ? 'var(--border-default)' : 'transparent'}`,
        }}
      >
        <span>{label}</span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: active ? 'var(--navy)' : 'var(--text-muted)',
          }}
        >
          {count}
        </span>
      </Link>
    </li>
  );
}

function OutlookGrid({ entries, filter }: { entries: OutlookCardEntry[]; filter: OutlookFilter }) {
  const visible = entries.filter((e) => matchesOutlookFilter(e.type, filter));

  if (visible.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '64px 24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--text-secondary)',
        }}
      >
        <p style={{ fontSize: 16, marginBottom: 8 }}>
          {filter === 'all' ? 'No outlooks published yet.' : `No ${filter} outlooks yet.`}
        </p>
        <p style={{ color: 'var(--gray-500)', fontSize: 13 }}>
          Subscribe to be notified when the first one drops.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {visible.map((e) => (
        <Fragment key={e.slug}>{e.card}</Fragment>
      ))}
    </div>
  );
}
