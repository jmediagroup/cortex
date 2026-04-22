'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Grid3X3, BookOpen, type LucideIcon } from 'lucide-react';
import { LogoMark } from '@/components/marketing/Nav';

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Also treat the route as active when the current path starts with any of these prefixes. */
  activePrefix?: string[];
};

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Apps',
    href: '/dashboard',
    icon: Grid3X3,
    activePrefix: ['/dashboard', '/apps'],
  },
  { label: 'Scenarios', href: '/dashboard/scenarios', icon: Bookmark },
  { label: 'Learn', href: '/articles', icon: BookOpen },
];

export function AppSideNav() {
  const pathname = usePathname() || '';

  const isActive = (item: NavItem) => {
    if (item.href === pathname) return true;
    if (item.activePrefix?.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      // Avoid matching /dashboard/scenarios as Apps
      if (item.href === '/dashboard' && pathname.startsWith('/dashboard/scenarios')) return false;
      return true;
    }
    return false;
  };

  return (
    <aside
      aria-label="Primary"
      style={{
        position: 'sticky',
        top: 0,
        height: '100vh',
        width: 240,
        flexShrink: 0,
        background: 'var(--bg-page)',
        borderRight: '1px solid var(--border-subtle)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
      className="app-side-nav"
    >
      <Link
        href="/"
        aria-label="Cortex home"
        style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}
      >
        <LogoMark size={30} iconSize={16} />
        <span
          style={{
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
          }}
        >
          Cortex
        </span>
      </Link>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div
          className="eyebrow"
          style={{
            fontSize: 10,
            color: 'var(--text-muted)',
            marginBottom: 4,
            padding: '0 10px',
          }}
        >
          WORKSPACE
        </div>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                color: active ? 'var(--emerald-500)' : 'var(--text-secondary)',
                background: active ? 'var(--emerald-tint-soft)' : 'transparent',
                border: `1px solid ${active ? 'var(--emerald-border-soft)' : 'transparent'}`,
                position: 'relative',
              }}
            >
              {active && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: -17,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 3,
                    height: 20,
                    borderRadius: 2,
                    background: 'var(--emerald-500)',
                    boxShadow: '0 0 10px var(--cta-glow-soft)',
                  }}
                />
              )}
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <Link
          href="/pricing"
          style={{
            display: 'block',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--emerald-tint), transparent 80%)',
            border: '1px solid var(--emerald-border-soft)',
            textDecoration: 'none',
          }}
        >
          <div
            className="eyebrow"
            style={{ color: 'var(--emerald-500)', marginBottom: 6, fontSize: 10 }}
          >
            ● UPGRADE
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.4,
              marginBottom: 4,
            }}
          >
            Unlock the full Pro suite.
          </div>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-tertiary)',
              lineHeight: 1.5,
            }}
          >
            Advanced projections, tax logic, Sankey flows.
          </div>
        </Link>
      </div>
    </aside>
  );
}
