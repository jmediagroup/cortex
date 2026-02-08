'use client';

import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Wallet, PiggyBank } from 'lucide-react';
import ChartCard from '@/components/ui/ChartCard';
import KPICard from '@/components/ui/KPICard';

const progressData = [
  { month: 'Jul', income: 22000, savings: 14000 },
  { month: 'Aug', income: 18000, savings: 18000 },
  { month: 'Sep', income: 28000, savings: 16000 },
  { month: 'Oct', income: 32000, savings: 24000 },
  { month: 'Nov', income: 24000, savings: 28000 },
  { month: 'Dec', income: 38000, savings: 22000 },
];

const contacts = [
  { name: 'Hanson Deck', progress: 89.5, color: 'var(--chart-green)' },
  { name: 'Richard Tea', progress: 56.7, color: 'var(--chart-blue)' },
  { name: 'Sarah Park', progress: 72.3, color: 'var(--chart-purple)' },
];

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
      <p className="mb-1 text-xs font-semibold text-[var(--text-secondary)]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-xs text-[var(--text-secondary)]">{entry.name}</span>
          <span className="ml-auto text-xs font-bold text-[var(--text-primary)]">
            ${entry.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ProgressTracking() {
  return (
    <div className="flex flex-col gap-6">
      {/* Contacts with Top Progress (Image 2) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          Accounts with Top Progress
        </h3>
        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
          {contacts.map((contact) => (
            <div
              key={contact.name}
              className="flex min-w-[150px] flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--surface-secondary)] p-3"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-tertiary)] text-xs font-bold text-[var(--text-secondary)]">
                  {contact.name.charAt(0)}
                </div>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {contact.name}
                </span>
              </div>
              <span className="text-xl font-bold text-[var(--text-primary)]">
                {contact.progress}%
              </span>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--surface-tertiary)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${contact.progress}%`,
                    backgroundColor: contact.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Rate by Month - dual line chart (Image 2) */}
      <ChartCard
        title="Progress Rate by Month"
        filterOptions={['Jul-Dec 2024', 'Jan-Jun 2025', 'Jul-Dec 2025']}
        selectedFilter="Jul-Dec 2024"
      >
        <div className="h-64 w-full md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={progressData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
              <Area
                type="monotone"
                dataKey="income"
                name="Net Income"
                fill="var(--chart-purple)"
                fillOpacity={0.08}
                stroke="var(--chart-purple)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--chart-purple)', stroke: '#fff', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="savings"
                name="Net Savings"
                fill="var(--chart-green)"
                fillOpacity={0.08}
                stroke="var(--chart-green)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: 'var(--chart-green)', stroke: '#fff', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Net Income / Net Savings cards (Image 2) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KPICard
          icon={Wallet}
          iconColor="text-[var(--chart-purple)]"
          label="Net Income"
          value="$54,543.56"
        />
        <KPICard
          icon={PiggyBank}
          iconColor="text-[var(--chart-green)]"
          label="Net Savings"
          value="$34,489.00"
        />
      </div>
    </div>
  );
}
