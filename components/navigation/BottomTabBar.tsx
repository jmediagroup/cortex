'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Grid3X3,
  BookOpen,
  Bookmark,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: typeof Grid3X3;
}

const tabs: TabItem[] = [
  { label: 'Apps', href: '/dashboard', icon: Grid3X3 },
  { label: 'Scenarios', href: '/dashboard/scenarios', icon: Bookmark },
  { label: 'Learn', href: '/articles', icon: BookOpen },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard/scenarios') return pathname === '/dashboard/scenarios';
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/apps');
    if (href === '/articles') return pathname.startsWith('/articles');
    return pathname === href;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-[var(--border-primary)] bg-[var(--surface-primary)] md:hidden"
      style={{
        paddingBottom: 'var(--safe-bottom)',
        paddingLeft: 'var(--safe-left)',
        paddingRight: 'var(--safe-right)',
      }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className="tappable flex flex-1 flex-col items-center gap-1 px-2 py-2 min-h-[44px]"
            >
              <tab.icon
                size={22}
                className={`transition-colors duration-200 ${
                  active ? 'text-[var(--navy)]' : 'text-[var(--text-tertiary)]'
                }`}
              />
              <span
                className={`text-xs font-semibold transition-colors duration-200 ${
                  active ? 'text-[var(--navy)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
