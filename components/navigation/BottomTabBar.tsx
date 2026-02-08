'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Grid3X3,
  BookOpen,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: typeof Grid3X3;
}

const tabs: TabItem[] = [
  { label: 'Apps', href: '/dashboard', icon: Grid3X3 },
  { label: 'Learn', href: '/articles', icon: BookOpen },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname.startsWith('/dashboard');
    if (href === '/articles') return pathname.startsWith('/articles');
    return pathname === href;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-primary)] bg-[var(--surface-primary)]/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-6 py-1.5"
            >
              <tab.icon
                size={22}
                className={`transition-colors duration-200 ${
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'
                }`}
              />
              <span
                className={`text-xs font-semibold transition-colors duration-200 ${
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'
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
