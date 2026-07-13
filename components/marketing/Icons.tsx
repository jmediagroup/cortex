import type { SVGProps } from 'react';

export type MarketingIconName =
  | 'brain'
  | 'arrowRight'
  | 'arrowUpRight'
  | 'sparkles'
  | 'calculator'
  | 'wallet'
  | 'trendUp'
  | 'trendDown'
  | 'barChart'
  | 'dices'
  | 'compass'
  | 'anchor'
  | 'check'
  | 'lock'
  | 'shield'
  | 'star'
  | 'chevronR'
  | 'bookOpen'
  | 'zap'
  | 'pulse'
  | 'orbit'
  | 'flow'
  | 'dot'
  | 'landmark'
  | 'car'
  | 'scale'
  | 'mapPin'
  | 'building'
  | 'play'
  | 'youtube'
  | 'bell'
  | 'headphones'
  | 'externalLink';

type Props = Omit<SVGProps<SVGSVGElement>, 'name' | 'stroke' | 'width' | 'height'> & {
  name: MarketingIconName;
  size?: number;
  stroke?: number;
};

export function MarketingIcon({ name, size = 18, stroke = 1.75, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

const paths: Record<MarketingIconName, React.ReactNode> = {
  brain: (
    <>
      <path d="M12 18V5" />
      <path d="M15 13a4 4 0 0 1-3-4 4 4 0 0 1-3 4" />
      <path d="M17.6 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.6 1.5" />
      <path d="M18 18a4 4 0 0 0 2-7.5" />
      <path d="M20 17.5A4 4 0 1 1 12 18a4 4 0 1 1-8-.5" />
      <path d="M6 18a4 4 0 0 1-2-7.5" />
    </>
  ),
  arrowRight: (
    <>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </>
  ),
  arrowUpRight: (
    <>
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8L18 15z" />
    </>
  ),
  calculator: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="16" y2="10" />
      <line x1="8" y1="14" x2="10" y2="14" />
      <line x1="14" y1="14" x2="16" y2="14" />
      <line x1="8" y1="18" x2="10" y2="18" />
      <line x1="14" y1="18" x2="16" y2="18" />
    </>
  ),
  wallet: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="17" cy="14.5" r="1.5" />
    </>
  ),
  trendUp: (
    <>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </>
  ),
  trendDown: (
    <>
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
    </>
  ),
  barChart: (
    <>
      <line x1="6" y1="20" x2="6" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="18" y1="20" x2="18" y2="14" />
    </>
  ),
  dices: (
    <>
      <rect x="2.5" y="8.5" width="13" height="13" rx="2" />
      <path d="M8.5 8.5V3a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5.5" />
      <circle cx="6" cy="15" r="0.8" />
      <circle cx="12" cy="15" r="0.8" />
      <circle cx="15.5" cy="4.5" r="0.8" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </>
  ),
  anchor: (
    <>
      <circle cx="12" cy="5" r="3" />
      <line x1="12" y1="22" x2="12" y2="8" />
      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
    </>
  ),
  check: <polyline points="20 6 9 17 4 12" />,
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  star: <polygon points="12 2 15.1 8.3 22 9.3 17 14.1 18.2 21 12 17.8 5.8 21 7 14.1 2 9.3 8.9 8.3 12 2" />,
  chevronR: <polyline points="9 18 15 12 9 6" />,
  bookOpen: (
    <>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </>
  ),
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" stroke="none" />,
  pulse: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
  orbit: (
    <>
      <circle cx="12" cy="12" r="3" />
      <ellipse cx="12" cy="12" rx="10" ry="4.5" transform="rotate(-30 12 12)" />
    </>
  ),
  flow: (
    <>
      <path d="M3 6h8l4 6 6-3" />
      <path d="M3 12h6l4 6 8-2" />
      <path d="M3 18h4" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />,
  landmark: (
    <>
      <line x1="3" y1="22" x2="21" y2="22" />
      <line x1="6" y1="18" x2="6" y2="11" />
      <line x1="10" y1="18" x2="10" y2="11" />
      <line x1="14" y1="18" x2="14" y2="11" />
      <line x1="18" y1="18" x2="18" y2="11" />
      <polyline points="12 2 20 7 4 7 12 2" />
    </>
  ),
  car: (
    <>
      <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2" />
      <circle cx="6.5" cy="16.5" r="2.5" />
      <circle cx="16.5" cy="16.5" r="2.5" />
    </>
  ),
  scale: (
    <>
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
      <path d="M7 21h10" />
      <path d="M12 3v18" />
      <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </>
  ),
  play: <polygon points="6 4 20 12 6 20 6 4" fill="currentColor" stroke="none" />,
  youtube: (
    <>
      <path d="M22 8.4a2.8 2.8 0 0 0-2-2C18.3 6 12 6 12 6s-6.3 0-8 .4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 1.7 12a29 29 0 0 0 .3 3.6 2.8 2.8 0 0 0 2 2C5.7 18 12 18 12 18s6.3 0 8-.4a2.8 2.8 0 0 0 2-2 29 29 0 0 0 .3-3.6 29 29 0 0 0-.3-3.6z" />
      <polygon points="10 9 15.2 12 10 15 10 9" fill="currentColor" stroke="none" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>
  ),
  headphones: (
    <>
      <path d="M3 14v-2a9 9 0 0 1 18 0v2" />
      <path d="M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z" />
      <path d="M3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z" />
    </>
  ),
  externalLink: (
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </>
  ),
};
