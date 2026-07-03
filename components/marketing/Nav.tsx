'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Wordmark } from '@/components/brand/Wordmark';
import { MutantMark } from '@/components/brand/MutantMark';

const NAV_LINKS = [
  { label: 'Tools', href: '/#tools' },
  { label: 'Guides', href: '/guides' },
  { label: 'Thinking', href: '/thinking' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Articles', href: '/articles' },
];

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
    <nav
      aria-label="Primary"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
        background: scrolled ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        transition: 'background 200ms var(--ease-out-quart), border-color 200ms',
        paddingTop: 'var(--safe-top)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          gap: 12,
        }}
      >
        <Link
          href="/"
          aria-label="Money Guy Mutants home"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <Wordmark size="sm" />
        </Link>

        <div
          className="marketing-nav-center"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {NAV_LINKS.map((item) => (
            <NavLink key={item.href} href={item.href}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="marketing-nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link
            href="/login"
            className="marketing-nav-signin"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--text-secondary)',
              padding: '8px 14px',
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="marketing-nav-cta"
            style={{
              background: 'var(--orange)',
              color: 'var(--text-inverse)',
              padding: '9px 18px',
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 13,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)',
              transition: 'box-shadow 160ms, transform 160ms',
            }}
          >
            Get started
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="marketing-nav-burger"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 9999,
              background: 'var(--bg-glass)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
    </nav>
    {mobileOpen && <MobilePanel onClose={() => setMobileOpen(false)} />}
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={ref}
      href={href}
      style={{
        fontSize: 13,
        fontWeight: 500,
        color: 'var(--text-secondary)',
        padding: '8px 14px',
        borderRadius: 9999,
        textDecoration: 'none',
        transition: 'color 120ms, background 120ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--text-primary)';
        e.currentTarget.style.background = 'var(--bg-glass)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {children}
    </Link>
  );
}

function MobilePanel({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="marketing-nav-mobile-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 70,
        background: 'var(--bg-page)',
        display: 'flex',
        flexDirection: 'column',
        overscrollBehavior: 'contain',
        animation: 'fadeIn 180ms var(--ease-out-quart) both',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          paddingTop: `calc(14px + var(--safe-top))`,
          paddingLeft: `calc(20px + var(--safe-left))`,
          paddingRight: `calc(20px + var(--safe-right))`,
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <Link
          href="/"
          aria-label="Money Guy Mutants home"
          onClick={onClose}
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <Wordmark size="sm" />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="tappable"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 9999,
            background: 'var(--bg-glass)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <X size={18} />
        </button>
      </div>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          maxWidth: 640,
          width: '100%',
          margin: '0 auto',
          padding: '8px 24px 24px',
          paddingLeft: `calc(24px + var(--safe-left))`,
          paddingRight: `calc(24px + var(--safe-right))`,
          paddingBottom: `calc(24px + var(--safe-bottom))`,
        }}
      >
        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            style={{
              display: 'block',
              padding: '16px 0',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: 16,
              fontWeight: 600,
              color: 'var(--text-primary)',
              textDecoration: 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 24 }}>
          <Link
            href="/login"
            onClick={onClose}
            style={{
              textAlign: 'center',
              padding: '14px 20px',
              borderRadius: 12,
              background: 'var(--bg-glass)',
              border: '1px solid var(--glass-border-strong)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: 14,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            onClick={onClose}
            style={{
              textAlign: 'center',
              padding: '14px 20px',
              borderRadius: 12,
              background: 'var(--orange)',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              fontSize: 14,
              textDecoration: 'none',
              boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 24px var(--cta-glow-soft)',
            }}
          >
            Get started
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone Money Guy Mutants mascot mark. Kept exported (app shell imports
 * it) — `iconSize` is retained for call-site compatibility but unused now that
 * the mark is the mascot itself rather than a glyph-in-a-tile.
 */
export function LogoMark({ size = 32 }: { size?: number; iconSize?: number }) {
  return <MutantMark size={size} />;
}
