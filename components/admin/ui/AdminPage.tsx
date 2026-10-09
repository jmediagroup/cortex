'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, Loader2, RefreshCw, type LucideIcon } from 'lucide-react';
import { Button, cx } from './Controls';

export interface PageAction {
  label: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'destructive';
  loading?: boolean;
  disabled?: boolean;
  /** On phones show the label (e.g. "Save") instead of an icon-only circle. */
  textOnPhone?: boolean;
}

interface AdminPageProps {
  title: string;
  subtitle?: ReactNode;
  /** Back link shown at the top-left (pushed screens). */
  back?: { href: string; label: string };
  actions?: PageAction[];
  /** Small label above the large title. */
  eyebrow?: ReactNode;
  /** Enables pull-to-refresh on touch devices. */
  onRefresh?: () => Promise<unknown> | void;
  children: ReactNode;
  className?: string;
}

const CONTAINER = 'mx-auto w-full max-w-[1120px] px-4 sm:px-6 lg:px-8';

/**
 * Every admin screen: a translucent sticky navigation bar whose compact title
 * fades in once the large title scrolls under it (UINavigationBar large-title
 * behaviour), optional back link and actions, and pull-to-refresh.
 */
export function AdminPage({ title, subtitle, back, actions = [], eyebrow, onRefresh, children, className }: AdminPageProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const { pull, refreshing, dragging } = usePullToRefresh(onRefresh);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const el = titleRef.current;
      if (!el) return;
      const bar = 52 + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--safe-top')) || 0);
      const h1 = el.querySelector('h1');
      const bottom = (h1 ?? el).getBoundingClientRect().bottom;
      setScrolled(bottom < bar + 4);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={className}>
      <header className="ad-navbar" data-scrolled={scrolled}>
        <div className={cx(CONTAINER, 'ad-navbar-inner')}>
          <div className="flex min-w-0 items-center">
            {back && (
              <Link
                href={back.href}
                className="-ml-2 inline-flex h-11 min-w-0 items-center gap-0.5 rounded-full pl-1 pr-3 text-[16px] font-medium text-[var(--ad-tint)] transition hover:bg-[var(--ad-fill)] active:opacity-60"
              >
                <ChevronLeft size={26} strokeWidth={2.2} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{back.label}</span>
              </Link>
            )}
          </div>
          <div className="ad-navbar-title text-[var(--ad-label)]" aria-hidden={!scrolled}>
            {title}
          </div>
          <div className="flex items-center justify-end gap-2">
            {actions.map((a) => (
              <ActionButton key={a.label} action={a} />
            ))}
          </div>
        </div>
      </header>

      {onRefresh && (
        <div className="ad-ptr" data-active={dragging} style={{ height: pull }} aria-hidden={!refreshing}>
          <span className="flex items-end pb-3">
            {refreshing ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <RefreshCw
                size={20}
                style={{ transform: `rotate(${Math.min(pull / 64, 1) * 270}deg)`, opacity: Math.min(pull / 48, 1) }}
              />
            )}
          </span>
          {refreshing && <span className="sr-only">Refreshing</span>}
        </div>
      )}

      <div className={CONTAINER}>
        <div ref={titleRef} className="pb-5 pt-1 lg:pt-3">
          {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
          <h1 className="ad-large-title text-[var(--ad-label)]">{title}</h1>
          {subtitle && <div className="mt-1.5 text-[15px] leading-snug text-[var(--ad-label-2)]">{subtitle}</div>}
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionButton({ action }: { action: PageAction }) {
  const { label, icon: Icon, href, onClick, variant = 'secondary', loading, disabled, textOnPhone } = action;
  const iconOnly = Boolean(Icon) && !textOnPhone;
  const btnVariant = variant === 'destructive' ? 'destructive' : variant;
  return (
    <>
      {/* Phones: icon circle (or short text pill) */}
      <span className="sm:hidden">
        {iconOnly ? (
          <Button
            variant={btnVariant}
            size="sm"
            icon={Icon}
            href={href}
            onClick={onClick}
            loading={loading}
            disabled={disabled}
            aria-label={label}
            title={label}
            className="!h-9 !w-9 !px-0"
          />
        ) : (
          <Button variant={btnVariant} size="sm" href={href} onClick={onClick} loading={loading} disabled={disabled}>
            {label}
          </Button>
        )}
      </span>
      {/* Tablet & desktop: icon + label */}
      <span className="hidden sm:inline-flex">
        <Button variant={btnVariant} size="sm" icon={Icon} href={href} onClick={onClick} loading={loading} disabled={disabled}>
          {label}
        </Button>
      </span>
    </>
  );
}

/** Lightweight pull-to-refresh for touch devices (window scroller). */
function usePullToRefresh(onRefresh?: () => Promise<unknown> | void) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const pullRef = useRef(0);
  const busyRef = useRef(false);
  const refreshRef = useRef(onRefresh);
  refreshRef.current = onRefresh;
  const enabled = Boolean(onRefresh);

  useEffect(() => {
    if (!enabled) return;
    let startY: number | null = null;
    const set = (v: number) => {
      pullRef.current = v;
      setPull(v);
    };
    const onStart = (e: TouchEvent) => {
      if (busyRef.current || window.scrollY > 0 || e.touches.length !== 1) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest('dialog, textarea, input, select, .ad-hscroll, .recharts-wrapper')) return;
      startY = e.touches[0].clientY;
    };
    const onMove = (e: TouchEvent) => {
      if (startY === null) return;
      const dy = e.touches[0].clientY - startY;
      if (dy <= 0 || window.scrollY > 0) {
        if (pullRef.current) set(0);
        return;
      }
      setDragging(true);
      set(Math.min(96, dy * 0.45));
    };
    const onEnd = async () => {
      if (startY === null) return;
      startY = null;
      setDragging(false);
      if (pullRef.current >= 60 && refreshRef.current) {
        busyRef.current = true;
        setRefreshing(true);
        set(52);
        try {
          await refreshRef.current();
        } finally {
          busyRef.current = false;
          setRefreshing(false);
          set(0);
        }
      } else {
        set(0);
      }
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled]);

  return { pull, refreshing, dragging };
}
