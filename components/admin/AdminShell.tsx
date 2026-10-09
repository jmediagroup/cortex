'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import { ArrowUpRight, Ellipsis, LayoutGrid, LogOut, Loader2 } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { isAdmin } from '@/lib/admin';
import { MutantMark } from '@/components/brand/MutantMark';
import { ADMIN_MORE, ADMIN_NAV, ADMIN_TABS, activeNavItem, isRootRoute, type AdminNavItem } from './nav';
import { IconTile, ListGroup, ListRow, Sheet, ToastProvider, cx } from './ui';

/**
 * The admin app frame.
 * - Phones (< 768px): floating tab bar with a "More" sheet; hidden on pushed
 *   screens (editors) so forms get the whole screen.
 * - Tablets (768–1023px): a compact icon rail.
 * - Desktop (≥ 1024px): a full sidebar.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || '/admin';
  const [supabase] = useState(() => createBrowserClient());
  const [email, setEmail] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  // The More sheet belongs to the route it was opened on, so navigating
  // anywhere closes it without an effect.
  const [morePath, setMorePath] = useState<string | null>(null);
  const moreOpen = morePath === pathname;

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        router.push('/login');
        return;
      }
      if (!isAdmin(session.user.email)) {
        router.push('/dashboard');
        return;
      }
      setEmail(session.user.email ?? null);
      setAuthorized(true);
    })();
    return () => {
      active = false;
    };
  }, [router, supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!authorized) {
    return (
      <div className="admin-app flex min-h-dvh flex-col items-center justify-center gap-5">
        <MutantMark size={56} />
        <Loader2 className="animate-spin text-[var(--ad-label-3)]" size={22} aria-label="Loading admin" />
      </div>
    );
  }

  const current = activeNavItem(pathname);
  const root = isRootRoute(pathname);
  const moreActive = Boolean(current && !current.tab);

  return (
    <ToastProvider>
      <div className="admin-app" data-tabbar={root}>
        <Sidebar pathname={pathname} email={email} onSignOut={signOut} />
        <Rail pathname={pathname} onSignOut={signOut} />

        <main className="ad-main md:pl-[88px] lg:pl-[264px]">
          <div key={pathname} className="ad-enter">
            {children}
          </div>
        </main>

        {root && (
          <nav aria-label="Admin sections" className="ad-tabbar md:hidden">
            {ADMIN_TABS.map((item) => (
              <TabLink key={item.key} item={item} active={current?.key === item.key} />
            ))}
            <button
              type="button"
              className="ad-tab"
              data-active={moreActive || moreOpen}
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              onClick={() => setMorePath(pathname)}
            >
              <Ellipsis size={23} strokeWidth={2.2} aria-hidden="true" />
              <span>{moreActive && current ? current.short ?? current.label : 'More'}</span>
            </button>
          </nav>
        )}

        <Sheet open={moreOpen} onClose={() => setMorePath(null)} title="More">
          <div className="space-y-6">
            <ListGroup>
              {ADMIN_MORE.map((item) => (
                <ListRow
                  key={item.key}
                  href={item.href}
                  title={item.label}
                  leading={<IconTile icon={item.icon} tone={item.tone} />}
                  trailing={current?.key === item.key ? <span className="text-[13px] font-semibold text-[var(--ad-label-3)]">Current</span> : undefined}
                />
              ))}
            </ListGroup>
            <ListGroup>
              <ListRow href="/" title="View live site" leading={<IconTile icon={ArrowUpRight} tone="sky" />} />
              <ListRow href="/dashboard" title="Back to the app" leading={<IconTile icon={LayoutGrid} tone="gray" />} />
            </ListGroup>
            <ListGroup footer={email ? `Signed in as ${email}` : undefined}>
              <ListRow onClick={signOut} title="Sign out" destructive centered />
            </ListGroup>
          </div>
        </Sheet>
      </div>
    </ToastProvider>
  );
}

function TabLink({ item, active }: { item: AdminNavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link href={item.href} className="ad-tab" data-active={active} aria-current={active ? 'page' : undefined}>
      <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 rounded-[12px] text-[var(--ad-label)]" aria-label="Admin home">
      <MutantMark size={compact ? 34 : 32} />
      {!compact && (
        <span className="leading-tight">
          <span className="block text-[16px] font-extrabold tracking-[-0.01em]">Admin</span>
          <span className="block text-[12px] font-medium text-[var(--ad-label-3)]">Money Guy Mutants</span>
        </span>
      )}
    </Link>
  );
}

function Sidebar({ pathname, email, onSignOut }: { pathname: string; email: string | null; onSignOut: () => void }) {
  const current = activeNavItem(pathname);
  const groups = ADMIN_NAV.reduce<Record<string, AdminNavItem[]>>((acc, item) => {
    (acc[item.group] ||= []).push(item);
    return acc;
  }, {});

  return (
    <aside
      aria-label="Admin navigation"
      className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col border-r-[0.5px] border-[var(--ad-sep-strong)] bg-[#fbfcfd] lg:flex"
    >
      <div className="px-5 pb-4 pt-6">
        <Brand />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            {group !== 'Home' && (
              <p className="mb-1 px-3 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[var(--ad-label-3)]">{group}</p>
            )}
            <ul className="space-y-0.5">
              {items.map((item) => {
                const active = current?.key === item.key;
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cx(
                        'flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[15px] transition-colors',
                        active
                          ? 'bg-[rgba(78,201,245,0.18)] font-bold text-[var(--ad-label)]'
                          : 'font-medium text-[var(--ad-label-2)] hover:bg-[var(--ad-fill)] hover:text-[var(--ad-label)]',
                      )}
                    >
                      <IconTile icon={item.icon} tone={item.tone} size={26} />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="space-y-1 border-t-[0.5px] border-[var(--ad-sep-strong)] p-3">
        <Link
          href="/"
          className="flex h-10 items-center gap-3 rounded-[10px] px-2.5 text-[14px] font-medium text-[var(--ad-label-2)] hover:bg-[var(--ad-fill)] hover:text-[var(--ad-label)]"
        >
          <ArrowUpRight size={18} className="text-[var(--ad-label-3)]" aria-hidden="true" /> View live site
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          className="flex h-10 w-full items-center gap-3 rounded-[10px] px-2.5 text-left text-[14px] font-medium text-[var(--ad-label-2)] hover:bg-[var(--ad-fill)] hover:text-[var(--ad-red)]"
        >
          <LogOut size={18} className="text-[var(--ad-label-3)]" aria-hidden="true" />
          <span className="min-w-0 flex-1">
            <span className="block">Sign out</span>
            {email && <span className="block truncate text-[12px] text-[var(--ad-label-3)]">{email}</span>}
          </span>
        </button>
      </div>
    </aside>
  );
}

function Rail({ pathname, onSignOut }: { pathname: string; onSignOut: () => void }) {
  const current = activeNavItem(pathname);
  return (
    <aside
      aria-label="Admin navigation"
      className="fixed inset-y-0 left-0 z-30 hidden w-[88px] flex-col items-center border-r-[0.5px] border-[var(--ad-sep-strong)] bg-[#fbfcfd] pb-[max(var(--safe-bottom),12px)] pt-[calc(var(--safe-top)+16px)] md:flex lg:hidden"
    >
      <Brand compact />
      <nav className="mt-5 flex w-full flex-1 flex-col items-center gap-1 overflow-y-auto px-2">
        {ADMIN_NAV.map((item) => {
          const active = current?.key === item.key;
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cx(
                'flex w-full flex-col items-center gap-1 rounded-[14px] py-2 text-[11px] font-semibold leading-tight transition-colors',
                active ? 'bg-[rgba(78,201,245,0.18)] text-[var(--ad-label)]' : 'text-[var(--ad-label-3)] hover:bg-[var(--ad-fill)] hover:text-[var(--ad-label)]',
              )}
            >
              <Icon size={22} strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              <span className="max-w-full truncate px-1">{item.short ?? item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col items-center gap-1 pt-2">
        <Link
          href="/"
          aria-label="View live site"
          title="View live site"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--ad-label-3)] hover:bg-[var(--ad-fill)] hover:text-[var(--ad-label)]"
        >
          <ArrowUpRight size={20} />
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          aria-label="Sign out"
          title="Sign out"
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--ad-label-3)] hover:bg-[var(--ad-fill)] hover:text-[var(--ad-red)]"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
