'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ChevronRight, ExternalLink, type LucideIcon } from 'lucide-react';
import { cx } from './Controls';

// ---------------------------------------------------------------------------
// Tones shared by pills and icon tiles
// ---------------------------------------------------------------------------

export type Tone = 'navy' | 'sky' | 'green' | 'red' | 'amber' | 'orange' | 'blue' | 'gray' | 'violet';

const TILE_BG: Record<Tone, string> = {
  navy: '#054c7d',
  sky: '#1f9ccc',
  green: '#1d8072',
  red: '#cd2026',
  amber: '#c98a0b',
  orange: '#f26531',
  blue: '#0a6fd1',
  gray: '#7c8a94',
  violet: '#5b4bc4',
};

const PILL: Record<Tone, string> = {
  navy: 'bg-[rgba(5,76,125,0.1)] text-[#054c7d]',
  sky: 'bg-[rgba(78,201,245,0.2)] text-[#075985]',
  green: 'bg-[rgba(29,128,114,0.12)] text-[#176a5e]',
  red: 'bg-[rgba(205,32,38,0.1)] text-[#a81a1f]',
  amber: 'bg-[rgba(176,115,10,0.12)] text-[#8a5a06]',
  orange: 'bg-[rgba(242,101,49,0.12)] text-[#b8441a]',
  blue: 'bg-[rgba(10,111,209,0.1)] text-[#0a5cad]',
  gray: 'bg-[rgba(118,118,128,0.13)] text-[#4b5560]',
  violet: 'bg-[rgba(91,75,196,0.12)] text-[#4a3caa]',
};

/** Small rounded status label. */
export function Pill({ tone = 'gray', children, icon: Icon, className }: { tone?: Tone; children: ReactNode; icon?: LucideIcon; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[11.5px] font-semibold capitalize leading-none',
        PILL[tone],
        className,
      )}
    >
      {Icon && <Icon size={12} strokeWidth={2.4} aria-hidden="true" />}
      {children}
    </span>
  );
}

/** Settings-style coloured square with a white glyph. */
export function IconTile({ icon: Icon, tone = 'navy', size = 30 }: { icon: LucideIcon; tone?: Tone; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center text-white"
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), background: TILE_BG[tone] }}
    >
      <Icon size={Math.round(size * 0.57)} strokeWidth={2.1} />
    </span>
  );
}

/** Round initial avatar. */
export function Avatar({ name, tone = 'navy', size = 38 }: { name: string; tone?: Tone; size?: number }) {
  const letter = (name.trim()[0] || '?').toUpperCase();
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: TILE_BG[tone], fontSize: Math.round(size * 0.42) }}
    >
      {letter}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Inset grouped list
// ---------------------------------------------------------------------------

export function ListGroup({
  header,
  headerAction,
  footer,
  children,
  className,
}: {
  header?: ReactNode;
  headerAction?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      {(header || headerAction) && (
        <div className="mb-2 flex min-h-[20px] items-end justify-between gap-3 px-4">
          {header && <h2 className="text-[13px] font-semibold uppercase tracking-[0.04em] text-[var(--ad-label-3)]">{header}</h2>}
          {headerAction}
        </div>
      )}
      <div className="ad-group">{children}</div>
      {footer && <div className="mt-2 px-4 text-[13px] leading-snug text-[var(--ad-label-3)]">{footer}</div>}
    </section>
  );
}

export interface ListRowProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Extra line under the subtitle (e.g. metrics). */
  meta?: ReactNode;
  leading?: ReactNode;
  /** Right-aligned value text. */
  detail?: ReactNode;
  /** Right-aligned element (pill, switch…) shown after `detail`. */
  trailing?: ReactNode;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  /** Show the disclosure chevron. Defaults to true when the row navigates. */
  chevron?: boolean;
  destructive?: boolean;
  /** Center the title (for lone destructive/action rows). */
  centered?: boolean;
  /** Let the title wrap onto a second line instead of truncating. */
  wrapTitle?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  detail,
  trailing,
  href,
  external,
  onClick,
  chevron,
  destructive,
  centered,
  wrapTitle,
  className,
  ariaLabel,
}: ListRowProps) {
  const navigates = Boolean(href || onClick);
  const showChevron = chevron ?? (navigates && !destructive && !centered);
  const inner = (
    <>
      {leading}
      <span className="ad-row-main">
        <span className={cx('min-w-0 flex-1', centered && 'text-center')}>
          <span
            className={cx(
              'block text-[16px] font-medium leading-snug',
              destructive ? 'text-[var(--ad-red)]' : centered ? 'text-[var(--ad-tint)] font-semibold' : 'text-[var(--ad-label)]',
              !centered && (wrapTitle ? 'line-clamp-2' : 'truncate'),
            )}
          >
            {title}
          </span>
          {subtitle && <span className="mt-0.5 block truncate text-[13.5px] leading-snug text-[var(--ad-label-2)]">{subtitle}</span>}
          {meta && <span className="mt-1 block text-[12.5px] leading-snug text-[var(--ad-label-3)]">{meta}</span>}
        </span>
        {detail !== undefined && detail !== null && (
          <span className="shrink-0 text-right text-[15px] tabular-nums text-[var(--ad-label-2)]">{detail}</span>
        )}
        {trailing}
        {showChevron &&
          (external ? (
            <ExternalLink size={15} className="shrink-0 text-[var(--ad-label-3)] opacity-70" aria-hidden="true" />
          ) : (
            <ChevronRight size={18} className="-mr-1 shrink-0 text-[var(--ad-label-3)] opacity-60" aria-hidden="true" />
          ))}
      </span>
    </>
  );

  const cls = cx('ad-row', className);
  if (href) {
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" className={cls} aria-label={ariaLabel}>
        {inner}
      </a>
    ) : (
      <Link href={href} className={cls} aria-label={ariaLabel}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} aria-label={ariaLabel}>
        {inner}
      </button>
    );
  }
  return <div className={cls}>{inner}</div>;
}

/** Label/value row for read-only details (iOS "Value 1" cell). */
export function DetailRow({ label, value, mono }: { label: ReactNode; value: ReactNode; mono?: boolean }) {
  return (
    <div className="ad-row">
      <span className="ad-row-main">
        <span className="shrink-0 text-[15px] text-[var(--ad-label)]">{label}</span>
        <span
          className={cx(
            'min-w-0 flex-1 truncate text-right text-[15px] text-[var(--ad-label-2)]',
            mono && 'font-mono text-[13px]',
          )}
        >
          {value}
        </span>
      </span>
    </div>
  );
}
