import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

// Standing rule 8 (docs/monetization/HANDOFF.md): analytics never carry PII
// or raw financial inputs. lib/tool-funnel.ts enforces that at runtime for
// the funnel events; this scan checks every tracking call in the source, so
// a new call that passes an email, a birth date or a dollar input fails here
// before it ships.

const ROOT = new URL('..', import.meta.url).pathname;
const SOURCE_DIRS = ['app', 'components', 'lib'];
const TRACKING_CALLS = /\b(trackEvent|trackServerEvent|trackCalculationCompleted|trackAppOpened|trackSubscriptionChange|trackError|trackWebVital|trackPageView)\s*\(/g;

// Names that mean personal or financial data when they appear in a payload.
const FORBIDDEN =
  /(e_?mail|birth|\bdob\b|\bage\b|gender|first_?name|last_?name|full_?name|phone|address|\bzip|postal|\bssn\b|password|income|salary|wage|balance|savings|debt|net_?worth|portfolio|principal|contribution|mortgage|loan|price\b|amount|payment)/i;
// Case-sensitive, so `current` and `parent` don't count as rent.
const RENT = /(^|_)rent($|_)|Rent/;
// Multiple-choice answers that name a money topic but carry no value:
// onboarding's "Do you own or rent?" is one of Own / Rent / Looking to buy.
const CATEGORICAL = new Set(['own_or_rent']);

function looksPersonal(name) {
  return !CATEGORICAL.has(name) && (FORBIDDEN.test(name) || RENT.test(name));
}

function sourceFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith('.test.ts')) out.push(path);
  }
  return out;
}

/** The argument text of a call starting at the `(` at `open`. */
function callArguments(src, open) {
  let depth = 0;
  for (let i = open; i < src.length; i += 1) {
    if (src[i] === '(') depth += 1;
    else if (src[i] === ')' && --depth === 0) return src.slice(open + 1, i);
  }
  return src.slice(open + 1);
}

/** Drops string literals (constant labels are not user data) but keeps `${…}` expressions. */
function withoutStringLiterals(code) {
  return code
    .replace(/'(?:\\.|[^'\\])*'/g, "''")
    .replace(/"(?:\\.|[^"\\])*"/g, '""')
    .replace(/`(?:\\.|\$\{([^}]*)\}|[^`\\])*`/g, (m) => (m.match(/\$\{[^}]*\}/g) ?? []).join(' '));
}

function trackingCalls() {
  const calls = [];
  for (const dir of SOURCE_DIRS) {
    for (const file of sourceFiles(join(ROOT, dir))) {
      const src = readFileSync(file, 'utf8');
      for (const match of src.matchAll(TRACKING_CALLS)) {
        // Skip the helpers' own declarations (`export async function trackEvent(`).
        const before = src.slice(Math.max(0, match.index - 20), match.index);
        if (/function\s+$/.test(before)) continue;
        const args = callArguments(src, match.index + match[0].length - 1);
        const line = src.slice(0, match.index).split('\n').length;
        calls.push({ where: `${relative(ROOT, file)}:${line}`, args });
      }
    }
  }
  return calls;
}

test('the scan finds the tracking calls it is meant to guard', () => {
  const calls = trackingCalls();
  assert.ok(calls.length >= 25, `expected many tracking calls, found ${calls.length}`);
  assert.ok(calls.some((c) => c.args.includes("'tool_viewed'")), 'tool_viewed call not found');
  assert.ok(calls.some((c) => c.args.includes("'tool_calculation_completed'")), 'completion call not found');
});

test('no tracking call passes PII or a raw financial input', () => {
  const offenders = [];
  for (const { where, args } of trackingCalls()) {
    const identifiers = withoutStringLiterals(args).match(/[A-Za-z_$][\w$]*/g) ?? [];
    const bad = identifiers.filter(looksPersonal);
    if (bad.length) offenders.push(`${where}: ${[...new Set(bad)].join(', ')}`);
  }
  assert.deepEqual(offenders, [], `tracking calls that look like PII:\n${offenders.join('\n')}`);
});

test('the forbidden-name list catches the obvious cases', () => {
  for (const name of ['email', 'userEmail', 'birth_date', 'annualIncome', 'currentSavings', 'debts', 'monthlyPayment', 'first_name', 'monthlyRent', 'rent']) {
    assert.ok(looksPersonal(name), name);
  }
  for (const name of ['tool_id', 'is_logged_in', 'error_message', 'new_tier', 'billing_period', 'landing_slug', 'toolId', 'current', 'own_or_rent']) {
    assert.ok(!looksPersonal(name), name);
  }
});
