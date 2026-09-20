import { getArticles, getCategories } from '@/lib/cms/articles';
import { getAllOutlooks } from '@/lib/outlook/content';
import { getAllGuides } from '@/lib/guides/content';
import { CALCULATOR_CONTENT } from '@/lib/calculator-content';
import { LANDING_PAGES } from '@/lib/landing-pages';

// /llms.txt — curated, machine-readable index for LLMs and AI search engines.
// Spec: https://llmstxt.org
//
// Everything listed here is derived from the same registries the site
// renders from (calculator content, guides, landing pages, outlooks, CMS
// articles), so a new tool or guide shows up here without a code change.

export const revalidate = 3600; // 1 hour

const BASE_URL = 'https://moneyguymutants.com';

/** Tools that live outside the calculator content registry. */
const OTHER_TOOLS: Array<{ name: string; slug: string; summary: string }> = [
  {
    name: 'Financial Personality Quiz',
    slug: 'personality-quiz',
    summary:
      'Ten questions that map money instincts to one of six investor archetypes (Accumulator, Optimizer, Fortress, Visionary, Tactician, Steward). Free, no email required.',
  },
  {
    name: "What's Your Why",
    slug: 'whats-your-why',
    summary:
      'An eight-question reflection that surfaces what actually drives your financial decisions, synthesized into a personal read on your relationship with money.',
  },
];

function oneLine(text: string, max = 220): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, max);
}

export async function GET() {
  let articleSection = '';
  let topicsSection = '';

  try {
    const [{ articles }, categories] = await Promise.all([getArticles(50), getCategories()]);

    if (categories.length > 0) {
      topicsSection = [
        '## Topics',
        '',
        ...categories.map(
          (c) => `- [${c.name}](${BASE_URL}/articles?category=${c.slug}): ${c.count} article${c.count === 1 ? '' : 's'}`,
        ),
        '',
      ].join('\n');
    }

    if (articles.length > 0) {
      articleSection = [
        '## Articles',
        '',
        '> Long-form articles on personal finance, investing, retirement, and decision-making.',
        '',
        ...articles.map((a) => `- [${a.title}](${BASE_URL}/articles/${a.slug}): ${oneLine(a.excerpt, 200)}`),
        '',
      ].join('\n');
    }
  } catch (error) {
    console.error('llms.txt: failed to fetch articles or categories', error);
  }

  // Evergreen guides from local Markdown — the site's cornerstone explainers.
  let guideSection = '';
  try {
    const guides = getAllGuides();
    if (guides.length > 0) {
      guideSection = [
        '## Guides',
        '',
        '> Cornerstone, evergreen explainers (2,000+ words each) on one personal-finance topic at a time, each linked to the calculator that runs the numbers.',
        '',
        ...guides.map((g) => `- [${g.title}](${BASE_URL}/guides/${g.slug}): ${oneLine(g.summary, 200)}`),
        '',
        `- [All guides](${BASE_URL}/guides)`,
        `- [Guides RSS feed](${BASE_URL}/guides/rss.xml)`,
        '',
      ].join('\n');
    }
  } catch (error) {
    console.error('llms.txt: failed to load guides', error);
  }

  // Recent market outlooks from local markdown. These are the freshest pages
  // on the site (published every weekday).
  let outlookSection = '';
  try {
    const outlooks = getAllOutlooks().slice(0, 30);
    if (outlooks.length > 0) {
      outlookSection = [
        '## Market Outlook',
        '',
        '> Money Guy Mutants Research publishes a daily investment outlook every weekday morning (plus a weekly recap) covering markets, the Fed, earnings, and specific tickers and sectors. Newest first.',
        '',
        ...outlooks.map((o) => `- [${o.title}](${BASE_URL}/thinking/${o.slug}): ${o.date} — ${oneLine(o.summary, 200)}`),
        '',
        `- [Full outlook archive](${BASE_URL}/thinking)`,
        `- [Outlook RSS feed](${BASE_URL}/thinking/rss.xml)`,
        '',
      ].join('\n');
    }
  } catch (error) {
    console.error('llms.txt: failed to load outlooks', error);
  }

  const calculators = Object.values(CALCULATOR_CONTENT);

  const body = [
    '# Money Guy Mutants',
    '',
    '> Money Guy Mutants builds free, interactive decision-support tools for life\'s biggest choices, starting with personal finance. We pair interactive calculators (compound interest, Coast FIRE, retirement strategy, budget, debt paydown, rent vs. buy, S-Corp tax optimization, capital gains tax, geographic arbitrage, and more) with evergreen guides and long-form articles that explain the reasoning behind each tool, plus a daily investment outlook from Money Guy Mutants Research.',
    '',
    'This site is operated by J Media Group LLC. Content is original, written for an English-speaking U.S. audience, and updated regularly. Calculators are free to use without an account; saving scenarios requires a free sign-in.',
    '',
    'Disclosure: Money Guy Mutants provides educational tools only. Nothing on this site is financial, legal, or tax advice. It is an independent, fan-made project not affiliated with The Money Guy Show.',
    '',
    '## Calculators',
    '',
    '> Free, interactive personal finance calculators. Each tool runs entirely in the browser; no signup required to use them. Every tool page includes an explanation of the model and an FAQ.',
    '',
    ...calculators.map((c) => `- [${c.name}](${BASE_URL}/apps/${c.slug}): ${oneLine(c.description)}`),
    ...OTHER_TOOLS.map((t) => `- [${t.name}](${BASE_URL}/apps/${t.slug}): ${t.summary}`),
    `- [All tools](${BASE_URL}/apps)`,
    '',
    '## Calculator explainers',
    '',
    '> Keyword-focused pages that embed a calculator inside a longer explanation: how the model works, what inputs to use, worked examples, and FAQs.',
    '',
    ...LANDING_PAGES.map((p) => `- [${p.metaTitle}](${BASE_URL}/calculators/${p.slug}): ${oneLine(p.metaDescription)}`),
    '',
    guideSection,
    outlookSection,
    topicsSection,
    articleSection,
    '## Reference',
    '',
    `- [Sitemap](${BASE_URL}/sitemap.xml): full machine-readable index of every public URL`,
    `- [Article RSS feed](${BASE_URL}/articles/rss.xml): subscribe to new articles`,
    `- [Guides RSS feed](${BASE_URL}/guides/rss.xml): subscribe to new guides`,
    `- [Outlook RSS feed](${BASE_URL}/thinking/rss.xml): subscribe to the daily and weekly market outlook`,
    `- [Full content corpus](${BASE_URL}/llms-full.txt): every guide, calculator explainer, article and market outlook concatenated as plain text, optimized for LLM ingestion`,
    `- [Tools for Financial Mutants](${BASE_URL}/financial-mutants): calculators and decision engines for financial mutants and fans of the Money Guy Show, organized around the Financial Order of Operations`,
    `- [The Money Guy Show tribute](${BASE_URL}/the-money-guy-show): an independent fan hub to subscribe on YouTube and watch the show's latest episodes (not affiliated with the show)`,
    `- [About Money Guy Mutants](${BASE_URL}/about)`,
    `- [Pricing](${BASE_URL}/pricing)`,
    '',
    '## Optional',
    '',
    `- [Terms of Service](${BASE_URL}/terms)`,
    `- [Security](${BASE_URL}/security)`,
    `- [Changelog](${BASE_URL}/changelog)`,
    `- [Roadmap](${BASE_URL}/roadmap)`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
      'X-Robots-Tag': 'all',
    },
  });
}
