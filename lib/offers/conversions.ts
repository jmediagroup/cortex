/**
 * Parses an affiliate network's conversion report (CSV) into
 * offer_conversions rows. Pure, so it is unit-tested.
 *
 * Expected header (any order, case-insensitive; extra columns ignored):
 *   date, campaign, status, amount, id, tool, note
 * - date: YYYY-MM-DD or M/D/YYYY
 * - campaign: the campaign slug in /admin/ads (e.g. offer-brokerage-pilot)
 * - status: pending | confirmed | reversed — or the network's own words
 *   (approved/locked/paid → confirmed; declined/rejected/void → reversed)
 * - amount: what the network reports, e.g. "12.50" or "$1,200.00"; blank = unknown
 * - id: the network's action/conversion id; re-importing the same id updates it
 */
import { TOOL_IDS } from '../ads/types';

export interface ParsedConversion {
  campaignSlug: string;
  occurred_on: string;
  status: 'pending' | 'confirmed' | 'reversed';
  amount_cents: number | null;
  external_id: string | null;
  tool_id: string | null;
  note: string | null;
}

export const MAX_CONVERSION_ROWS = 2000;

const STATUS_WORDS: Record<string, ParsedConversion['status']> = {
  pending: 'pending',
  new: 'pending',
  confirmed: 'confirmed',
  approved: 'confirmed',
  locked: 'confirmed',
  paid: 'confirmed',
  reversed: 'reversed',
  declined: 'reversed',
  rejected: 'reversed',
  void: 'reversed',
  voided: 'reversed',
};

/** RFC 4180-ish: quoted fields, doubled quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function parseDate(value: string): string | null {
  const v = value.trim();
  let y: number, m: number, d: number;
  let match = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(v);
  if (match) {
    [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else if ((match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(v))) {
    [m, d, y] = [Number(match[1]), Number(match[2]), Number(match[3])];
  } else {
    return null;
  }
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return null;
  return date.toISOString().slice(0, 10);
}

/** "$1,200.50" → 120050. Blank → null. Anything else → undefined (an error). */
function parseAmount(value: string): number | null | undefined {
  const v = value.trim().replace(/^\$/, '').replace(/,/g, '');
  if (!v) return null;
  if (!/^\d+(\.\d{1,2})?$/.test(v)) return undefined;
  return Math.round(Number(v) * 100);
}

export function parseConversionsCsv(text: string): { rows: ParsedConversion[]; errors: string[] } {
  const table = parseCsv(text);
  const errors: string[] = [];
  if (!table.length) return { rows: [], errors: ['The file is empty.'] };

  const header = table[0].map((h) => h.trim().toLowerCase());
  const col = (name: string) => header.indexOf(name);
  for (const required of ['date', 'campaign', 'status']) {
    if (col(required) === -1) errors.push(`Missing the "${required}" column.`);
  }
  if (errors.length) return { rows: [], errors };
  if (table.length - 1 > MAX_CONVERSION_ROWS) {
    return { rows: [], errors: [`Too many rows (${table.length - 1}); import at most ${MAX_CONVERSION_ROWS} at a time.`] };
  }

  const get = (cells: string[], name: string) => (col(name) === -1 ? '' : (cells[col(name)] ?? '').trim());
  const rows: ParsedConversion[] = [];
  table.slice(1).forEach((cells, i) => {
    const line = i + 2;
    // More cells than headers means an unquoted comma split a field — most
    // often an amount like 1,200.50 — and every later column is shifted.
    if (cells.length > header.length) {
      errors.push(
        `Row ${line}: has ${cells.length} columns but the header has ${header.length}; put quotes around values with commas (e.g. "1,200.50").`,
      );
      return;
    }
    const occurred_on = parseDate(get(cells, 'date'));
    const campaignSlug = get(cells, 'campaign').toLowerCase();
    const status = STATUS_WORDS[get(cells, 'status').toLowerCase()];
    const amount = parseAmount(get(cells, 'amount'));
    const tool = get(cells, 'tool');
    const problems: string[] = [];
    if (!occurred_on) problems.push('a date like 2026-10-01');
    if (!/^[a-z0-9-]{1,80}$/.test(campaignSlug)) problems.push('a campaign slug');
    if (!status) problems.push('a status of pending, confirmed or reversed');
    if (amount === undefined) problems.push('an amount like 12.50 (or blank)');
    if (tool && !(TOOL_IDS as readonly string[]).includes(tool)) problems.push('a known tool id (or blank)');
    if (problems.length) {
      errors.push(`Row ${line}: needs ${problems.join(', ')}.`);
      return;
    }
    rows.push({
      campaignSlug,
      occurred_on: occurred_on!,
      status: status!,
      amount_cents: amount as number | null,
      external_id: get(cells, 'id').slice(0, 200) || null,
      tool_id: tool || null,
      note: get(cells, 'note').slice(0, 500) || null,
    });
  });
  return { rows, errors };
}
