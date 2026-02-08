'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import Badge from '@/components/ui/Badge';
import TimeRangeSelector from '@/components/ui/TimeRangeSelector';

// Sample weekly portfolio data (matches Image 7/8 line chart)
const timeRangeData: Record<string, { label: string; value: number }[]> = {
  '1D': [
    { label: '9am', value: 68200 },
    { label: '10am', value: 68800 },
    { label: '11am', value: 67900 },
    { label: '12pm', value: 69100 },
    { label: '1pm', value: 69400 },
    { label: '2pm', value: 68600 },
    { label: '3pm', value: 69732 },
  ],
  '1W': [
    { label: 'Mon', value: 66400 },
    { label: 'Tue', value: 68200 },
    { label: 'Wed', value: 67100 },
    { label: 'Thu', value: 65800 },
    { label: 'Fri', value: 68900 },
    { label: 'Sat', value: 70200 },
    { label: 'Sun', value: 69732 },
  ],
  '1M': [
    { label: '17 Sep', value: 62100 },
    { label: '18 Sep', value: 64800 },
    { label: '19 Sep', value: 66200 },
    { label: '20 Sep', value: 72435 },
    { label: '21 Sep', value: 70100 },
    { label: '22 Sep', value: 78435 },
  ],
  '3M': [
    { label: 'Jul', value: 58000 },
    { label: 'Aug', value: 62400 },
    { label: 'Sep', value: 78435 },
  ],
  '1Y': [
    { label: 'Jan', value: 42000 },
    { label: 'Mar', value: 48200 },
    { label: 'May', value: 52800 },
    { label: 'Jul', value: 58000 },
    { label: 'Sep', value: 68400 },
    { label: 'Nov', value: 74200 },
    { label: 'Dec', value: 78435 },
  ],
  All: [
    { label: '2022', value: 18000 },
    { label: '2023', value: 34500 },
    { label: '2024', value: 56200 },
    { label: '2025', value: 78435 },
  ],
};

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

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
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      <p className="text-xs text-[var(--text-secondary)]">{label}</p>
      <p className="text-sm font-bold text-[var(--text-primary)]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

export default function PortfolioOverview() {
  const [timeRange, setTimeRange] = useState('1M');
  const data = timeRangeData[timeRange] || timeRangeData['1M'];

  return (
    <div className="flex flex-col gap-5">
      {/* Portfolio Value card (Images 7, 8) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
              Portfolio Value
            </p>
            <p className="mt-1 text-3xl font-bold text-[var(--text-primary)]">
              $78,435.09
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-[var(--text-secondary)]">$32,432.33</span>
            <Badge value="+12.50%" variant="positive" size="md" />
          </div>
        </div>
      </div>

      {/* Portfolio chart */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <div className="h-56 w-full md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-purple)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="var(--chart-purple)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-secondary)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--chart-purple)"
                strokeWidth={2.5}
                fill="url(#portfolioGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: 'var(--chart-purple)',
                  stroke: '#fff',
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time range selector (Image 7) */}
        <div className="mt-4 flex justify-center">
          <TimeRangeSelector
            selected={timeRange}
            onChange={setTimeRange}
          />
        </div>
      </div>
    </div>
  );
}
