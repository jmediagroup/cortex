'use client';

import { useState, useEffect } from 'react';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';

interface CurrencyExchangeProps {
  className?: string;
}

const exchangeRate = 0.8638; // USD to EUR

export default function CurrencyExchange({ className = '' }: CurrencyExchangeProps) {
  const [fromAmount, setFromAmount] = useState('6534');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');

  useEffect(() => {
    const num = parseFloat(fromAmount);
    if (!isNaN(num)) {
      const converted = fromCurrency === 'USD' ? num * exchangeRate : num / exchangeRate;
      setToAmount(converted.toFixed(2));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromCurrency]);

  const handleSwap = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setFromAmount(toAmount);
  };

  const prefix = fromCurrency === 'USD' ? '$' : '\u20ac';
  const toPrefix = toCurrency === 'USD' ? '$' : '\u20ac';

  return (
    <div
      className={`rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 ${className}`}
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Exchange</h3>
        <button className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--text-tertiary)] transition-colors hover:bg-[var(--surface-tertiary)]">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Conversion display */}
      <p className="mb-1 text-xs text-[var(--text-tertiary)]">
        {fromAmount || '0'} {fromCurrency === 'USD' ? 'US Dollar' : 'Euro'} equals
      </p>
      <p className="mb-4 text-xl font-bold text-[var(--text-primary)]">
        {toAmount || '0'} {toCurrency === 'USD' ? 'US Dollar' : 'Euro'}
      </p>

      {/* From field */}
      <div className="mb-2 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2.5">
        <span className="text-sm text-[var(--text-tertiary)]">{prefix}</span>
        <input
          type="text"
          inputMode="decimal"
          value={fromAmount}
          onChange={(e) => setFromAmount(e.target.value.replace(/[^0-9.]/g, ''))}
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none"
          placeholder="0.00"
        />
        <span className="rounded-md bg-[var(--surface-tertiary)] px-2 py-1 text-xs font-bold text-[var(--text-secondary)]">
          {fromCurrency}
        </span>
      </div>

      {/* Swap button */}
      <div className="my-1 flex justify-center">
        <button
          onClick={handleSwap}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border-primary)] bg-[var(--surface-primary)] text-[var(--text-tertiary)] transition-all hover:bg-[var(--surface-tertiary)] hover:text-[var(--color-accent)]"
          aria-label="Swap currencies"
        >
          <ArrowUpDown size={14} />
        </button>
      </div>

      {/* To field */}
      <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border-primary)] bg-[var(--surface-secondary)] px-3 py-2.5">
        <span className="text-sm text-[var(--text-tertiary)]">{toPrefix}</span>
        <input
          type="text"
          value={toAmount}
          readOnly
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-[var(--text-primary)] outline-none"
          placeholder="0.00"
        />
        <span className="rounded-md bg-[var(--surface-tertiary)] px-2 py-1 text-xs font-bold text-[var(--text-secondary)]">
          {toCurrency}
        </span>
      </div>

      {/* Exchange button */}
      <button className="flex w-full items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-600)]">
        <ArrowUpDown size={14} />
        Exchange Money
      </button>
    </div>
  );
}
