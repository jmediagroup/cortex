import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon, type MarketingIconName } from '@/components/marketing/Icons';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const CANONICAL = 'https://moneyguymutants.com/financial-mutants';

export const metadata: Metadata = {
  title: 'Money Guy Show Tools for Financial Mutants',
  description:
    'Free calculators and decision engines for financial mutants and fans of the Money Guy Show. Model the Financial Order of Operations, compound growth, and your net worth — an independent community project inspired by the moneyguy method.',
  keywords: [
    'money guy',
    'moneyguy',
    'money guy show',
    'financial mutants',
    'financial mutant',
    'money guy show tools',
    'money guy calculators',
    'financial order of operations',
    'financial order of operations calculator',
    'money guy compound interest',
    'money guy net worth',
    'wealth multiplier',
    'financial mutant community',
    'money guy show fans',
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    title: 'Money Guy Show Tools for Financial Mutants',
    description:
      'Free calculators and decision engines for financial mutants and fans of the Money Guy Show — model the Financial Order of Operations and watch your money compound.',
    siteName: 'Money Guy Mutants',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Money Guy Mutants — tools for financial mutants',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Money Guy Show Tools for Financial Mutants',
    description:
      'Free calculators and decision engines for financial mutants and fans of the Money Guy Show.',
    images: ['/opengraph-image'],
  },
};

type FeaturedTool = {
  icon: MarketingIconName;
  title: string;
  desc: string;
  href: string;
};

// Tools framed the way a financial mutant thinks about them — mapped to the
// concepts the Money Guy Show community talks about (compound growth, the
// wealth multiplier, the Financial Order of Operations, net worth tracking).
const FEATURED_TOOLS: FeaturedTool[] = [
  {
    icon: 'calculator',
    title: 'Compound Interest Calculator',
    desc: 'Put a number on your wealth multiplier. See what every dollar you invest today is worth at 65.',
    href: '/apps/compound-interest',
  },
  {
    icon: 'compass',
    title: 'Net Worth Engine',
    desc: 'Track assets, liabilities, and liquidity — the scoreboard every financial mutant checks.',
    href: '/apps/net-worth',
  },
  {
    icon: 'wallet',
    title: 'Household Budgeting System',
    desc: 'Build the surplus that funds the Financial Order of Operations, with tension-and-flexibility analysis.',
    href: '/apps/budget',
  },
  {
    icon: 'anchor',
    title: 'Coast FIRE Calculator',
    desc: 'Find the point where compound growth alone carries you to retirement — no more contributions needed.',
    href: '/apps/coast-fire',
  },
  {
    icon: 'trendDown',
    title: 'Debt Paydown Optimizer',
    desc: 'Clear high-interest debt (Step 3 of the FOO) with avalanche vs. snowball payoff timelines.',
    href: '/apps/debt-paydown',
  },
  {
    icon: 'trendUp',
    title: 'Retirement Strategy Engine',
    desc: 'Decumulation planning with Roth conversions, tax optimization, and sequence-of-returns risk.',
    href: '/apps/retirement-strategy',
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Are you the official Money Guy Show?',
    a: 'No. Money Guy Mutants is an independent, fan-made project built by personal-finance enthusiasts. We are not affiliated with, endorsed by, or sponsored by The Money Guy Show or Abound Wealth Management, LLC. “The Money Guy Show” and related marks are the property of their respective owners. We just build free tools we wish existed.',
  },
  {
    q: 'What is a financial mutant?',
    a: 'A financial mutant is someone who is willing to do what average people are not — living on less than they make, avoiding lifestyle creep, and letting compound growth do the heavy lifting. If you found us searching for “money guy”, “moneyguy”, or “the money guy show”, you are almost certainly one of us.',
  },
  {
    q: 'Do your tools follow the Financial Order of Operations?',
    a: 'Our calculators are organized around the same ideas: build a deductible-covering emergency reserve, capture your full employer match, knock out high-interest debt, max out tax-advantaged accounts, and then invest for long-term growth. Each tool maps to a step so you can see the math behind the decision.',
  },
  {
    q: 'Is it really free?',
    a: 'Yes. Every calculator on Money Guy Mutants runs in your browser and is free to use without an account. Creating a free account lets you save scenarios and history; a Pro plan unlocks the most advanced engines.',
  },
  {
    q: 'Is this financial advice?',
    a: 'No. Money Guy Mutants provides educational tools only. Nothing here is financial, legal, or tax advice. Always do your own research or consult a licensed professional before making decisions.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${CANONICAL}#webpage`,
      url: CANONICAL,
      name: 'Money Guy Show Tools for Financial Mutants',
      description:
        'Free calculators and decision engines for financial mutants and fans of the Money Guy Show, inspired by the Financial Order of Operations.',
      isPartOf: { '@id': 'https://moneyguymutants.com/#website' },
      breadcrumb: { '@id': `${CANONICAL}#breadcrumb` },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${CANONICAL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moneyguymutants.com' },
        { '@type': 'ListItem', position: 2, name: 'Financial Mutants', item: CANONICAL },
      ],
    },
    {
      '@type': 'FAQPage',
      '@id': `${CANONICAL}#faq`,
      mainEntity: FAQ.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    },
  ],
};

export default function FinancialMutantsPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="hero-gradient" style={{ padding: '96px 24px 48px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 14 }}>
            FOR FINANCIAL MUTANTS
          </div>
          <h1
            className="h-hero"
            style={{ margin: '0 0 18px', fontSize: 'clamp(40px,6vw,58px)' }}
          >
            Money Guy–style tools, built for financial mutants.
          </h1>
          <p
            style={{
              fontSize: 19,
              color: 'var(--gray-600)',
              lineHeight: 1.6,
              margin: '0 0 28px',
              maxWidth: '58ch',
            }}
          >
            Free calculators and decision engines inspired by the Financial Order
            of Operations — for fans of the Money Guy Show and every financial
            mutant building wealth on purpose. See the outcome before you live it.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button href="/apps" variant="primary">
              Explore the tools <MarketingIcon name="arrowRight" size={14} />
            </Button>
            <Button href="/apps/compound-interest" variant="secondary" tone="navy">
              Start with compound interest
            </Button>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section style={{ padding: '32px 24px 8px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <Card style={{ padding: 32 }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}
            >
              <p style={{ margin: 0 }}>
                If you listen to the Money Guy Show, you already know the drill:
                live below your means, capture the match, avoid lifestyle creep,
                and let compound growth turn small, boring decisions into
                life-changing outcomes. Money Guy Mutants turns that mindset into
                interactive tools you can actually run your own numbers through.
              </p>
              <p style={{ margin: 0 }}>
                Each calculator is built for the way a{' '}
                <strong style={{ color: 'var(--navy)' }}>financial mutant</strong>{' '}
                thinks — the wealth multiplier, the Financial Order of Operations,
                deployment of every surplus dollar to its highest-value use. No
                fluff, no product pitches. Just the math behind the decision,
                visualized so the invisible consequences become obvious.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Tools grid */}
      <section style={{ padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
            THE MUTANT TOOLKIT
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px,4vw,40px)',
              fontWeight: 700,
              color: 'var(--navy)',
              letterSpacing: '-0.02em',
              margin: '0 0 28px',
              lineHeight: 1.15,
            }}
          >
            Tools mapped to the Money Guy method.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {FEATURED_TOOLS.map((tool) => (
              <Card key={tool.href} href={tool.href} style={{ padding: 24 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 'var(--radius-circle)',
                    background: 'var(--mint)',
                    color: 'var(--navy)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}
                >
                  <MarketingIcon name={tool.icon} size={20} />
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--navy)',
                    margin: '0 0 8px',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  {tool.title}
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    lineHeight: 1.55,
                    margin: '0 0 18px',
                  }}
                >
                  {tool.desc}
                </p>
                <span
                  style={{
                    color: 'var(--orange)',
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  Open tool <MarketingIcon name="arrowRight" size={12} />
                </span>
              </Card>
            ))}
          </div>
          <div style={{ marginTop: 28 }}>
            <Button href="/apps" variant="secondary" tone="navy">
              See all Money Guy Mutants tools{' '}
              <MarketingIcon name="arrowRight" size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
            FINANCIAL MUTANT FAQ
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px,3.5vw,36px)',
              fontWeight: 700,
              color: 'var(--navy)',
              letterSpacing: '-0.02em',
              margin: '0 0 28px',
              lineHeight: 1.15,
            }}
          >
            Questions financial mutants ask.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {FAQ.map((item) => (
              <Card key={item.q} style={{ padding: 24 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--navy)',
                    margin: '0 0 8px',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {item.q}
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 14,
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {item.a}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Non-affiliation disclaimer */}
      <section style={{ padding: '8px 24px 80px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <p
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              margin: 0,
              paddingTop: 20,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            Money Guy Mutants is an independent, fan-made project built by
            personal-finance enthusiasts. We are not affiliated with, endorsed by,
            or sponsored by The Money Guy Show or Abound Wealth Management, LLC.
            “The Money Guy Show” and related marks are the property of their
            respective owners. Educational tools only — not financial advice.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
