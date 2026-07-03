import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';

/**
 * MGM Card — white surface, thin off-white border, 8px radius, soft warm
 * hover-lift. A general-purpose surface; pass `href` to make it a link card.
 * Hover behaviour is handled by the `.mgm-card` class in globals.css so this
 * stays a server component.
 */
export function Card({
  children,
  href,
  hover = true,
  padded = true,
  className,
  style,
}: {
  children: ReactNode;
  href?: string;
  hover?: boolean;
  padded?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const cls = ['mgm-card', hover ? 'mgm-card--hover' : null, className]
    .filter(Boolean)
    .join(' ');
  const merged: CSSProperties = { padding: padded ? '22px' : 0, ...style };

  if (href) {
    return (
      <Link href={href} className={cls} style={merged}>
        {children}
      </Link>
    );
  }
  return (
    <div className={cls} style={merged}>
      {children}
    </div>
  );
}
