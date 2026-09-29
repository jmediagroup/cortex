import type { Metadata } from 'next';
import Link from 'next/link';
import { MarketingShell } from '@/components/marketing/MarketingShell';

// LEGAL_REVIEW_REQUIRED — placeholder advertiser/affiliate disclosure
// (docs/monetization/HANDOFF.md, Phase 1). Drew approves this copy before
// offers are switched on; until then the page stays out of search results.
// Every statement below must stay true of the code: offers render only
// after a result, only from approved programs (lib/offers/eligibility.ts),
// never alter a calculation, and are hidden from Pro members by default.

export const metadata: Metadata = {
  title: 'Advertiser disclosure',
  description: 'How Money Guy Mutants makes money, and how sponsored offers work on our calculators.',
  alternates: { canonical: 'https://moneyguymutants.com/disclosure' },
  robots: { index: false, follow: true },
};

const sectionStyle: React.CSSProperties = {
  padding: '28px 0',
  borderTop: '1px solid var(--border-subtle)',
};

const h2Style: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--text-primary)',
  letterSpacing: '-0.02em',
  margin: '0 0 14px',
};

const pStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  lineHeight: 1.65,
  margin: '0 0 16px',
};

export default function DisclosurePage() {
  return (
    <MarketingShell>
      <section className="hero-gradient" style={{ padding: '96px 24px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative' }}>
          <div className="mgm-eyebrow" style={{ marginBottom: 16 }}>
            LEGAL
          </div>
          <h1 className="h-hero" style={{ margin: '0 0 16px', fontSize: 'clamp(36px,6vw,52px)' }}>
            How we make money.
          </h1>
        </div>
      </section>

      <article style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px 96px' }}>
        <p style={{ ...pStyle, fontSize: 17 }}>
          Money Guy Mutants is free to use. To keep it that way, some calculator pages may show an offer from a
          company we have an affiliate relationship with. If you sign up through one of those links, we may earn a
          commission. It doesn&apos;t change what you pay.
        </p>

        <section style={sectionStyle}>
          <h2 style={h2Style}>How sponsored offers work.</h2>
          <ul style={{ color: 'var(--text-secondary)', paddingLeft: 20, lineHeight: 1.75, margin: 0 }}>
            <li>An offer appears only after you have your result — never before.</li>
            <li>We show at most one offer per result, and it is always labeled &ldquo;Sponsored&rdquo;.</li>
            <li>We only show offers from programs we have applied to and been approved by.</li>
            <li>Offers never change a calculation. The math is the same with or without them.</li>
            <li>By default, Pro members don&apos;t see them.</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Education, not advice.</h2>
          <p style={pStyle}>
            Our calculators and articles are educational. They are not personalized financial, tax or legal
            advice, and no result or offer is a guarantee of any return, approval or outcome. Before acting, consider
            your own situation or talk to a qualified professional.
          </p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>Independence.</h2>
          <p style={pStyle}>
            Money Guy Mutants is an independent, fan-made project. It is not affiliated with, endorsed by, or
            sponsored by The Money Guy Show or Abound Wealth Management, LLC.
          </p>
          <p style={{ ...pStyle, margin: 0 }}>
            See also our <Link href="/terms" style={{ textDecoration: 'underline' }}>terms &amp; privacy policy</Link>.
          </p>
        </section>
      </article>
    </MarketingShell>
  );
}
