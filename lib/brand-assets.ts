/**
 * Money Guy Mutants brand marks as inline SVG strings, for use in `next/og`
 * ImageResponse routes (favicon, apple-icon, OG/Twitter cards). Satori renders
 * `<img>` with a data-URI reliably, whereas inline `<svg>` child shapes are
 * flakier — so these are exposed as base64 data URIs to drop into `<img src>`.
 *
 * Keep these in sync with components/brand/MutantMark.tsx and public/*.svg.
 */
export const MUTANT_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 124">
<g fill="none" stroke="#4EC9F5" stroke-width="5.5" stroke-linecap="round"><path d="M46 30 Q39 12 28 9"/><path d="M74 30 Q81 12 92 9"/></g>
<circle cx="27" cy="8" r="6.5" fill="#4EC9F5"/><circle cx="93" cy="8" r="6.5" fill="#4EC9F5"/>
<path d="M60 22 C89 22 101 43 101 64 C101 92 83 106 60 106 C37 106 19 92 19 64 C19 43 31 22 60 22 Z" fill="#8FD9CE"/>
<path d="M25 78 C33 96 46 106 60 106 C74 106 87 96 95 78 C82 88 70 91 60 91 C50 91 38 88 25 78 Z" fill="#1D8072" opacity="0.28"/>
<path d="M12 52 Q60 45 108 52 L120 49 L114 61 L120 74 L108 70 Q60 63 12 70 Z" fill="#054C7D"/>
<ellipse cx="44" cy="61" rx="11" ry="8.5" fill="#ffffff"/><ellipse cx="76" cy="61" rx="11" ry="8.5" fill="#ffffff"/>
<circle cx="46" cy="62" r="3.6" fill="#054C7D"/><circle cx="78" cy="62" r="3.6" fill="#054C7D"/>
<path d="M46 84 Q60 95 74 84" fill="none" stroke="#054C7D" stroke-width="5" stroke-linecap="round"/>
<path d="M64 88 l3 6 3 -6 Z" fill="#ffffff"/>
</svg>`;

export const MUTANT_MARK_DATA_URI = `data:image/svg+xml;base64,${btoa(MUTANT_MARK_SVG)}`;

/** Brand hex, mirrored from tokens.css for OG routes (which can't read CSS vars). */
export const BRAND = {
  navy: '#054C7D',
  navyDeep: '#153055',
  sky: '#4EC9F5',
  mint: '#8FD9CE',
  orange: '#F26531',
  white: '#FFFFFF',
  offWhite: '#F7F3F3',
} as const;
