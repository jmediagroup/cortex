import type { ReactNode } from 'react';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';
import { LandingCtaLink } from './LandingTracking';

type Props = {
  children: ReactNode;
  /** Landing slug, used for CTA attribution. */
  slug: string;
};

/**
 * Deliberately minimal chrome for search landing pages: one wordmark, one
 * CTA, no site navigation. Fewer exits = more signups, and the page still
 * links to the main site through the footer and in-content links.
 */
export function LandingShell({ children, slug }: Props) {
  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'var(--bg-glass-strong)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderBottom: '1px solid var(--border-subtle)',
          paddingTop: 'var(--safe-top)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <Link href="/" aria-label="Money Guy Mutants home" style={{ textDecoration: 'none' }}>
            <Wordmark size="sm" />
          </Link>
          <LandingCtaLink
            slug={slug}
            location="header"
            className="mgm-btn mgm-btn--primary mgm-btn--sm"
            style={{ whiteSpace: 'nowrap' }}
          >
            Free account
          </LandingCtaLink>
        </div>
      </header>

      <main style={{ background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>{children}</main>

      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-section)',
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '28px 20px 40px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            fontSize: 12,
            color: 'var(--text-tertiary)',
            lineHeight: 1.6,
          }}
        >
          <nav
            aria-label="Footer"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', fontWeight: 600 }}
          >
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
              Home
            </Link>
            <Link href="/apps" style={{ color: 'inherit', textDecoration: 'none' }}>
              All calculators
            </Link>
            <Link href="/guides" style={{ color: 'inherit', textDecoration: 'none' }}>
              Guides
            </Link>
            <Link href="/pricing" style={{ color: 'inherit', textDecoration: 'none' }}>
              Pricing
            </Link>
            <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>
              Terms
            </Link>
            <Link href="/security" style={{ color: 'inherit', textDecoration: 'none' }}>
              Security
            </Link>
          </nav>
          <p style={{ margin: 0 }}>
            Educational models, not personalized financial, tax or legal advice. Projected outcomes
            are uncertain. An independent, fan-made project — not affiliated with, endorsed by, or
            sponsored by The Money Guy Show or Abound Wealth Management, LLC.
          </p>
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} J Media Group LLC.</p>
        </div>
      </footer>
    </>
  );
}
