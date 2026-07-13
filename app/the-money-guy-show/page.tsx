import type { Metadata } from 'next';
import { MarketingShell } from '@/components/marketing/MarketingShell';
import { MarketingIcon, type MarketingIconName } from '@/components/marketing/Icons';
import { LatestVideos } from '@/components/marketing/LatestVideos';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  MONEY_GUY_CHANNEL_URL,
  MONEY_GUY_SUBSCRIBE_URL,
  MONEY_GUY_SITE_URL,
  MONEY_GUY_CHANNEL_HANDLE,
} from '@/lib/youtube';

const CANONICAL = 'https://moneyguymutants.com/the-money-guy-show';

// Refresh the embedded latest-videos feed hourly.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'The Money Guy Show — Watch, Subscribe & Run the Numbers',
  description:
    'A financial-mutant tribute to The Money Guy Show. Subscribe on YouTube, watch the latest episodes, and run the numbers behind the Financial Order of Operations with free calculators. An independent fan project — not affiliated with the show.',
  keywords: [
    'the money guy show',
    'money guy show youtube',
    'money guy show latest episodes',
    'money guy show videos',
    'subscribe money guy show',
    'money guy',
    'moneyguy',
    'brian preston bo hanson',
    'financial order of operations',
    'financial mutants',
    'money guy show podcast',
  ],
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    title: 'The Money Guy Show — Watch, Subscribe & Run the Numbers',
    description:
      'A financial-mutant tribute to The Money Guy Show. Subscribe on YouTube, watch the latest episodes, and run the numbers behind the Financial Order of Operations.',
    siteName: 'Money Guy Mutants',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Money Guy Mutants — a tribute to The Money Guy Show',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Money Guy Show — Watch, Subscribe & Run the Numbers',
    description:
      'A financial-mutant tribute to The Money Guy Show. Subscribe, watch the latest episodes, and run the numbers.',
    images: ['/opengraph-image'],
  },
};

type WatchLink = {
  icon: MarketingIconName;
  title: string;
  desc: string;
  cta: string;
  href: string;
};

const WATCH_LINKS: WatchLink[] = [
  {
    icon: 'bell',
    title: 'Subscribe on YouTube',
    desc: 'Hit subscribe and the bell so new episodes land in your feed the moment they drop.',
    cta: 'Subscribe',
    href: MONEY_GUY_SUBSCRIBE_URL,
  },
  {
    icon: 'youtube',
    title: 'Browse the channel',
    desc: `Years of Q&As, deep dives, and the wealth-building charts, all on ${MONEY_GUY_CHANNEL_HANDLE}.`,
    cta: 'Open channel',
    href: MONEY_GUY_CHANNEL_URL,
  },
  {
    icon: 'headphones',
    title: 'Listen to the podcast',
    desc: 'Prefer audio? Catch the show wherever you get your podcasts via the official site.',
    cta: 'Show & podcast',
    href: MONEY_GUY_SITE_URL,
  },
];

type FeaturedTool = {
  icon: MarketingIconName;
  title: string;
  desc: string;
  href: string;
};

// Tools that let you run the numbers behind the concepts the show talks about
// every week — the wealth multiplier, the FOO, and the marathon of investing.
const TOOLS: FeaturedTool[] = [
  {
    icon: 'calculator',
    title: 'Compound Interest Calculator',
    desc: 'Put a number on your wealth multiplier — what every dollar you invest today is worth at 65.',
    href: '/apps/compound-interest',
  },
  {
    icon: 'flow',
    title: 'The Financial Order of Operations',
    desc: 'Every calculator, organized by the nine steps — from deductibles to abundance.',
    href: '/financial-mutants',
  },
  {
    icon: 'anchor',
    title: 'Coast FIRE Calculator',
    desc: 'Find the moment compound growth alone carries you to retirement — no more contributions.',
    href: '/apps/coast-fire',
  },
];

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Is this the official Money Guy Show page?',
    a: 'No. Money Guy Mutants is an independent, fan-made project. We are not affiliated with, endorsed by, or sponsored by The Money Guy Show or Abound Wealth Management, LLC. This page simply celebrates the show and links you to their real channel — every video here opens on YouTube, where the creators get the view.',
  },
  {
    q: 'Where do the latest videos come from?',
    a: `We read the channel's public feed and link each upload straight to YouTube. We don't host, download, or re-upload anything — clicking a card takes you to the original video on ${MONEY_GUY_CHANNEL_HANDLE}.`,
  },
  {
    q: 'Why build a tribute page?',
    a: 'Because the show turned a lot of us into financial mutants. The least we can do is send more people their way — and give fans free tools to run their own numbers on the ideas the show teaches, from the wealth multiplier to the Financial Order of Operations.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${CANONICAL}#webpage`,
      url: CANONICAL,
      name: 'The Money Guy Show — Watch, Subscribe & Run the Numbers',
      description:
        'A financial-mutant tribute to The Money Guy Show: subscribe on YouTube, watch the latest episodes, and run the numbers behind the Financial Order of Operations.',
      isPartOf: { '@id': 'https://moneyguymutants.com/#website' },
      breadcrumb: { '@id': `${CANONICAL}#breadcrumb` },
      about: {
        '@type': 'TVSeries',
        name: 'The Money Guy Show',
        sameAs: [MONEY_GUY_CHANNEL_URL, MONEY_GUY_SITE_URL],
      },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${CANONICAL}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://moneyguymutants.com' },
        { '@type': 'ListItem', position: 2, name: 'The Money Guy Show', item: CANONICAL },
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

export default function TheMoneyGuyShowPage() {
  return (
    <MarketingShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="hero-gradient" style={{ padding: '96px 24px 48px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 14 }}>
            A FINANCIAL MUTANT TRIBUTE
          </div>
          <h1 className="h-hero" style={{ margin: '0 0 18px', fontSize: 'clamp(40px,6vw,58px)' }}>
            The Money Guy Show, from one financial mutant to another.
          </h1>
          <p
            style={{
              fontSize: 19,
              color: 'var(--gray-600)',
              lineHeight: 1.6,
              margin: '0 0 28px',
              maxWidth: '60ch',
            }}
          >
            The show turned a generation of us into financial mutants. This is our
            thank-you: a place to subscribe, catch the latest episodes, and run
            your own numbers on the ideas the show teaches every week.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button
              href={MONEY_GUY_SUBSCRIBE_URL}
              variant="primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <MarketingIcon name="youtube" size={16} /> Subscribe on YouTube
            </Button>
            <Button href="#latest" variant="secondary" tone="navy">
              Watch the latest <MarketingIcon name="arrowRight" size={14} />
            </Button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '18px 0 0', lineHeight: 1.5 }}>
            An independent fan project — not affiliated with, endorsed by, or
            sponsored by The Money Guy Show.
          </p>
        </div>
      </section>

      {/* Homage */}
      <section style={{ padding: '32px 24px 8px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
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
                For years, Brian Preston and Bo Hanson have made the boring,
                life-changing math of wealth-building feel urgent: capture the
                match, avoid lifestyle creep, respect the{' '}
                <strong style={{ color: 'var(--navy)' }}>wealth multiplier</strong>,
                and let time do the heavy lifting. They gave the movement a name —{' '}
                <strong style={{ color: 'var(--navy)' }}>financial mutants</strong>
                {' '}— people willing to do what the average person won&rsquo;t.
              </p>
              <p style={{ margin: 0 }}>
                We&rsquo;re fans first. Money Guy Mutants exists because the show
                changed how we think about money, and building free tools inspired
                by the{' '}
                <strong style={{ color: 'var(--navy)' }}>
                  Financial Order of Operations
                </strong>{' '}
                felt like the right way to say thanks. This page is the front door
                to the source material — go watch, go subscribe, then come back and
                run your own numbers.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Where to watch & listen */}
      <section style={{ padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
            WHERE TO WATCH &amp; LISTEN
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
            Get the show, straight from the source.
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {WATCH_LINKS.map((link) => (
              <Card
                key={link.title}
                style={{ padding: 24, display: 'flex', flexDirection: 'column' }}
              >
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
                  <MarketingIcon name={link.icon} size={20} />
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
                  {link.title}
                </h3>
                <p
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    lineHeight: 1.55,
                    margin: '0 0 18px',
                  }}
                >
                  {link.desc}
                </p>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 'auto',
                    color: 'var(--orange)',
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    textDecoration: 'none',
                  }}
                >
                  {link.cta} <MarketingIcon name="arrowUpRight" size={12} />
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest videos */}
      <section id="latest" style={{ padding: '48px 24px 24px', scrollMarginTop: 80 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
            STRAIGHT FROM THE CHANNEL
          </div>
          <h2
            style={{
              fontSize: 'clamp(28px,4vw,40px)',
              fontWeight: 700,
              color: 'var(--navy)',
              letterSpacing: '-0.02em',
              margin: '0 0 10px',
              lineHeight: 1.15,
            }}
          >
            The latest from The Money Guy Show.
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              lineHeight: 1.6,
              margin: '0 0 28px',
              maxWidth: '60ch',
            }}
          >
            Freshly pulled from the show&rsquo;s public feed. Every video opens on
            YouTube — give it a watch, drop a like, and subscribe.
          </p>

          <LatestVideos limit={6} />

          <div style={{ marginTop: 28 }}>
            <Button
              href={MONEY_GUY_CHANNEL_URL}
              variant="secondary"
              tone="navy"
              target="_blank"
              rel="noopener noreferrer"
            >
              See everything on YouTube <MarketingIcon name="arrowUpRight" size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* Bridge to tools */}
      <section style={{ padding: '40px 24px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
            RUN YOUR OWN NUMBERS
          </div>
          <h2
            style={{
              fontSize: 'clamp(26px,3.5vw,36px)',
              fontWeight: 700,
              color: 'var(--navy)',
              letterSpacing: '-0.02em',
              margin: '0 0 10px',
              lineHeight: 1.15,
            }}
          >
            Watched an episode? Put the math to work.
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              lineHeight: 1.6,
              margin: '0 0 28px',
              maxWidth: '62ch',
            }}
          >
            Free calculators and decision engines inspired by the same ideas — see
            the outcome before you live it.
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {TOOLS.map((tool) => (
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
            <Button href="/financial-mutants" variant="secondary" tone="navy">
              Tools for financial mutants <MarketingIcon name="arrowRight" size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '48px 24px 32px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
            HONEST ANSWERS
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
            The fine print, up front.
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
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
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
            &ldquo;The Money Guy Show&rdquo; and related marks are the property of
            their respective owners. Video thumbnails and titles link to content on
            YouTube owned by their creators. Educational tools only — not financial
            advice.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
