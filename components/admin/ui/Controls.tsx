'use client';

import Link from 'next/link';
import { useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Loader2, Search, X, type LucideIcon } from 'lucide-react';

/** Join truthy class names. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'plain' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--ad-tint)] text-white hover:bg-[#043d65] disabled:bg-[var(--ad-tint)]',
  secondary: 'bg-[var(--ad-fill-strong)] text-[var(--ad-tint)] hover:bg-[rgba(5,76,125,0.14)]',
  plain: 'bg-transparent text-[var(--ad-tint)] hover:bg-[var(--ad-fill)]',
  destructive: 'bg-[rgba(205,32,38,0.09)] text-[var(--ad-red)] hover:bg-[rgba(205,32,38,0.14)]',
};
const SIZE: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-[14px] gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-[52px] px-6 text-[16px] gap-2',
};

export interface ButtonProps {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  'aria-label'?: string;
  title?: string;
  block?: boolean;
}

/** Capsule button in the admin's iOS style. Renders a Link when `href` is set. */
export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  href,
  external,
  onClick,
  disabled,
  loading,
  type = 'button',
  className,
  block,
  ...aria
}: ButtonProps) {
  const cls = cx(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-full font-semibold transition-[background,transform,opacity] duration-150 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100',
    VARIANT[variant],
    SIZE[size],
    block && 'w-full',
    className,
  );
  const iconSize = size === 'sm' ? 16 : 18;
  const content = (
    <>
      {loading ? <Loader2 size={iconSize} className="animate-spin" /> : Icon ? <Icon size={iconSize} strokeWidth={2.2} /> : null}
      {children}
    </>
  );
  if (href && !disabled) {
    return external ? (
      <a href={href} target="_blank" rel="noreferrer" className={cls} {...aria}>
        {content}
      </a>
    ) : (
      <Link href={href} className={cls} {...aria}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={cls} {...aria}>
      {content}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Segmented control (≤ 4 options) — iOS sliding thumb
// ---------------------------------------------------------------------------

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  className,
  size = 'md',
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
  /** Accessible name for the group. */
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cx(
        'relative grid rounded-[10px] bg-[rgba(118,118,128,0.12)] p-[2px]',
        size === 'sm' ? 'h-8' : 'h-9',
        className,
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      <span
        aria-hidden="true"
        className="absolute bottom-[2px] top-[2px] rounded-[8px] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.1),0_1px_1px_rgba(0,0,0,0.06)] transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{
          left: 2,
          width: `calc((100% - 4px) / ${options.length})`,
          transform: `translateX(${index * 100}%)`,
        }}
      />
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onKeyDown={onKey}
            onClick={() => onChange(o.value)}
            className={cx(
              'relative z-[1] truncate rounded-[8px] px-2 font-semibold transition-colors',
              size === 'sm' ? 'text-[13px]' : 'text-[14px]',
              active ? 'text-[var(--ad-label)]' : 'text-[var(--ad-label-2)]',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Filter chips (5+ options, horizontally scrollable)
// ---------------------------------------------------------------------------

export interface ChipGroup<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: SegmentOption<T>[];
}

/** One or more single-select chip groups in a single edge-to-edge scroller. */
export function FilterChips({ groups, className }: { groups: ChipGroup<string>[]; className?: string }) {
  return (
    <div className={cx('ad-hscroll -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:px-0', className)}>
      {groups.map((g, gi) => (
        <div key={g.label} role="radiogroup" aria-label={g.label} className="flex items-center gap-2">
          {gi > 0 && <span aria-hidden="true" className="mx-1 h-5 w-px bg-[var(--ad-sep-strong)]" />}
          {g.options.map((o) => {
            const active = o.value === g.value;
            return (
              <button
                key={o.value || 'all'}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => g.onChange(o.value)}
                className={cx(
                  'h-9 whitespace-nowrap rounded-full px-4 text-[14px] font-semibold transition-[background,color,transform] active:scale-[0.96]',
                  active
                    ? 'bg-[var(--ad-tint)] text-white shadow-[0_2px_6px_rgba(5,76,125,0.25)]'
                    : 'bg-[var(--ad-card)] text-[var(--ad-label-2)] shadow-[inset_0_0_0_0.5px_var(--ad-sep-strong)] hover:text-[var(--ad-label)]',
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Search field
// ---------------------------------------------------------------------------

export function SearchField({
  value,
  onChange,
  placeholder = 'Search',
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cx('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <Search
        size={17}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ad-label-3)]"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-[12px] border-0 bg-[rgba(118,118,128,0.12)] pl-10 pr-10 text-[16px] text-[var(--ad-label)] outline-none placeholder:text-[var(--ad-label-3)] focus:bg-[rgba(118,118,128,0.16)] sm:text-[15px] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[var(--ad-label-3)] hover:text-[var(--ad-label)]"
        >
          <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[var(--ad-label-3)] text-white">
            <X size={12} strokeWidth={3} />
          </span>
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Switch
// ---------------------------------------------------------------------------

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** Accessible name. */
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(!checked);
      }}
      className="ad-switch"
    >
      <span className="ad-switch-thumb" />
    </button>
  );
}
