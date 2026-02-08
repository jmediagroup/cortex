'use client';

import { Star, Briefcase, Mail } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import KPICard from '@/components/ui/KPICard';
import ChartCard from '@/components/ui/ChartCard';

const profitData = [
  { month: 'Jul', profit: 18400 },
  { month: 'Aug', profit: 24200 },
  { month: 'Sep', profit: 28600 },
  { month: 'Oct', profit: 14300 },
  { month: 'Nov', profit: 22100 },
  { month: 'Dec', profit: 31800 },
];

const formatCompact = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const pct = ((payload[0].value / 31800) * 100).toFixed(1);
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm font-bold text-[var(--text-primary)]">{pct}%</p>
    </div>
  );
}

export default function PerformanceView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards (Image 4) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KPICard
          icon={Briefcase}
          label="Portfolio"
          value="$34,489.00"
          comparison="Total Generated"
        />
        <KPICard
          icon={Mail}
          label="Mail Software"
          value="$21,455.43"
          comparison="Total Generated"
        />
      </div>

      {/* Profit Rates bar chart (Image 4) */}
      <ChartCard
        title="Profit Rates"
        filterOptions={['Monthly', 'Quarterly', 'Yearly']}
        selectedFilter="Monthly"
      >
        <div className="h-64 w-full md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profitData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-secondary)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={formatCompact}
                tick={{ fontSize: 12, fill: 'var(--text-tertiary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="profit"
                fill="var(--chart-purple)"
                radius={[6, 6, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Profit rating (Image 4) */}
      <div
        className="flex flex-col items-center gap-2 rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-4 py-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Your Profit Rate</h3>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <Star
              key={i}
              size={24}
              className="fill-[var(--color-warning)] text-[var(--color-warning)]"
            />
          ))}
          <Star size={24} className="text-[var(--border-primary)]" />
        </div>
        <p className="text-center text-xs text-[var(--text-tertiary)]">
          Above average performance this quarter.
        </p>
      </div>
    </div>
  );
}
