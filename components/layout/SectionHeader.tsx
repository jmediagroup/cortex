'use client';

import { ChevronDown } from 'lucide-react';
import { type ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  filterOptions?: string[];
  selectedFilter?: string;
  onFilterChange?: (value: string) => void;
  rightElement?: ReactNode;
  className?: string;
}

export default function SectionHeader({
  title,
  filterOptions,
  selectedFilter,
  onFilterChange,
  rightElement,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>

      <div className="flex items-center gap-2">
        {filterOptions && filterOptions.length > 0 && (
          <div className="relative">
            <select
              value={selectedFilter}
              onChange={(e) => onFilterChange?.(e.target.value)}
              className="appearance-none rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-primary)] py-1.5 pl-3 pr-8 text-sm font-medium text-[var(--text-primary)] transition-colors hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            >
              {filterOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]"
            />
          </div>
        )}
        {rightElement}
      </div>
    </div>
  );
}
