'use client';

import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react';
import { cx } from './Controls';
import type { Tone } from './List';

// ---------------------------------------------------------------------------
// Card + section heading
// ---------------------------------------------------------------------------

export function Card({ children, className, padded = true }: { children: ReactNode; className?: string; padded?: boolean }) {
  return <div className={cx('ad-group', padded && 'p-4 sm:p-5', className)}>{children}</div>;
}

export function CardTitle({ children, icon: Icon, action }: { children: ReactNode; icon?: LucideIcon; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="flex min-w-0 items-center gap-2 text-[17px] font-bold tracking-[-0.01em] text-[var(--ad-label)]">
        {Icon && <Icon size={18} className="shrink-0 text-[var(--ad-label-3)]" aria-hidden="true" />}
        <span className="truncate">{children}</span>
      </h2>
      {action}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Callout (inline banners)
// ---------------------------------------------------------------------------

const CALLOUT: Record<'info' | 'warning' | 'error' | 'success', { cls: string; icon: LucideIcon }> = {
  info: { cls: 'bg-[rgba(10,111,209,0.07)] text-[var(--ad-label-2)] [--c:var(--ad-blue)]', icon: Info },
  warning: { cls: 'bg-[rgba(176,115,10,0.09)] text-[var(--ad-label-2)] [--c:var(--ad-amber)]', icon: AlertTriangle },
  error: { cls: 'bg-[rgba(205,32,38,0.07)] text-[#8f171b] [--c:var(--ad-red)]', icon: XCircle },
  success: { cls: 'bg-[rgba(29,128,114,0.09)] text-[#14594f] [--c:var(--ad-green)]', icon: CheckCircle2 },
};

export function Callout({
  tone = 'info',
  title,
  children,
  icon,
  action,
  className,
}: {
  tone?: keyof typeof CALLOUT;
  title?: ReactNode;
  children?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}) {
  const { cls, icon: DefaultIcon } = CALLOUT[tone];
  const Icon = icon ?? DefaultIcon;
  return (
    <div
      role={tone === 'error' ? 'alert' : undefined}
      className={cx('flex gap-3 rounded-[14px] px-4 py-3.5 text-[14px] leading-relaxed', cls, className)}
    >
      <Icon size={18} className="mt-[2px] shrink-0 text-[var(--c)]" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold text-[var(--ad-label)]">{title}</p>}
        {children && <div className={cx(Boolean(title) && 'mt-0.5', '[&_code]:rounded [&_code]:bg-white/70 [&_code]:px-1 [&_code]:py-px [&_code]:text-[12.5px] [&_code]:break-all')}>{children}</div>}
        {action && <div className="mt-2.5">{action}</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
}: {
  icon: LucideIcon;
  title: string;
  message?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="ad-group flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ad-fill)] text-[var(--ad-label-3)]">
        <Icon size={26} aria-hidden="true" />
      </span>
      <p className="text-[17px] font-bold text-[var(--ad-label)]">{title}</p>
      {message && <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-[var(--ad-label-2)]">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

const STAT_TONE: Record<Tone, string> = {
  navy: '#054c7d',
  sky: '#1f9ccc',
  green: '#1d8072',
  red: '#cd2026',
  amber: '#b0730a',
  orange: '#f26531',
  blue: '#0a6fd1',
  gray: '#66737d',
  violet: '#5b4bc4',
};

export function StatTile({
  label,
  value,
  icon: Icon,
  tone = 'navy',
  sub,
  compact,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  tone?: Tone;
  sub?: ReactNode;
  compact?: boolean;
}) {
  const color = STAT_TONE[tone];
  return (
    <div className={cx('ad-group min-w-0', compact ? 'px-3.5 py-3' : 'p-4')}>
      <div className="flex items-center gap-2">
        {Icon && (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${color}1a`, color }}
          >
            <Icon size={15} strokeWidth={2.3} />
          </span>
        )}
        <span className="truncate text-[13px] font-semibold text-[var(--ad-label-2)]">{label}</span>
      </div>
      <p
        className={cx(
          'mt-2 truncate font-bold tabular-nums tracking-[-0.02em] text-[var(--ad-label)]',
          compact ? 'text-[22px]' : 'text-[26px] sm:text-[28px]',
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 truncate text-[12.5px] text-[var(--ad-label-3)]">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

export function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <span aria-hidden="true" className={cx('ad-skel block', className)} style={style} />;
}

export function SkeletonList({ rows = 6, avatar = true }: { rows?: number; avatar?: boolean }) {
  return (
    <div className="ad-group" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="ad-row">
          {avatar && <Skeleton className="h-9 w-9 !rounded-full" />}
          <span className="ad-row-main">
            <span className="flex-1 space-y-2">
              <Skeleton className="h-3.5" style={{ width: `${55 + ((i * 17) % 35)}%` }} />
              <Skeleton className="h-3 w-1/3" />
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function SkeletonTiles({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cx('grid grid-cols-2 gap-3 lg:grid-cols-4', className)} aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ad-group space-y-3 p-4">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-7 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/** Generic page skeleton: tiles + a list. */
export function PageSkeleton({ tiles = 0, rows = 6 }: { tiles?: number; rows?: number }) {
  return (
    <div className="space-y-6">
      {tiles > 0 && <SkeletonTiles count={tiles} />}
      <SkeletonList rows={rows} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export function Pager({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const btn =
    'inline-flex h-10 items-center justify-center rounded-full bg-[var(--ad-card)] px-4 text-[14px] font-semibold text-[var(--ad-tint)] shadow-[var(--ad-shadow)] transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100';
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-3">
      <button type="button" className={btn} disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      <span className="text-[13px] font-medium tabular-nums text-[var(--ad-label-3)]">
        Page {page} of {totalPages}
      </span>
      <button type="button" className={btn} disabled={page >= totalPages} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </nav>
  );
}
