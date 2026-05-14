import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { extractLeadMarkdown, renderMarkdown, stripMarkdown } from './markdown';
import type { Outlook, OutlookFrontmatter, OutlookListItem, OutlookType } from './types';

const CONTENT_ROOT = path.join(process.cwd(), 'content', 'outlook');
const TYPES: OutlookType[] = ['daily', 'weekly'];
const VALID_SLUG = /^[a-z0-9][a-z0-9-]*$/;

interface ParsedFile {
  type: OutlookType;
  slug: string;
  data: OutlookFrontmatter;
  body: string;
}

function readDir(type: OutlookType): string[] {
  const dir = path.join(CONTENT_ROOT, type);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('.'));
}

function parseFile(type: OutlookType, filename: string): ParsedFile | null {
  const filePath = path.join(CONTENT_ROOT, type, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const fm = data as Record<string, unknown> & Partial<OutlookFrontmatter>;
  if (!fm.title || !fm.date || !fm.summary) return null;

  // Coerce date to ISO yyyy-mm-dd (gray-matter returns Date objects for unquoted dates).
  const rawDate = fm.date as unknown;
  const date =
    rawDate instanceof Date
      ? rawDate.toISOString().slice(0, 10)
      : String(rawDate);

  const declaredType = (fm.type as OutlookType | undefined) ?? type;
  const slug = filename.replace(/\.md$/, '');

  return {
    type: declaredType,
    slug,
    data: {
      title: String(fm.title),
      date,
      type: declaredType,
      summary: String(fm.summary),
      tickers: Array.isArray(fm.tickers) ? fm.tickers.map(String) : [],
      sectors: Array.isArray(fm.sectors) ? fm.sectors.map(String) : [],
      ogImage: fm.ogImage ? String(fm.ogImage) : undefined,
      metaDescription: fm.metaDescription ? String(fm.metaDescription) : undefined,
    },
    body: content,
  };
}

function toListItem(p: ParsedFile): OutlookListItem {
  const minutes = Math.max(1, Math.round(readingTime(p.body).minutes));
  return {
    slug: p.slug,
    title: p.data.title,
    date: p.data.date,
    type: p.data.type,
    summary: p.data.summary,
    tickers: p.data.tickers ?? [],
    sectors: p.data.sectors ?? [],
    readingTime: minutes,
    ogImage: p.data.ogImage,
  };
}

function loadAll(): ParsedFile[] {
  const files: ParsedFile[] = [];
  for (const type of TYPES) {
    for (const filename of readDir(type)) {
      const parsed = parseFile(type, filename);
      if (parsed) files.push(parsed);
    }
  }
  // Newest first.
  files.sort((a, b) => (a.data.date < b.data.date ? 1 : a.data.date > b.data.date ? -1 : 0));
  return files;
}

export function getAllOutlooks(): OutlookListItem[] {
  return loadAll().map(toListItem);
}

export function getAllOutlookSlugs(): { slug: string; date: string; type: OutlookType }[] {
  return loadAll().map((p) => ({ slug: p.slug, date: p.data.date, type: p.data.type }));
}

export async function getOutlookBySlug(slug: string): Promise<Outlook | null> {
  if (!VALID_SLUG.test(slug)) return null;

  for (const type of TYPES) {
    const filename = `${slug}.md`;
    const filePath = path.join(CONTENT_ROOT, type, filename);
    if (!fs.existsSync(filePath)) continue;

    const parsed = parseFile(type, filename);
    if (!parsed) return null;

    const [contentHtml, leadHtml] = await Promise.all([
      renderMarkdown(parsed.body),
      renderMarkdown(extractLeadMarkdown(parsed.body)),
    ]);

    return {
      ...toListItem(parsed),
      contentHtml,
      leadHtml,
      metaDescription: parsed.data.metaDescription,
    };
  }

  return null;
}

export function getLatestOutlook(type: OutlookType, onDate?: string): ParsedFile | null {
  const all = loadAll().filter((p) => p.type === type);
  if (onDate) {
    return all.find((p) => p.data.date === onDate) ?? null;
  }
  return all[0] ?? null;
}

// Subtracts `days` from an ISO yyyy-mm-dd string, returning the same format.
function isoDateMinusDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// Picks the newest outlook of `type` whose date falls within
// [targetDate - lookbackDays, targetDate]. The lookback window means a post
// deployed a little late (after the cron fired) still goes out on the next run
// instead of being silently dropped. ISO yyyy-mm-dd strings sort lexically, so
// plain string comparison is correct here.
export async function getOutlookForDigest(
  type: OutlookType,
  targetDate: string,
  lookbackDays: number,
): Promise<{ list: OutlookListItem; leadMarkdown: string; leadText: string } | null> {
  const minDate = isoDateMinusDays(targetDate, lookbackDays);
  const all = loadAll().filter((p) => p.type === type);
  // loadAll() is newest-first, so the first in-window match is the freshest.
  const parsed = all.find((p) => p.data.date <= targetDate && p.data.date >= minDate);
  if (!parsed) return null;

  const leadMarkdown = extractLeadMarkdown(parsed.body);
  return {
    list: toListItem(parsed),
    leadMarkdown,
    leadText: stripMarkdown(leadMarkdown),
  };
}
