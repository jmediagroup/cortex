'use client';

import { useId } from 'react';

export type SankeyFlow = {
  label: string;
  value: number;
  /** Optional explicit color; defaults to the category palette below. */
  color?: string;
};

type Props = {
  /** Label of the single source node (default: Income). */
  sourceLabel?: string;
  /** Total value represented by the source node. */
  total: number;
  /** Right-hand flows summing to `total` (or less; extra is unallocated). */
  flows: SankeyFlow[];
  width?: number;
  height?: number;
  /** Currency prefix used in labels. */
  currency?: string;
  ariaLabel?: string;
};

const DEFAULT_COLORS = [
  'var(--sankey-needs)',
  'var(--sankey-wants)',
  'var(--sankey-investments)',
  'var(--color-warning)',
  'var(--emerald-400)',
];

/**
 * Left income node → right category splits, drawn with cubic-bezier ribbons.
 * Port of `ui_kits/mobile/Sankey.jsx`. Labels use `$x.xk` for compactness.
 */
export function Sankey({
  sourceLabel = 'Income',
  total,
  flows,
  width = 340,
  height = 180,
  currency = '$',
  ariaLabel,
}: Props) {
  const gradId = useId().replace(/[^a-zA-Z0-9]/g, '');

  const leftX = 10;
  const leftW = 14;
  const rightX = width - 24;
  const rightW = 14;
  const leftY = 20;
  const leftH = height - 40;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? `${sourceLabel} split across ${flows.length} categories`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {flows.map((_, i) => (
          <linearGradient key={i} id={`sk-${gradId}-${i}`} x1="0" x2="1">
            <stop offset="0%" stopColor="var(--text-primary)" stopOpacity="0.25" />
            <stop
              offset="100%"
              stopColor={flows[i].color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              stopOpacity="0.45"
            />
          </linearGradient>
        ))}
      </defs>

      {/* Income source node */}
      <rect
        x={leftX}
        y={leftY}
        width={leftW}
        height={leftH}
        rx="3"
        fill="var(--text-primary)"
        opacity="0.85"
      />

      {flows.map((flow, i) => {
        const frac = total > 0 ? flow.value / total : 0;
        const thick = frac * leftH;
        const y0 =
          leftY +
          flows.slice(0, i).reduce((sum, f) => sum + (total > 0 ? f.value / total : 0) * leftH, 0);

        const rightTotal = flows.reduce((sum, f) => sum + f.value, 0) || 1;
        const cumulative = flows
          .slice(0, i)
          .reduce((sum, f) => sum + (f.value / rightTotal) * leftH, 0);
        const y1 = leftY + cumulative;
        const h1 = (flow.value / rightTotal) * leftH;

        const x0 = leftX + leftW;
        const x1 = rightX;
        const midX = (x0 + x1) / 2;
        const path =
          `M${x0},${y0} ` +
          `C${midX},${y0} ${midX},${y1} ${x1},${y1} ` +
          `L${x1},${y1 + h1} ` +
          `C${midX},${y1 + h1} ${midX},${y0 + thick} ${x0},${y0 + thick} Z`;

        const color = flow.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length];

        return (
          <g key={flow.label}>
            <path d={path} fill={`url(#sk-${gradId}-${i})`} />
            <rect
              x={rightX}
              y={y1}
              width={rightW}
              height={h1}
              rx="3"
              fill={color}
              opacity="0.9"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
            <text
              x={rightX - 8}
              y={y1 + h1 / 2 + 3}
              textAnchor="end"
              fill="var(--text-primary)"
              fontSize="11"
              fontWeight="600"
              fontFamily="var(--font-sans)"
            >
              {flow.label}
            </text>
            <text
              x={rightX - 8}
              y={y1 + h1 / 2 + 18}
              textAnchor="end"
              fill="var(--text-muted)"
              fontSize="10"
              fontFamily="var(--font-mono)"
            >
              {currency}
              {(flow.value / 1000).toFixed(1)}k
            </text>
          </g>
        );
      })}

      <text
        x={leftX - 4}
        y={leftY - 6}
        fill="var(--text-muted)"
        fontSize="10"
        fontWeight="600"
        fontFamily="var(--font-sans)"
        textAnchor="start"
        style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
      >
        {sourceLabel}
      </text>
      <text
        x={leftX + leftW / 2}
        y={leftY + leftH + 14}
        fill="var(--text-primary)"
        fontSize="11"
        fontWeight="600"
        fontFamily="var(--font-mono)"
        textAnchor="middle"
      >
        {currency}
        {(total / 1000).toFixed(1)}k
      </text>
    </svg>
  );
}
