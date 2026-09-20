import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Check } from 'lucide-react';
import {
  LANDING_PAGES,
  getLandingPage,
  landingToolContent,
  type LandingPage,
} from '@/lib/landing-pages';
import { getAllGuides } from '@/lib/guides/content';
import { LandingShell } from '@/components/landing/LandingShell';
import { LandingCalculator } from '@/components/landing/LandingCalculator';
import { LandingCtaLink, LandingViewTracker } from '@/components/landing/LandingTracking';

const BASE_URL = 'https://moneyguymutants.com';

export const dynamicParams = false;

export function generateStaticParams() {
  return LANDING_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};
  const url = `${BASE_URL}/calculators/${page.slug}`;
  return {
    title: page.metaTitle,
    description: page.metaDescription,
    keywords: [page.keyword, ...page.keywords],
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      url,
      title: page.metaTitle,
      description: page.metaDescription,
      siteName: 'Money Guy Mutants',
      images: [{ url: `/apps/${page.tool}/opengraph-image`, width: 1200, height: 630, alt: page.h1 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: page.metaTitle,
      description: page.metaDescription,
      images: [`/apps/${page.tool}/opengraph-image`],
    },
    robots: { index: true, follow: true },
  };
}

function jsonLd(page: LandingPage) {
  const tool = landingToolContent(page);
  const url = `${BASE_URL}/calculators/${page.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.metaTitle,
        description: page.metaDescription,
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${url}#application` },
        dateModified: page.updated,
        inLanguage: 'en-US',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Free calculators', item: `${BASE_URL}/calculators` },
          { '@type': 'ListItem', position: 3, name: tool.name, item: url },
        ],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${url}#application`,
        name: tool.name,
        description: page.metaDescription,
        url,
        applicationCategory: tool.category,
        operatingSystem: 'Web',
        browserRequirements: 'Requires JavaScript',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        featureList: tool.features,
        author: { '@id': `${BASE_URL}/#organization` },
        publisher: { '@id': `${BASE_URL}/#organization` },
      },
      {
        '@type': 'HowTo',
        name: `How to use the ${tool.name.toLowerCase()}`,
        step: page.howItWorks.map((text, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          text,
        })),
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((f) => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      },
    ],
  };
}

const sectionWrap: React.CSSProperties = { maxWidth: 1120, margin: '0 auto', padding: '0 20px' };
const prose: React.CSSProperties = {
  fontSize: 16,
  lineHeight: 1.7,
  color: 'var(--text-secondary)',
  margin: '0 0 16px',
  maxWidth: 720,
};
const h2: React.CSSProperties = {
  fontSize: 'clamp(22px, 3.2vw, 28px)',
  fontWeight: 700,
  letterSpacing: '-0.02em',
  color: 'var(--text-primary)',
  margin: '0 0 14px',
};

export default async function LandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  const tool = landingToolContent(page);
  const guides = getAllGuides().filter((g) => page.relatedGuides.includes(g.slug));
  const related = page.relatedPages.map((s) => getLandingPage(s)).filter(Boolean) as LandingPage[];

  return (
    <LandingShell slug={page.slug}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd(page)) }}
      />
      <LandingViewTracker slug={page.slug} />

      {/* Hero */}
      <section style={{ ...sectionWrap, padding: 'clamp(28px, 5vw, 56px) 20px 16px' }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Home
          </Link>
          <span aria-hidden="true"> › </span>
          <Link href="/calculators" style={{ color: 'inherit', textDecoration: 'none' }}>
            Free calculators
          </Link>
          <span aria-hidden="true"> › </span>
          <span style={{ color: 'var(--text-secondary)' }}>{tool.shortName}</span>
        </nav>
        <div className="mgm-eyebrow" style={{ marginBottom: 12 }}>
          FREE · NO SIGNUP TO TRY
        </div>
        <h1
          style={{
            fontSize: 'clamp(30px, 6vw, 48px)',
            fontWeight: 700,
            letterSpacing: '-0.025em',
            lineHeight: 1.08,
            color: 'var(--navy)',
            margin: '0 0 14px',
            maxWidth: 820,
          }}
        >
          {page.h1}
        </h1>
        <p style={{ ...prose, fontSize: 18, maxWidth: 760, marginBottom: 20 }}>{page.subhead}</p>
        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 8px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px 22px',
            fontSize: 14,
            color: 'var(--text-secondary)',
          }}
        >
          {page.promise.map((p) => (
            <li key={p} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Check size={15} aria-hidden="true" style={{ color: 'var(--teal-green)' }} />
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* Calculator */}
      <section
        aria-label={tool.name}
        style={{ ...sectionWrap, padding: '8px 20px clamp(24px, 4vw, 40px)' }}
      >
        <LandingCalculator tool={page.tool} toolName={tool.name} slug={page.slug} />
      </section>

      {/* CTA */}
      <section style={{ ...sectionWrap, paddingBottom: 'clamp(24px, 4vw, 40px)' }}>
        <div
          style={{
            background: 'var(--navy)',
            color: '#fff',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(24px, 4vw, 40px)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
          }}
        >
          <div style={{ maxWidth: 560 }}>
            <h2 style={{ ...h2, color: '#fff', margin: '0 0 8px' }}>{page.cta.headline}</h2>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.82)' }}>
              {page.cta.sub}
            </p>
          </div>
          <LandingCtaLink
            slug={page.slug}
            location="mid-page"
            className="mgm-btn mgm-btn--primary mgm-btn--lg"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            {page.cta.button} <ArrowRight size={16} aria-hidden="true" />
          </LandingCtaLink>
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...sectionWrap, paddingBottom: 'clamp(24px, 4vw, 40px)' }}>
        <h2 style={h2}>How it works.</h2>
        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 16,
          }}
        >
          {page.howItWorks.map((step, i) => (
            <li
              key={step}
              style={{
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 20,
                fontSize: 15,
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--orange)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 13,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}
              >
                {i + 1}
              </div>
              <div>{step}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* Long-form content */}
      <article style={{ ...sectionWrap, paddingBottom: 'clamp(24px, 4vw, 40px)' }}>
        {page.sections.map((section) => (
          <section key={section.heading} style={{ marginBottom: 32 }}>
            <h2 style={h2}>{section.heading}</h2>
            {section.paragraphs.map((para, i) => (
              <p key={i} style={prose}>
                {para}
              </p>
            ))}
            {section.bullets && (
              <ul style={{ ...prose, paddingLeft: 22 }}>
                {section.bullets.map((b) => (
                  <li key={b} style={{ marginBottom: 6 }}>
                    {b}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>

      {/* FAQ */}
      <section style={{ ...sectionWrap, paddingBottom: 'clamp(24px, 4vw, 40px)' }}>
        <h2 style={h2}>Frequently asked questions.</h2>
        <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {page.faqs.map((faq) => (
            <details
              key={faq.question}
              style={{
                background: 'var(--surface-primary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '4px 18px',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  padding: '12px 0',
                  fontWeight: 600,
                  fontSize: 15,
                  color: 'var(--text-primary)',
                }}
              >
                {faq.question}
              </summary>
              <p style={{ ...prose, fontSize: 15, margin: '0 0 14px' }}>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Related */}
      {(guides.length > 0 || related.length > 0) && (
        <section style={{ ...sectionWrap, paddingBottom: 'clamp(24px, 4vw, 40px)' }}>
          <h2 style={h2}>Keep going.</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 14,
            }}
          >
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/calculators/${r.slug}`}
                style={{
                  textDecoration: 'none',
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 18,
                  color: 'var(--text-primary)',
                }}
              >
                <div className="mgm-eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>
                  CALCULATOR
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{r.h1}</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {r.subhead}
                </div>
              </Link>
            ))}
            {guides.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                style={{
                  textDecoration: 'none',
                  background: 'var(--surface-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 18,
                  color: 'var(--text-primary)',
                }}
              >
                <div className="mgm-eyebrow" style={{ marginBottom: 8, fontSize: 10 }}>
                  GUIDE
                </div>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{g.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                  {g.summary}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section style={{ ...sectionWrap, paddingBottom: 'clamp(40px, 6vw, 64px)', textAlign: 'center' }}>
        <h2 style={{ ...h2, marginBottom: 8 }}>Try the full toolkit — free.</h2>
        <p style={{ ...prose, margin: '0 auto 18px' }}>
          Fourteen calculators, saved scenarios, and a dashboard that remembers where you left off.
          No credit card.
        </p>
        <LandingCtaLink
          slug={page.slug}
          location="bottom"
          className="mgm-btn mgm-btn--primary mgm-btn--lg"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          {page.cta.button} <ArrowRight size={16} aria-hidden="true" />
        </LandingCtaLink>
      </section>
    </LandingShell>
  );
}
