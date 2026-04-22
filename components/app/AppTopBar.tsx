'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  User as UserIcon,
} from 'lucide-react';
import { getTierDisplayName, type Tier } from '@/lib/access-control';
import { isAdmin } from '@/lib/admin';
import { LogoMark } from '@/components/marketing/Nav';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

type User = { email: string; name?: string } | null | undefined;

type Props = {
  user?: User;
  userTier?: Tier;
  onSignOut?: () => void;
};

export function AppTopBar({ user, userTier = 'free', onSignOut }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocMouse(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouse);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouse);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const displayName = user?.name || user?.email?.split('@')[0] || 'Account';
  const initial = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const showAdmin = Boolean(user?.email && isAdmin(user.email));

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 24px',
        background: 'var(--bg-glass-strong)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <Link
        href="/"
        aria-label="Cortex home"
        className="app-top-bar-logo"
        style={{
          display: 'none',
          alignItems: 'center',
          gap: 10,
          textDecoration: 'none',
        }}
      >
        <LogoMark size={28} iconSize={15} />
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

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeToggle />
        {user ? (
          <>
            <Link
              href="/account"
              aria-label="Settings"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: '50%',
                color: 'var(--text-tertiary)',
                textDecoration: 'none',
                background: 'transparent',
                transition: 'background 160ms, color 160ms',
              }}
            >
              <Settings size={18} />
            </Link>
            <div ref={ref} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 12px 6px 6px',
                  borderRadius: 9999,
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--glass-border-strong)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: 'var(--emerald-500)',
                    color: 'var(--text-inverse)',
                    fontWeight: 700,
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {initial}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    maxWidth: 140,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  className="app-top-bar-user-name"
                >
                  {displayName}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    borderRadius: 9999,
                    background:
                      userTier === 'finance_pro'
                        ? 'var(--emerald-tint)'
                        : 'var(--bg-glass-strong)',
                    color:
                      userTier === 'finance_pro'
                        ? 'var(--emerald-500)'
                        : 'var(--text-tertiary)',
                    border: `1px solid ${
                      userTier === 'finance_pro'
                        ? 'var(--emerald-border)'
                        : 'var(--glass-border)'
                    }`,
                  }}
                >
                  {getTierDisplayName(userTier)}
                </span>
                <ChevronDown
                  size={14}
                  color="var(--text-tertiary)"
                  style={{ transition: 'transform 160ms', transform: open ? 'rotate(180deg)' : 'none' }}
                />
              </button>

              {open && (
                <div
                  role="menu"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    minWidth: 240,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-elevated)',
                    overflow: 'hidden',
                    zIndex: 60,
                  }}
                >
                  <div
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: 'var(--bg-glass)',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}
                    >
                      {displayName}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono)',
                        marginTop: 2,
                      }}
                    >
                      {getTierDisplayName(userTier)} Plan
                    </div>
                  </div>
                  <MenuLink href="/account" icon={<UserIcon size={14} />}>
                    My account
                  </MenuLink>
                  <MenuLink href="/dashboard/scenarios" icon={<Bookmark size={14} />}>
                    My scenarios
                  </MenuLink>
                  <MenuLink href="/pricing" icon={<ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />}>
                    Upgrade plan
                  </MenuLink>
                  {showAdmin && (
                    <MenuLink href="/admin" icon={<Shield size={14} />}>
                      Admin panel
                    </MenuLink>
                  )}
                  {onSignOut && (
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        onSignOut();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 0,
                        color: 'var(--crimson-500)',
                        fontWeight: 500,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        borderTop: '1px solid var(--border-subtle)',
                      }}
                    >
                      <LogOut size={14} /> Sign out
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href="/login"
            style={{
              padding: '8px 16px',
              borderRadius: 9999,
              background: 'var(--emerald-500)',
              color: 'var(--text-inverse)',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              boxShadow: '0 0 0 1px var(--cta-glow-ring), 0 0 16px var(--cta-glow-soft)',
            }}
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

function MenuLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 16px',
        color: 'var(--text-primary)',
        textDecoration: 'none',
        fontSize: 13,
        fontWeight: 500,
        borderTop: '1px solid var(--border-subtle)',
      }}
    >
      <span style={{ color: 'var(--text-tertiary)', display: 'inline-flex' }}>{icon}</span>
      {children}
    </Link>
  );
}
