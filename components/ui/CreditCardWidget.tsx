'use client';

import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface CreditCard {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  bgClass: string;
}

const cards: CreditCard[] = [
  {
    id: '1',
    number: '8364  9375  0930  7302',
    holder: 'Primary Account',
    expiry: '12 / 27',
    bgClass: 'from-slate-800 to-slate-950',
  },
  {
    id: '2',
    number: '4356  1234  2134  0909',
    holder: 'Business Account',
    expiry: '06 / 28',
    bgClass: 'from-[var(--primary-600)] to-[var(--primary-900)]',
  },
  {
    id: '3',
    number: '5521  8832  1100  4467',
    holder: 'Savings Account',
    expiry: '03 / 29',
    bgClass: 'from-emerald-600 to-emerald-900',
  },
];

interface CreditCardWidgetProps {
  className?: string;
}

export default function CreditCardWidget({ className = '' }: CreditCardWidgetProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (index: number) => {
    if (index < 0) setActiveIndex(cards.length - 1);
    else if (index >= cards.length) setActiveIndex(0);
    else setActiveIndex(index);
  };

  const card = cards[activeIndex];

  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">My Cards</h3>
        <button
          className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-secondary)]"
          aria-label="More options"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Card display */}
      <div className="relative">
        <div
          className={`relative overflow-hidden rounded-[var(--radius-xl)] bg-gradient-to-br ${card.bgClass} p-5 text-white transition-all duration-300`}
        >
          {/* Chip */}
          <div className="mb-6 flex items-center justify-between">
            <div className="h-8 w-10 rounded-md bg-white/20 backdrop-blur-sm" />
            {/* Add button */}
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
              aria-label="Add new card"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Number */}
          <p className="mb-5 font-mono text-lg tracking-[0.15em]">
            {card.number}
          </p>

          {/* Footer */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide opacity-60">Card Holder</p>
              <p className="text-sm font-semibold">{card.holder}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide opacity-60">Expires</p>
              <p className="text-sm font-semibold">{card.expiry}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel controls */}
      <div className="mt-3 flex items-center justify-center gap-3">
        <button
          onClick={() => goTo(activeIndex - 1)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)]"
          aria-label="Previous card"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? 'w-5 bg-[var(--color-accent)]'
                  : 'w-2 bg-[var(--border-primary)] hover:bg-[var(--text-tertiary)]'
              }`}
              aria-label={`Card ${i + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(activeIndex + 1)}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)]"
          aria-label="Next card"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
