import Link from 'next/link';
import type { CSSProperties, MouseEventHandler, ReactNode } from 'react';

/**
 * Money Guy Mutants button — one shared base (2px border, 4px radius, bold
 * UPPERCASE, 2px tracking), three brand variants.
 *
 *   variant "primary"   → orange fill, white text (the single "act now" color)
 *           "secondary" → ghost: transparent fill, colored border + text
 *           "tertiary"  → yellow fill, deep-navy text (distinct offer track)
 *   tone (secondary only): "orange" | "navy" | "white" (white = for dark bands)
 *
 * Styling + hover live in globals.css (`.mgm-btn*`) so this stays a plain
 * server component. Pass `href` to render a link, otherwise a <button>.
 */
type Variant = 'primary' | 'secondary' | 'tertiary';
type Tone = 'orange' | 'navy' | 'white';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  tone?: Tone;
  size?: Size;
  href?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  target?: string;
  rel?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function Button({
  children,
  variant = 'primary',
  tone = 'orange',
  size = 'md',
  href,
  onClick,
  type = 'button',
  disabled = false,
  target,
  rel,
  className,
  style,
  'aria-label': ariaLabel,
}: ButtonProps) {
  const cls = [
    'mgm-btn',
    `mgm-btn--${variant}`,
    `mgm-btn--${size}`,
    variant === 'secondary' ? `mgm-btn--${tone}` : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={cls}
        style={style}
        target={target}
        rel={rel}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={cls}
      style={style}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
