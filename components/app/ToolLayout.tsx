import type { ReactNode } from 'react';
import Link from 'next/link';
import { MarketingIcon } from '@/components/marketing/Icons';

type Props = {
  /** Small uppercase context above the title. e.g. `FINANCE · CALCULATOR`. */
  eyebrow: string;
  /** Sentence-case title, ending with a period per voice rules. */
  title: string;
  /** One-sentence sub in secondary text. */
  sub: string;
  /** Breadcrumb / back navigation element. Optional. */
  breadcrumb?: ReactNode;
  /** Tool body — calculator, chart, controls, etc. */
  children: ReactNode;
  /**
   * Optional narration line rendered below the body — a single
   * setup → pivot → land sentence that reframes the result.
   */
  narration?: string;
  /** Optional disclaimer one-liner. Defaults to the standard finance disclaimer. */
  disclaimer?: string;
  /** Content rendered below the narration (SEO, related tools, etc.). */
  footer?: ReactNode;
  /** Optional upsell CTA rendered between header and body for non-logged-in visitors. */
  cta?: ReactNode;
};

/**
 * Shared tool page scaffolding. Lives inside the force-dark AppShell,
 * so every tool inherits the obsidian palette automatically.
 */
export function ToolLayout({
  eyebrow,
  title,
  sub,
  breadcrumb,
  children,
  narration,
  disclaimer = 'Educational model · not personalized advice · projected outcomes are uncertain.',
  footer,
  cta,
}: Props) {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 64px' }}>
      {breadcrumb && <div style={{ marginBottom: 20 }}>{breadcrumb}</div>}

      <header style={{ marginBottom: 32, maxWidth: 780 }}>
        <div
          className="eyebrow"
          style={{ color: 'var(--text-tertiary)', marginBottom: 12 }}
        >
          {eyebrow}
        </div>
        <h1
          style={{
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            margin: '0 0 12px',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {sub}
        </p>
      </header>

      {cta && <div style={{ marginBottom: 24 }}>{cta}</div>}

      <div>{children}</div>

      {narration && (
        <div
          style={{
            marginTop: 40,
            padding: '24px 28px',
            background: 'var(--bg-glass)',
            border: '1px solid var(--glass-border)',
            borderLeft: '3px solid var(--emerald-500)',
            borderRadius: 'var(--radius-md)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
          }}
        >
          <div
            className="eyebrow"
            style={{ color: 'var(--emerald-500)', marginBottom: 8 }}
          >
            THE READ
          </div>
          <p
            style={{
              fontSize: 16,
              color: 'var(--text-primary)',
              lineHeight: 1.55,
              margin: 0,
              letterSpacing: '-0.005em',
            }}
          >
            {narration}
          </p>
        </div>
      )}

      {footer && <div style={{ marginTop: 40 }}>{footer}</div>}

      <footer
        style={{
          marginTop: 48,
          paddingTop: 20,
          borderTop: '1px solid var(--border-subtle)',
        }}
      >
        <div
          className="eyebrow"
          style={{ color: 'var(--text-muted)', marginBottom: 6 }}
        >
          NOT ADVICE
        </div>
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {disclaimer}
        </p>
      </footer>
    </div>
  );
}

type CtaProps = {
  /** Short headline ending in a period. */
  headline: string;
  /** Sub-headline explaining the value. */
  sub: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

/**
 * Opinionated upsell banner used by tool pages for unauthenticated visitors.
 * Replaces the old indigo-gradient banner pattern with an obsidian island.
 */
export function ToolUpsellCta({
  headline,
  sub,
  primaryHref = '/signup',
  primaryLabel = 'Create free account',
  secondaryHref = '/pricing',
  secondaryLabel = 'View all tools',
}: CtaProps) {
  return (
    <div
      data-theme="dark"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #121620 0%, #0A0E14 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        color: '#F5F5F7',
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at top right, rgba(0,240,160,0.18), transparent 60%)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
        }}
      >
        <div style={{ flex: '1 1 320px', minWidth: 0 }}>
          <div className="eyebrow" style={{ color: '#00F0A0', marginBottom: 10 }}>
            ● FREE ACCOUNT
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              margin: '0 0 6px',
              letterSpacing: '-0.015em',
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: '#AEAEB2',
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            {sub}
          </p>
        </div>
        <div style={{ display: 'inline-flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            href={primaryHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#00F0A0',
              color: '#0A0E14',
              padding: '12px 20px',
              borderRadius: 12,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              boxShadow:
                '0 0 0 1px rgba(0,240,160,0.4), 0 0 28px rgba(0,240,160,0.35)',
              whiteSpace: 'nowrap',
            }}
          >
            {primaryLabel} <MarketingIcon name="arrowRight" size={14} />
          </Link>
          <Link
            href={secondaryHref}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(255,255,255,0.06)',
              color: '#F5F5F7',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '12px 20px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
