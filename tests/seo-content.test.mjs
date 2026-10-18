import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// lib/landing-pages.ts imports `@/lib/calculator-content` (a tsconfig path
// alias the Next bundler resolves). Map `@/` to the repo root and add `.ts`.
register(
  'data:text/javascript,' +
    encodeURIComponent(`
      const ROOT = ${JSON.stringify(pathToFileURL(ROOT + '/').href)};
      export async function resolve(specifier, context, next) {
        if (specifier.startsWith('@/')) {
          return next(new URL(specifier.slice(2) + '.ts', ROOT).href, context);
        }
        return next(specifier, context);
      }
    `),
);

const { CALCULATOR_CONTENT, toolMetadata, generateCalculatorJsonLd } = await import(
  '../lib/calculator-content.ts'
);
const { LANDING_PAGES } = await import('../lib/landing-pages.ts');

const tools = Object.values(CALCULATOR_CONTENT);
const BRAND = /money\s*guy/i;
const guideExists = (slug) => fs.existsSync(path.join(ROOT, 'content', 'guides', `${slug}.md`));

test('every tool has a search title and meta description that fit in results', () => {
  for (const t of tools) {
    assert.ok(t.seo.title.length <= 60, `${t.slug} title is ${t.seo.title.length} chars`);
    assert.ok(
      t.seo.description.length >= 100 && t.seo.description.length <= 155,
      `${t.slug} description is ${t.seo.description.length} chars`,
    );
    assert.ok(t.seo.keywords.length > 0, `${t.slug} has no keywords`);
  }
});

test('tool titles, descriptions and keywords never lean on the Money Guy brand', () => {
  for (const t of tools) {
    for (const text of [t.seo.title, t.seo.description, t.description, ...t.seo.keywords]) {
      assert.ok(!BRAND.test(text), `${t.slug}: "${text}"`);
    }
  }
});

test('tool titles are unique so no two pages compete for the same query', () => {
  const titles = tools.map((t) => t.seo.title.toLowerCase());
  assert.equal(new Set(titles).size, titles.length);
});

test('toolMetadata sets an absolute title and a self-referencing canonical', () => {
  for (const t of tools) {
    const meta = toolMetadata(t.slug);
    assert.deepEqual(meta.title, { absolute: t.seo.title });
    assert.equal(meta.alternates.canonical, `https://moneyguymutants.com/apps/${t.slug}`);
    assert.equal(meta.openGraph.images, undefined, 'images come from opengraph-image files');
  }
  assert.throws(() => toolMetadata('not-a-tool'));
});

test('guide links and related tools point at pages that exist', () => {
  for (const t of tools) {
    for (const g of t.guides) assert.ok(guideExists(g.slug), `${t.slug} links missing guide ${g.slug}`);
    for (const r of t.relatedTools) assert.ok(CALCULATOR_CONTENT[r], `${t.slug} relates to unknown ${r}`);
  }
});

test('explainer sections are well formed', () => {
  for (const t of tools) {
    for (const s of t.sections) {
      assert.match(s.heading, /[.?]$/, `${t.slug}: "${s.heading}" should end with a period`);
      assert.ok(s.paragraphs.length > 0, `${t.slug}: "${s.heading}" is empty`);
      if (s.table) {
        for (const row of s.table.rows) {
          assert.equal(row.length, s.table.columns.length, `${t.slug}: ragged row in "${s.heading}"`);
        }
      }
    }
  }
});

test('FAQ questions are unique per tool and all land in the FAQPage JSON-LD', () => {
  for (const t of tools) {
    const qs = t.faqs.map((f) => f.question);
    assert.equal(new Set(qs).size, qs.length, `${t.slug} repeats a question`);
    const faqPage = generateCalculatorJsonLd(t.slug)['@graph'].find((n) => n['@type'] === 'FAQPage');
    assert.equal(faqPage.mainEntity.length, t.faqs.length);
  }
});

test('every landing page wraps a known tool', () => {
  for (const p of LANDING_PAGES) assert.ok(CALCULATOR_CONTENT[p.tool], `${p.slug} wraps unknown ${p.tool}`);
});

test('every guide keeps the disclaimer and links only to real tools', () => {
  const dir = path.join(ROOT, 'content', 'guides');
  const disclaimer =
    'This guide is for general educational purposes only and does not constitute personalized financial, tax, or legal advice.';
  for (const file of fs.readdirSync(dir).filter((f) => /^\d{4}-.*\.md$/.test(f))) {
    const raw = fs.readFileSync(path.join(dir, file), 'utf8');
    // Some guides hard-wrap the paragraph; Markdown renders it the same.
    assert.ok(raw.replace(/\s+/g, ' ').includes(disclaimer), `${file} is missing the disclaimer`);
    const related = raw.match(/^relatedTools:\s*\[(.*)\]$/m);
    for (const slug of related ? related[1].split(',').map((s) => s.trim()).filter(Boolean) : []) {
      assert.ok(CALCULATOR_CONTENT[slug], `${file} lists unknown tool ${slug}`);
    }
    for (const [, slug] of raw.matchAll(/\]\(\/apps\/([a-z0-9-]+)\)/g)) {
      assert.ok(CALCULATOR_CONTENT[slug] || slug === 'whats-your-why', `${file} links unknown /apps/${slug}`);
    }
  }
});
