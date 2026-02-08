'use client';

import { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import KPICard from '@/components/ui/KPICard';
import ChartCard from '@/components/ui/ChartCard';
import FilterPills from '@/components/ui/FilterPills';
import { AIInsightsPanel } from '@/components/ai';

// Sample data for the overview chart (matches Image 11 bar+line pattern)
const monthlyData = [
  { month: 'Jan', revenue: 10200, sales: 8400 },
  { month: 'Feb', revenue: 12800, sales: 9600 },
  { month: 'Mar', revenue: 23400, sales: 18200 },
  { month: 'Apr', revenue: 19800, sales: 15400 },
  { month: 'May', revenue: 18200, sales: 6100 },
  { month: 'Jun', revenue: 24600, sales: 19800 },
  { month: 'Jul', revenue: 28400, sales: 22100 },
  { month: 'Aug', revenue: 26800, sales: 21400 },
  { month: 'Sep', revenue: 32100, sales: 25600 },
  { month: 'Oct', revenue: 30400, sales: 24200 },
  { month: 'Nov', revenue: 35800, sales: 28400 },
  { month: 'Dec', revenue: 42100, sales: 33600 },
];

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US')}`;

const formatCompact = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
  return value.toString();
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] px-3 py-2"
      style={{ boxShadow: 'var(--shadow-elevated)' }}
    >
      <p className="mb-1.5 text-xs font-semibold text-[var(--text-secondary)]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-[var(--text-secondary)]">{entry.name}</span>
          <span className="ml-auto text-xs font-bold text-[var(--text-primary)]">
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

interface DashboardHomeProps {
  userName?: string;
}

export default function DashboardHome({ userName }: DashboardHomeProps) {
  const currentMonth = months[new Date().getMonth()];
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome section - mobile only */}
      <div className="md:hidden px-1">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome Back!</h1>
        {userName && (
          <p className="text-sm text-[var(--text-secondary)]">Hi, {userName}</p>
        )}
      </div>

      {/* Month filter pills */}
      <FilterPills
        options={months}
        selected={selectedMonth}
        onChange={setSelectedMonth}
        size="sm"
      />

      {/* KPI Row - 3 metric cards (matches Images 1, 11) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard
          icon={Wallet}
          label="Revenue"
          value="$24,523"
          change={{ value: '12%', variant: 'positive' }}
          comparison="Compared to ($84,364 last month)"
          onMenuClick={() => {}}
        />
        <KPICard
          icon={TrendingUp}
          label="Total Savings"
          value="$73,635"
          change={{ value: '12%', variant: 'negative' }}
          comparison="Compared to ($29,834 last month)"
          onMenuClick={() => {}}
        />
        <KPICard
          icon={PiggyBank}
          label="Savings Rate"
          value="$4,834"
          change={{ value: '17%', variant: 'positive' }}
          comparison="Compared to ($9,947 last month)"
          onMenuClick={() => {}}
        />
      </div>

      {/* AI Insights Panel (matches Images 6, 10) */}
      <AIInsightsPanel />

      {/* Main Chart - Combined Bar + Line (matches Image 11 Sales Overview) */}
      <ChartCard
        title="Financial Overview"
        filterOptions={['Monthly', 'Quarterly', 'Yearly']}
        selectedFilter="Yearly"
      >
        <div className="h-72 w-full md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)' }}
              />
              <Bar
                dataKey="sales"
                name="Total Sales"
                fill="var(--chart-purple)"
                opacity={0.3}
                radius={[4, 4, 0, 0]}
                barSize={28}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke="var(--chart-orange)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--chart-orange)', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
