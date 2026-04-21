'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Grid3X3, BookOpen, type LucideIcon } from 'lucide-react';

type TabItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  activePrefix?: string[];
};

const TABS: TabItem[] = [
  {
    label: 'Apps',
    href: '/dashboard',
    icon: Grid3X3,
    activePrefix: ['/dashboard', '/apps'],
  },
  { label: 'Scenarios', href: '/dashboard/scenarios', icon: Bookmark },
  { label: 'Learn', href: '/articles', icon: BookOpen },
];

export function AppMobileTabBar() {
  const pathname = usePathname() || '';

  const isActive = (tab: TabItem) => {
    if (tab.href === pathname) return true;
    if (tab.activePrefix?.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
      if (tab.href === '/dashboard' && pathname.startsWith('/dashboard/scenarios')) return false;
      return true;
    }
    return false;
  };

  return (
    <nav
      aria-label="Primary mobile"
      className="app-mobile-tab-bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))',
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        gap: 4,
      }}
    >
      {TABS.map((tab) => {
        const active = isActive(tab);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              padding: '6px 0',
              textDecoration: 'none',
              color: active ? 'var(--emerald-500)' : 'var(--text-tertiary)',
            }}
          >
            <Icon size={20} strokeWidth={active ? 2.25 : 2} />
            <span
              style={{
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: '0.02em',
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
