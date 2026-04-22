'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { MarketingIcon } from './Icons';

const NAV_LINKS = [
  { label: 'Tools', href: '/#tools' },
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
    <nav
      aria-label="Primary"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: scrolled ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: `1px solid ${scrolled ? 'var(--border-default)' : 'var(--border-subtle)'}`,
        transition: 'background 200ms var(--ease-out-quart), border-color 200ms',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}
      >
        <Link
          href="/"
          aria-label="Cortex home"
          style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
        >
          <LogoMark />
          <span
            style={{
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
            }}
          >
            Cortex
          </span>
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
          <ThemeToggle />
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
            style={{
              background: 'var(--emerald-500)',
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

      {mobileOpen && <MobilePanel onClose={() => setMobileOpen(false)} />}
    </nav>
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
      style={{
        position: 'fixed',
        inset: '64px 0 0 0',
        zIndex: 49,
        background: 'var(--bg-canvas)',
        borderTop: '1px solid var(--border-default)',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 24px 48px' }}>
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
              background: 'var(--emerald-500)',
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

export function LogoMark({ size = 32, iconSize = 18 }: { size?: number; iconSize?: number }) {
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: 10,
        background: 'linear-gradient(135deg, var(--obsidian-700), var(--obsidian-900))',
        border: '1px solid var(--glass-border-strong)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--emerald-500)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 0 20px var(--cta-glow-soft)',
        flexShrink: 0,
      }}
    >
      <MarketingIcon name="brain" size={iconSize} stroke={1.8} />
    </span>
  );
}
