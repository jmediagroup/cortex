'use client';

import {
  Zap,
  Film,
  MoreHorizontal,
  Briefcase,
  Mail,
  Home,
  Smartphone,
} from 'lucide-react';
import { DonutChart } from '@/components/charts';
import CategoryCard from '@/components/ui/CategoryCard';

const spendingData = [
  { name: 'Entertainment', value: 1455.43, color: 'var(--chart-purple)' },
  { name: 'Utilities', value: 1234.0, color: 'var(--chart-green)' },
  { name: 'Other', value: 2134.10, color: 'var(--chart-blue)' },
];

const incomeChannels = [
  {
    icon: Briefcase,
    label: 'Portfolio',
    value: '$30,983.43',
    sublabel: 'Total Generated',
    iconBg: 'bg-[var(--color-accent-light)]',
    iconColor: 'text-[var(--color-accent)]',
  },
  {
    icon: Mail,
    label: 'Mail Software',
    value: '$21,455.43',
    sublabel: 'Total Generated',
    iconBg: 'bg-[var(--color-accent-light)]',
    iconColor: 'text-[var(--color-accent)]',
  },
  {
    icon: Home,
    label: 'Real Estate',
    value: '$14,230.00',
    sublabel: 'Total Generated',
    iconBg: 'bg-[var(--color-positive-light)]',
    iconColor: 'text-[var(--color-positive)]',
  },
  {
    icon: Smartphone,
    label: 'Mobile Apps',
    value: '$8,921.55',
    sublabel: 'Total Generated',
    iconBg: 'bg-[var(--color-info-light)]',
    iconColor: 'text-[var(--color-info)]',
  },
];

export default function SpendingAnalytics() {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Spending Categories (Image 5) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          Top Spending Categories
        </h3>

        {/* Category labels around donut */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2">
            <span className="text-xs text-[var(--text-secondary)]">Utilities</span>
            <p className="text-lg font-bold text-[var(--text-primary)]">$1,234.00</p>
          </div>
          <div className="flex-1" />
          <div className="rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2">
            <span className="text-xs text-[var(--text-secondary)]">Other</span>
            <p className="text-lg font-bold text-[var(--text-primary)]">$2,134.10</p>
          </div>
        </div>

        <DonutChart data={spendingData} innerRadius={55} outerRadius={95} />

        <div className="mt-2 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2 text-center">
          <span className="text-xs text-[var(--text-secondary)]">Entertainment</span>
          <p className="text-lg font-bold text-[var(--text-primary)]">$1,455.43</p>
        </div>
      </div>

      {/* Top Income Channels (Image 5) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
          Top Income Channels
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {incomeChannels.map((channel) => (
            <div
              key={channel.label}
              className="flex flex-col gap-2 rounded-[var(--radius-lg)] border border-[var(--border-secondary)] bg-[var(--surface-secondary)] p-3"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] ${channel.iconBg} ${channel.iconColor}`}>
                <channel.icon size={18} />
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">{channel.label}</span>
              <span className="text-lg font-bold text-[var(--text-primary)]">{channel.value}</span>
              <span className="text-[10px] uppercase tracking-wide text-[var(--text-tertiary)]">
                {channel.sublabel}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
