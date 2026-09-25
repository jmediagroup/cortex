import type { OutlookListItem, OutlookType } from './types';

/**
 * The /thinking cadence filter (`?type=daily|weekly`). Pure helpers shared by
 * the static page and its client-side filter island, so both agree on what a
 * URL shows.
 */
export type OutlookFilter = OutlookType | 'all';

export type OutlookCounts = Record<OutlookFilter, number>;

const FILTERS: readonly OutlookFilter[] = ['all', 'daily', 'weekly'];

/** Reads a `?type=` value. Anything missing or unrecognised shows everything. */
export function parseOutlookFilter(raw: string | null | undefined): OutlookFilter {
  return FILTERS.find((f) => f === raw) ?? 'all';
}

export function matchesOutlookFilter(type: OutlookType, filter: OutlookFilter): boolean {
  return filter === 'all' || type === filter;
}

export function countOutlooks(items: ReadonlyArray<Pick<OutlookListItem, 'type'>>): OutlookCounts {
  return {
    all: items.length,
    daily: items.filter((o) => o.type === 'daily').length,
    weekly: items.filter((o) => o.type === 'weekly').length,
  };
}
