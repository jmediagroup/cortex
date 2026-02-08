'use client';

interface TimeRangeSelectorProps {
  options?: string[];
  selected: string;
  onChange: (value: string) => void;
  className?: string;
}

const defaultOptions = ['1D', '1W', '1M', '3M', '1Y', 'All'];

export default function TimeRangeSelector({
  options = defaultOptions,
  selected,
  onChange,
  className = '',
}: TimeRangeSelectorProps) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-[var(--surface-tertiary)] p-1 ${className}`}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option === selected;
        return (
          <button
            key={option}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              isActive
                ? 'bg-[var(--color-accent)] text-[var(--text-inverse)] shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
