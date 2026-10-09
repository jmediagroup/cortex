'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Bookmark, ChevronDown, LogOut, Shield, User } from 'lucide-react';
import { type Tier, getTierDisplayName } from '@/lib/access-control';
import { isAdmin } from '@/lib/admin';

interface UserMenuProps {
  user: { email: string; name?: string };
  userTier?: Tier;
  onSignOut?: () => void;
  /**
   * `full`: avatar + name + plan badge (desktop top nav).
   * `compact`: avatar only, 44px tap target (mobile header).
   */
  variant?: 'full' | 'compact';
}

/** The signed-in account menu: My Account, My Scenarios, Upgrade, Admin, Sign Out. */
export default function UserMenu({ user, userTier = 'free', onSignOut, variant = 'full' }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = user.name || user.email;
  const initial = label.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const tierBadgeColor =
    userTier === 'finance_pro'
      ? 'bg-[var(--sky)] text-[var(--navy-deep)]'
      : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)]';

  const itemClass =
    'flex w-full min-h-[44px] items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-secondary)]';

  return (
    <div className="relative" ref={ref}>
      {variant === 'full' ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex items-center gap-2.5 rounded-full border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-1.5 transition-colors hover:bg-[var(--surface-tertiary)]"
        >
          <span className="relative">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--navy)] text-xs font-bold text-white">
              {initial}
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface-secondary)] bg-[var(--color-positive)]" />
          </span>
          <span className="max-w-[140px] truncate text-sm font-semibold text-[var(--text-primary)]">{label}</span>
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${tierBadgeColor}`}>
            {getTierDisplayName(userTier)}
          </span>
          <ChevronDown
            size={14}
            className={`text-[var(--text-tertiary)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label="Account menu"
          className="tappable -mr-1.5 flex h-11 w-11 items-center justify-center rounded-full"
        >
          <span className="relative">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--navy)] text-xs font-bold text-white">
              {initial}
            </span>
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--surface-primary)] bg-[var(--color-positive)]" />
          </span>
        </button>
      )}

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)]"
          style={{ boxShadow: 'var(--shadow-elevated)' }}
        >
          <div className="border-b border-[var(--border-secondary)] bg-[var(--surface-secondary)] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-sm font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-[var(--text-primary)]">{label}</p>
                <p className="text-xs font-semibold uppercase text-[var(--text-tertiary)]">
                  {getTierDisplayName(userTier)} Plan
                </p>
              </div>
            </div>
          </div>
          <div className="py-1">
            <Link href="/account" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              <User size={16} className="text-[var(--text-tertiary)]" />
              My Account
            </Link>
            <Link href="/dashboard/scenarios" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              <Bookmark size={16} className="text-[var(--text-tertiary)]" />
              My Scenarios
            </Link>
            <Link href="/pricing" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
              <ChevronDown size={16} className="rotate-[-90deg] text-[var(--text-tertiary)]" />
              Upgrade Plan
            </Link>
            {isAdmin(user.email) && (
              <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
                <Shield size={16} className="text-[var(--text-tertiary)]" />
                Admin Panel
              </Link>
            )}
            {onSignOut && (
              <>
                <div className="my-1 border-t border-[var(--border-secondary)]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    onSignOut();
                  }}
                  className={`${itemClass} !text-[var(--color-negative)] hover:!bg-[var(--color-negative-light)]`}
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
