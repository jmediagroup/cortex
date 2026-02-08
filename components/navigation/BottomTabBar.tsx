'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  Clock,
  Grid3X3,
  BarChart3,
  User,
} from 'lucide-react';

interface TabItem {
  label: string;
  href: string;
  icon: typeof Home;
  isCenter?: boolean;
}

const tabs: TabItem[] = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'History', href: '/dashboard/history', icon: Clock },
  { label: 'Apps', href: '/dashboard/apps', icon: Grid3X3, isCenter: true },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Profile', href: '/account', icon: User },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border-primary)] bg-[var(--surface-primary)]/95 backdrop-blur-lg md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-end justify-around px-2 pt-1 pb-2">
        {tabs.map((tab) => {
          const active = isActive(tab.href);

          if (tab.isCenter) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="relative -mt-5 flex flex-col items-center"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg transition-all duration-200 ${
                    active
                      ? 'bg-[var(--color-accent)] text-white shadow-[var(--color-accent)]/30'
                      : 'bg-[var(--color-accent)] text-white opacity-85 hover:opacity-100'
                  }`}
                >
                  <tab.icon size={24} />
                </div>
                <span
                  className={`mt-1 text-[10px] font-semibold ${
                    active ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5"
            >
              <tab.icon
                size={22}
                className={`transition-colors duration-200 ${
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'
                }`}
              />
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
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
