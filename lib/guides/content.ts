import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { renderMarkdown } from '@/lib/outlook/markdown';
import type { Guide, GuideFrontmatter, GuideListItem } from './types';

const CONTENT_DIR = path.join(process.cwd(), 'content', 'guides');
const VALID_SLUG = /^[a-z0-9][a-z0-9-]*$/;

interface ParsedFile {
  slug: string;
  data: GuideFrontmatter;
  body: string;
}

function readDir(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_') && !f.startsWith('.'));
}

function parseFile(filename: string): ParsedFile | null {
  const filePath = path.join(CONTENT_DIR, filename);
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);

  const fm = data as Record<string, unknown> & Partial<GuideFrontmatter>;
  if (!fm.title || !fm.date || !fm.summary || !fm.topic) return null;

  const rawDate = fm.date as unknown;
  const date =
    rawDate instanceof Date ? rawDate.toISOString().slice(0, 10) : String(rawDate);

  const slug = filename.replace(/\.md$/, '');

  return {
    slug,
    data: {
      title: String(fm.title),
      date,
      summary: String(fm.summary),
      topic: String(fm.topic),
      category: fm.category ? String(fm.category) : undefined,
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      relatedTools: Array.isArray(fm.relatedTools) ? fm.relatedTools.map(String) : [],
      ogImage: fm.ogImage ? String(fm.ogImage) : undefined,
      metaDescription: fm.metaDescription ? String(fm.metaDescription) : undefined,
    },
    body: content,
  };
}

function toListItem(p: ParsedFile): GuideListItem {
  const minutes = Math.max(1, Math.round(readingTime(p.body).minutes));
  return {
    slug: p.slug,
    title: p.data.title,
    date: p.data.date,
    summary: p.data.summary,
    topic: p.data.topic,
    category: p.data.category,
    tags: p.data.tags ?? [],
    relatedTools: p.data.relatedTools ?? [],
    readingTime: minutes,
    ogImage: p.data.ogImage,
  };
}

function loadAll(): ParsedFile[] {
  const files: ParsedFile[] = [];
  for (const filename of readDir()) {
    const parsed = parseFile(filename);
    if (parsed) files.push(parsed);
  }
  files.sort((a, b) => (a.data.date < b.data.date ? 1 : a.data.date > b.data.date ? -1 : 0));
  return files;
}

export function getAllGuides(): GuideListItem[] {
  return loadAll().map(toListItem);
}

export function getAllGuideSlugs(): { slug: string; date: string }[] {
  return loadAll().map((p) => ({ slug: p.slug, date: p.data.date }));
}

// Raw markdown bodies for /llms-full.txt and similar plain-text corpora.
export function getAllGuidesWithBody(): Array<GuideListItem & { body: string }> {
  return loadAll().map((p) => ({ ...toListItem(p), body: p.body }));
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  if (!VALID_SLUG.test(slug)) return null;

  const filename = `${slug}.md`;
  const filePath = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(filePath)) return null;

  const parsed = parseFile(filename);
  if (!parsed) return null;

  const contentHtml = await renderMarkdown(parsed.body);

  return {
    ...toListItem(parsed),
    contentHtml,
    metaDescription: parsed.data.metaDescription,
  };
}

// Every topic/slug published so far, for dedup checks by the publishing routine.
export function getPublishedTopics(): { slug: string; topic: string; date: string }[] {
  return loadAll().map((p) => ({ slug: p.slug, topic: p.data.topic, date: p.data.date }));
}
