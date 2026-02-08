'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistItem {
  name: string;
  exchange: string;
  value: number;
  change: number;
  changePercent: number;
}

const watchlistData: WatchlistItem[] = [
  { name: 'Clara Group', exchange: 'SFK', value: 54300.43, change: 31.32, changePercent: 1.43 },
  { name: 'Benedict Industries', exchange: 'SFK', value: 90421.54, change: -2.2, changePercent: -2.0 },
  { name: 'Hector Technologist', exchange: 'SFK', value: 15539.32, change: 3.0, changePercent: 0.09 },
  { name: 'Jesse Group', exchange: 'SFK', value: 23849.43, change: 12.45, changePercent: 0.52 },
  { name: 'Meridian Capital', exchange: 'NYSE', value: 67231.10, change: -8.32, changePercent: -0.12 },
  { name: 'Aurora Tech', exchange: 'NASDAQ', value: 41892.67, change: 156.40, changePercent: 3.74 },
];

const formatCurrency = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

export default function Watchlist() {
  return (
    <div
      className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-5"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="mb-4 text-base font-semibold text-[var(--text-primary)]">
        Stocks Watchlist
      </h3>

      <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
        {watchlistData.map((item) => {
          const isPositive = item.change >= 0;
          return (
            <div
              key={item.name}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">{item.name}</p>
                <p className="text-[11px] text-[var(--text-tertiary)]">
                  Listed in {item.exchange}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[var(--text-primary)]">
                  {formatCurrency(item.value)}
                </p>
                <div className="flex items-center justify-end gap-1">
                  {isPositive ? (
                    <TrendingUp size={11} className="text-[var(--color-positive)]" />
                  ) : (
                    <TrendingDown size={11} className="text-[var(--color-negative)]" />
                  )}
                  <span
                    className={`text-[11px] font-semibold ${
                      isPositive ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'
                    }`}
                  >
                    {isPositive ? '+' : ''}{item.change.toFixed(2)} ({item.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
