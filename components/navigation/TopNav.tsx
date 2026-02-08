'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  Grid3X3,
  BookOpen,
  Settings,
  User,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { type Tier, getTierDisplayName } from '@/lib/access-control';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Grid3X3;
}

const navItems: NavItem[] = [
  { label: 'Apps', href: '/dashboard', icon: Grid3X3 },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setDropdownOpen(false);
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname.startsWith('/dashboard');
    if (href === '/articles') return pathname.startsWith('/articles');
    return pathname === href;
  };

  const tierBadgeColor =
    userTier === 'elite'
      ? 'bg-purple-600 text-white'
      : userTier === 'finance_pro'
        ? 'bg-[var(--color-accent)] text-white'
        : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]';

  return (
    <nav className="hidden md:flex items-center justify-between border-b border-[var(--border-primary)] bg-[var(--surface-primary)] px-6 py-3 sticky top-0 z-50">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="bg-[var(--color-accent)] p-1.5 rounded-lg text-white">
            <Brain size={20} />
          </div>
          <span className="font-black text-lg tracking-tight text-[var(--text-primary)]">
            Cortex
          </span>
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
                    ? 'bg-[var(--color-accent)] text-white shadow-sm'
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
        <button
          onClick={onSettingsClick}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
          aria-label="Settings"
        >
          <Settings size={18} />
        </button>

        {/* User dropdown */}
        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-full border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-1.5 transition-colors hover:bg-[var(--surface-tertiary)]"
            >
              <div className="relative">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent)] text-xs font-bold text-white">
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface-secondary)] bg-[var(--color-positive)]" />
              </div>
              <span className="max-w-[140px] truncate text-sm font-semibold text-[var(--text-primary)]">
                {user.name || user.email}
              </span>
              <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase ${tierBadgeColor}`}>
                {getTierDisplayName(userTier)}
              </span>
              <ChevronDown
                size={14}
                className={`text-[var(--text-tertiary)] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] z-50"
                style={{ boxShadow: 'var(--shadow-elevated)' }}
              >
                <div className="border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent)] text-sm font-bold text-white">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[var(--text-primary)]">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                        {getTierDisplayName(userTier)} Plan
                      </p>
                    </div>
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/account"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
                  >
                    <User size={16} className="text-[var(--text-tertiary)]" />
                    My Account
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]"
                  >
                    <ChevronDown size={16} className="rotate-[-90deg] text-[var(--text-tertiary)]" />
                    Upgrade Plan
                  </Link>
                  <div className="my-1 border-t border-[var(--border-secondary)]" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onSignOut?.();
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--color-negative)] transition-colors hover:bg-[var(--color-negative-light)]"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
