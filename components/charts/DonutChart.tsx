'use client';

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSegment[];
  innerRadius?: number;
  outerRadius?: number;
  className?: string;
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: DonutSegment }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: item.payload.color }}
        />
        <span className="text-xs font-semibold text-[var(--text-primary)]">{item.name}</span>
      </div>
      <p className="mt-0.5 text-sm font-bold text-[var(--text-primary)]">
        {formatCurrency(item.value)}
      </p>
    </div>
  );
}

export default function DonutChart({
  data,
  innerRadius = 60,
  outerRadius = 100,
  className = '',
}: DonutChartProps) {
  return (
    <div className={`h-64 w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
