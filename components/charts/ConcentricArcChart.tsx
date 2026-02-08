'use client';

interface ArcData {
  label: string;
  value: number;
  color: string;
}

interface ConcentricArcChartProps {
  arcs: ArcData[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  className?: string;
}

export default function ConcentricArcChart({
  arcs,
  centerLabel,
  centerValue,
  size = 260,
  className = '',
}: ConcentricArcChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = 16;
  const gap = 22; // gap between arcs
  const startRadius = (size - strokeWidth) / 2 - 10;

  // Each arc is a partial circle. We draw from ~225° to however far the value goes (max ~315° = full)
  const startAngleDeg = 225;
  const maxSweepDeg = 270; // 3/4 circle

  function describeArc(
    radius: number,
    percentage: number,
  ): string {
    const startRad = (startAngleDeg * Math.PI) / 180;
    const sweepRad = ((percentage / 100) * maxSweepDeg * Math.PI) / 180;
    const endRad = startRad + sweepRad;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArc = percentage > 50 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  }

  function describeFullArc(radius: number): string {
    return describeArc(radius, 100);
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => {
          const radius = startRadius - i * gap;

          return (
            <g key={arc.label}>
              {/* Background track */}
              <path
                d={describeFullArc(radius)}
                fill="none"
                stroke="var(--border-secondary)"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Filled arc */}
              <path
                d={describeArc(radius, arc.value)}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </g>
          );
        })}

        {/* Center text */}
        {centerLabel && (
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fill="var(--text-tertiary)"
            style={{ fontSize: '12px' }}
          >
            {centerLabel}
          </text>
        )}
        {centerValue && (
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            fill="var(--text-primary)"
            style={{ fontSize: '26px', fontWeight: 700 }}
          >
            {centerValue}
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-4">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-1.5">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: arc.color }}
            />
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {arc.label} ({arc.value}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
