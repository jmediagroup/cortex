'use client';

interface GaugeChartProps {
  value: number;
  max: number;
  label?: string;
  formatValue?: (value: number) => string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const defaultFormat = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function GaugeChart({
  value,
  max,
  label = 'Spent This Month',
  formatValue = defaultFormat,
  size = 220,
  strokeWidth = 14,
  className = '',
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);

  // SVG arc math - semicircle from 180° to 0° (left to right)
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10; // offset down slightly

  // Arc from 180° (left) to 0° (right) = π radians
  const startAngle = Math.PI;
  const endAngle = 0;
  const totalArc = Math.PI;

  // Background arc endpoints
  const bgX1 = cx + radius * Math.cos(startAngle);
  const bgY1 = cy - radius * Math.sin(startAngle);
  const bgX2 = cx + radius * Math.cos(endAngle);
  const bgY2 = cy - radius * Math.sin(endAngle);

  // Filled arc endpoint
  const filledAngle = startAngle - (percentage / 100) * totalArc;
  const filledX = cx + radius * Math.cos(filledAngle);
  const filledY = cy - radius * Math.sin(filledAngle);
  const largeArc = percentage > 50 ? 1 : 0;

  const bgPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 1 1 ${bgX2} ${bgY2}`;
  const filledPath = `M ${bgX1} ${bgY1} A ${radius} ${radius} 0 ${largeArc} 1 ${filledX} ${filledY}`;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={size}
        height={size / 2 + 30}
        viewBox={`0 0 ${size} ${size / 2 + 30}`}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="var(--border-secondary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Filled arc */}
        <path
          d={filledPath}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />

        {/* Icon in center */}
        <rect
          x={cx - 10}
          y={cy - 40}
          width={20}
          height={16}
          rx={3}
          fill="none"
          stroke="var(--text-tertiary)"
          strokeWidth={1.5}
        />

        {/* Value text */}
        <text
          x={cx}
          y={cy - 5}
          textAnchor="middle"
          className="text-2xl font-bold"
          fill="var(--text-primary)"
          style={{ fontSize: '24px', fontWeight: 700 }}
        >
          {formatValue(value)}
        </text>

        {/* Label */}
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          fill="var(--text-tertiary)"
          style={{ fontSize: '12px' }}
        >
          {label}
        </text>
      </svg>

      {/* 0% and 100% labels */}
      <div className="flex w-full justify-between px-4 -mt-1">
        <span className="text-xs text-[var(--text-tertiary)]">0%</span>
        <span className="text-xs text-[var(--text-tertiary)]">100%</span>
      </div>
    </div>
  );
}
