'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Brain,
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  ArrowLeft,
  Shield,
  Loader2,
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { isAdmin } from '@/lib/admin';

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      if (!isAdmin(session.user.email)) {
        router.push('/dashboard');
        return;
      }

      setAuthorized(true);
      setLoading(false);
    };
    checkAdmin();
  }, [router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen bg-[var(--surface-secondary)] flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--color-accent)]" size={32} />
      </div>
    );
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[var(--surface-secondary)]">
      {/* Top bar */}
      <nav className="border-b border-[var(--border-primary)] bg-[var(--surface-primary)] px-6 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors text-sm font-medium">
              <ArrowLeft size={16} />
              Back to App
            </Link>
            <div className="h-5 w-px bg-[var(--border-primary)]" />
            <div className="flex items-center gap-2">
              <div className="bg-[var(--color-accent)] p-1.5 rounded-lg text-white">
                <Brain size={18} />
              </div>
              <span className="font-black text-base tracking-tight text-[var(--text-primary)]">
                Admin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-tertiary)]">
            <Shield size={14} />
            <span className="text-xs font-bold uppercase tracking-wider">Admin Panel</span>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto flex gap-0 md:gap-6 px-4 md:px-6 py-6">
        {/* Sidebar navigation */}
        <aside className="hidden md:block w-56 flex-shrink-0">
          <nav className="sticky top-20 space-y-1">
            {adminNav.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-[var(--radius-lg)] px-4 py-2.5 text-sm font-semibold transition-all ${
                    active
                      ? 'bg-[var(--color-accent)] text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface-primary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile nav tabs */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--surface-primary)] border-t border-[var(--border-primary)] flex">
          {adminNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-bold transition-colors ${
                  active ? 'text-[var(--color-accent)]' : 'text-[var(--text-tertiary)]'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
