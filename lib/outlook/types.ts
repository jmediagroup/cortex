export type OutlookType = 'daily' | 'weekly';

export interface OutlookFrontmatter {
  title: string;
  date: string;
  type: OutlookType;
  summary: string;
  tickers?: string[];
  sectors?: string[];
  ogImage?: string;
  metaDescription?: string;
}

export interface OutlookListItem {
  slug: string;
  title: string;
  date: string;
  type: OutlookType;
  summary: string;
  tickers: string[];
  sectors: string[];
  readingTime: number;
  ogImage?: string;
}

export interface Outlook extends OutlookListItem {
  contentHtml: string;
  leadHtml: string;
  metaDescription?: string;
}
