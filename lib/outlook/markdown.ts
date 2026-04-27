import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';

export async function renderMarkdown(md: string): Promise<string> {
  const file = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(md);
  return String(file);
}

// Returns the markdown body up to (but not including) the second `## ` heading.
// If there's only one or zero `## ` headings, returns the whole body.
// Used to render the "first section" inline in the daily email.
export function extractLeadMarkdown(md: string): string {
  const lines = md.split('\n');
  let h2Count = 0;
  const out: string[] = [];

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      h2Count += 1;
      if (h2Count === 2) break;
    }
    out.push(line);
  }

  return out.join('\n').trim();
}

export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]/g, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}
