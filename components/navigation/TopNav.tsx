'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Wordmark } from '@/components/brand/Wordmark';
import { Grid3X3, BookOpen, Bookmark, Settings } from 'lucide-react';
import { type Tier } from '@/lib/access-control';
import UserMenu from './UserMenu';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Grid3X3;
}

const navItems: NavItem[] = [
  { label: 'Apps', href: '/dashboard', icon: Grid3X3 },
  { label: 'Scenarios', href: '/dashboard/scenarios', icon: Bookmark },
  { label: 'Learn', href: '/articles', icon: BookOpen },
];

interface TopNavProps {
  user?: {
    email: string;
    name?: string;
  } | null;
  userTier?: Tier;
  onSignOut?: () => void;
  onSettingsClick?: () => void;
}

export default function TopNav({
  user,
  userTier = 'free',
  onSignOut,
  onSettingsClick,
}: TopNavProps) {
  const pathname = usePathname();
  const isActive = (href: string) => {
    if (href === '/dashboard/scenarios') return pathname === '/dashboard/scenarios';
    if (href === '/dashboard') return pathname === '/dashboard' || pathname.startsWith('/apps');
    if (href === '/articles') return pathname.startsWith('/articles');
    return pathname === href;
  };

  return (
    <nav className="hidden md:flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--surface-primary)] px-6 py-3 sticky top-0 z-50">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity" aria-label="Money Guy Mutants home">
          <Wordmark size="sm" />
        </Link>

        <div className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? 'bg-[var(--sky)] text-[var(--navy-deep)] shadow-sm'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Right: Utilities + User */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={onSettingsClick}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>

            <UserMenu user={user} userTier={userTier} onSignOut={onSignOut} />
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="rounded-full bg-[var(--orange)] px-4 py-2 text-sm font-bold text-white transition-all hover:opacity-90"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
