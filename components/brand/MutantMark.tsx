import type { CSSProperties } from 'react';

/**
 * Money Guy Mutants mascot mark — mint head, navy ninja mask, sky antennae,
 * white eyes, grin + fang. Uses literal brand hex (not currentColor) so it
 * renders correctly on any background (navy, white, or sky). Antennae are sky
 * so the mark reads on both light and dark surfaces.
 *
 * Aspect ratio is 120 x 124; height is derived from `size` (the width).
 */
export function MutantMark({
  size = 34,
  title,
  style,
  className,
}: {
  /** Mark width — a px number, or any CSS length (e.g. a responsive clamp()).
   *  Height is derived from the 120×124 aspect ratio. */
  size?: number | string;
  title?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const width = typeof size === 'number' ? `${size}px` : size;
  const height = `calc(${width} * 124 / 120)`;
  return (
    <svg
      viewBox="0 0 120 124"
      className={className}
      style={{ display: 'block', flex: 'none', width, height, ...style }}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {/* antennae */}
      <g fill="none" stroke="#4EC9F5" strokeWidth="5.5" strokeLinecap="round">
        <path d="M46 30 Q39 12 28 9" />
        <path d="M74 30 Q81 12 92 9" />
      </g>
      <circle cx="27" cy="8" r="6.5" fill="#4EC9F5" />
      <circle cx="93" cy="8" r="6.5" fill="#4EC9F5" />
      {/* head */}
      <path
        d="M60 22 C89 22 101 43 101 64 C101 92 83 106 60 106 C37 106 19 92 19 64 C19 43 31 22 60 22 Z"
        fill="#8FD9CE"
      />
      {/* chin shadow */}
      <path
        d="M25 78 C33 96 46 106 60 106 C74 106 87 96 95 78 C82 88 70 91 60 91 C50 91 38 88 25 78 Z"
        fill="#1D8072"
        opacity="0.28"
      />
      {/* navy ninja mask band */}
      <path d="M12 52 Q60 45 108 52 L120 49 L114 61 L120 74 L108 70 Q60 63 12 70 Z" fill="#054C7D" />
      {/* eyes */}
      <ellipse cx="44" cy="61" rx="11" ry="8.5" fill="#ffffff" />
      <ellipse cx="76" cy="61" rx="11" ry="8.5" fill="#ffffff" />
      <circle cx="46" cy="62" r="3.6" fill="#054C7D" />
      <circle cx="78" cy="62" r="3.6" fill="#054C7D" />
      {/* grin + fang */}
      <path d="M46 84 Q60 95 74 84" fill="none" stroke="#054C7D" strokeWidth="5" strokeLinecap="round" />
      <path d="M64 88 l3 6 3 -6 Z" fill="#ffffff" />
    </svg>
  );
}
