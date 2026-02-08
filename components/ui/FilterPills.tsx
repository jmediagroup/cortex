'use client';

interface FilterPillsProps {
  options: string[];
  selected: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export default function FilterPills({
  options,
  selected,
  onChange,
  size = 'md',
  className = '',
}: FilterPillsProps) {
  const sizeStyles = size === 'sm'
    ? 'px-3 py-1 text-xs'
    : 'px-4 py-2 text-sm';

  return (
    <div
      className={`flex gap-2 overflow-x-auto scrollbar-none ${className}`}
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
            className={`whitespace-nowrap rounded-full font-medium transition-all duration-200 ${sizeStyles} ${
              isActive
                ? 'bg-[var(--color-accent)] text-[var(--text-inverse)] shadow-sm'
                : 'bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--border-primary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
