'use client';

import { type ReactNode } from 'react';
import SectionHeader from '../layout/SectionHeader';

interface ChartCardProps {
  title: string;
  filterLabel?: string;
  filterOptions?: string[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  rightElement?: ReactNode;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  filterLabel,
  filterOptions,
  selectedFilter,
  onFilterChange,
  rightElement,
  children,
  className = '',
}: ChartCardProps) {
  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 md:p-6 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <SectionHeader
        title={title}
        filterOptions={filterOptions}
        selectedFilter={selectedFilter}
        onFilterChange={onFilterChange}
        rightElement={rightElement}
      />

      <div className="mt-4 w-full">{children}</div>

      {filterLabel && (
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">{filterLabel}</p>
      )}
    </div>
  );
}
