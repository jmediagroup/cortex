'use client';

import { Coins, TrendingUp, type LucideIcon } from 'lucide-react';
import Badge from '@/components/ui/Badge';

interface Asset {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  name: string;
  exchange: string;
  value: number;
  change: number;
  changePercent: number;
}

const assets: Asset[] = [
  {
    icon: Coins,
    iconBg: 'bg-[var(--color-accent-light)]',
    iconColor: 'text-[var(--color-accent)]',
    name: 'Mutual Funds',
    exchange: 'NSE',
    value: 67987.32,
    change: 231.32,
    changePercent: 2.43,
  },
  {
    icon: TrendingUp,
    iconBg: 'bg-[var(--color-positive-light)]',
    iconColor: 'text-[var(--color-positive)]',
    name: 'Interest',
    exchange: 'Total Earned',
    value: 98234.21,
    change: 128.98,
    changePercent: 0.43,
  },
];

const formatCurrency = (value: number) =>
  value.toLocaleString('en-US', { minimumFractionDigits: 2 });

export default function AssetCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {assets.map((asset) => {
        const Icon = asset.icon;
        const isPositive = asset.change >= 0;
        return (
          <div
            key={asset.name}
            className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4"
            style={{ boxShadow: 'var(--shadow-card)' }}
          >
            <div className="mb-3 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] ${asset.iconBg} ${asset.iconColor}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">{asset.name}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">{asset.exchange}</p>
              </div>
            </div>

            <p className="text-xl font-bold text-[var(--text-primary)]">
              {formatCurrency(asset.value)}
            </p>

            <div className="mt-2">
              <Badge
                value={`+${asset.change.toFixed(2)} (${asset.changePercent.toFixed(2)}%)`}
                variant={isPositive ? 'positive' : 'negative'}
                size="md"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
