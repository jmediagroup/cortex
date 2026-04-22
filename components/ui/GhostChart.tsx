'use client';

import { useId } from 'react';

type Props = {
  /** Historical (solid) data series. */
  historical: number[];
  /** Predicted (dotted "ghost") data series. Should start from the last historical value. */
  predicted?: number[];
  width?: number;
  height?: number;
  label?: string;
  forecastLabel?: string;
};

/**
 * GhostChart — solid historical line + dashed forecast line,
 * ported from ui_kits/mobile/GhostChart.jsx. Theming uses tokens
 * so it flips colors automatically under force-dark or light.
 */
export function GhostChart({
  historical,
  predicted = [],
  width = 320,
  height = 140,
  label,
  forecastLabel = 'FORECAST',
}: Props) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');

  if (historical.length === 0) return null;

  const all = [...historical, ...predicted];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const totalPts = all.length > 1 ? all.length - 1 : 1;
  const step = width / totalPts;
  const mapY = (v: number) => height - 20 - ((v - min) / range) * (height - 40);

  const histPts = historical.map<[number, number]>((v, i) => [i * step, mapY(v)]);
  const predPts = predicted.map<[number, number]>((v, i) => [
    (historical.length - 1 + i) * step,
    mapY(v),
  ]);
  const toPath = (pts: [number, number][]) =>
    pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

  const lastHist = histPts[histPts.length - 1];
  const splitX = lastHist[0];
  const areaD = `${toPath(histPts)} L${splitX},${height} L0,${height} Z`;

  const emerald = 'var(--emerald-500)';
  const info = 'var(--color-info)';

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`gh-a-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={emerald} stopOpacity="0.3" />
          <stop offset="100%" stopColor={emerald} stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`gh-b-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={info} stopOpacity="0.12" />
          <stop offset="100%" stopColor={info} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Horizontal gridlines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1="0"
          x2={width}
          y1={height * f}
          y2={height * f}
          stroke="var(--border-subtle)"
          strokeWidth="1"
        />
      ))}

      {/* Forecast zone */}
      {predicted.length > 0 && (
        <>
          <rect
            x={splitX}
            y="0"
            width={width - splitX}
            height={height}
            fill={`url(#gh-b-${id})`}
          />
          <line
            x1={splitX}
            x2={splitX}
            y1="0"
            y2={height}
            stroke={info}
            strokeOpacity="0.3"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <text
            x={splitX + 6}
            y="14"
            fill={info}
            fontSize="9"
            fontWeight="600"
            fontFamily="var(--font-sans)"
            style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
          >
            {forecastLabel}
          </text>
        </>
      )}

      {/* Historical */}
      <path d={areaD} fill={`url(#gh-a-${id})`} />
      <path
        d={toPath(histPts)}
        fill="none"
        stroke={emerald}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 6px var(--cta-glow-soft))' }}
      />

      {/* Predicted ghost */}
      {predPts.length > 1 && (
        <path
          d={toPath(predPts)}
          fill="none"
          stroke={info}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray="3 4"
          style={{ filter: 'drop-shadow(0 0 4px rgba(90,200,250,0.5))' }}
        />
      )}

      {/* Current point */}
      <circle
        cx={lastHist[0]}
        cy={lastHist[1]}
        r="4"
        fill={emerald}
        style={{ filter: 'drop-shadow(0 0 8px var(--cta-glow-strong))' }}
      />
      <circle
        cx={lastHist[0]}
        cy={lastHist[1]}
        r="8"
        fill="none"
        stroke={emerald}
        strokeOpacity="0.5"
      />
    </svg>
  );
}
