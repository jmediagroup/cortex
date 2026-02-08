'use client';

import { useState } from 'react';
import {
  Scissors,
  IceCream2,
  User,
  Receipt,
  CreditCard,
  ShoppingCart,
  Coffee,
  Fuel,
  Calendar,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import TransactionItem from '@/components/ui/TransactionItem';
import SectionHeader from '@/components/layout/SectionHeader';

interface Transaction {
  id: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  timestamp: string;
  amount: number;
  category: string;
}

const transactions: Transaction[] = [
  {
    id: '1',
    icon: Scissors,
    iconBg: 'bg-[var(--color-accent-light)]',
    iconColor: 'text-[var(--color-accent)]',
    title: 'Go To The Salon For A Haircut',
    timestamp: '21:46',
    amount: -15.23,
    category: 'Personal Care',
  },
  {
    id: '2',
    icon: IceCream2,
    iconBg: 'bg-[var(--color-positive-light)]',
    iconColor: 'text-[var(--color-positive)]',
    title: 'Pay the Ice Cream Bill at the Downtown Cafe',
    timestamp: '17:14',
    amount: -125.46,
    category: 'Food & Drinks',
  },
  {
    id: '3',
    icon: User,
    iconBg: 'bg-[var(--color-info-light)]',
    iconColor: 'text-[var(--color-info)]',
    title: 'Nicole Foster',
    timestamp: '11:20',
    amount: 89.31,
    category: 'Transfer',
  },
  {
    id: '4',
    icon: Receipt,
    iconBg: 'bg-[var(--color-warning-light)]',
    iconColor: 'text-[var(--color-warning)]',
    title: 'Pay Bills Play Happy at the Nitro Shop',
    timestamp: '8:58',
    amount: -98.25,
    category: 'Shopping',
  },
  {
    id: '5',
    icon: CreditCard,
    iconBg: 'bg-[var(--color-accent-light)]',
    iconColor: 'text-[var(--color-accent)]',
    title: 'Monthly Subscription - Cloud Storage',
    timestamp: 'Yesterday',
    amount: -14.99,
    category: 'Subscriptions',
  },
  {
    id: '6',
    icon: ShoppingCart,
    iconBg: 'bg-[var(--color-positive-light)]',
    iconColor: 'text-[var(--color-positive)]',
    title: 'Grocery Run - Whole Foods',
    timestamp: 'Yesterday',
    amount: -87.32,
    category: 'Food & Drinks',
  },
  {
    id: '7',
    icon: User,
    iconBg: 'bg-[var(--color-info-light)]',
    iconColor: 'text-[var(--color-info)]',
    title: 'Client Payment - Web Design Project',
    timestamp: '2 days ago',
    amount: 2450.0,
    category: 'Income',
  },
  {
    id: '8',
    icon: Coffee,
    iconBg: 'bg-[var(--color-warning-light)]',
    iconColor: 'text-[var(--color-warning)]',
    title: 'Morning Coffee - Blue Bottle',
    timestamp: '2 days ago',
    amount: -6.75,
    category: 'Food & Drinks',
  },
  {
    id: '9',
    icon: Fuel,
    iconBg: 'bg-[var(--color-negative-light)]',
    iconColor: 'text-[var(--color-negative)]',
    title: 'Gas Station Fill Up',
    timestamp: '3 days ago',
    amount: -52.40,
    category: 'Transportation',
  },
  {
    id: '10',
    icon: User,
    iconBg: 'bg-[var(--color-positive-light)]',
    iconColor: 'text-[var(--color-positive)]',
    title: 'Salary Deposit',
    timestamp: '3 days ago',
    amount: 4200.0,
    category: 'Income',
  },
];

type SortBy = 'date' | 'amount';
type FilterBy = 'all' | 'income' | 'expense';

export default function TransactionHistory() {
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');

  const filteredTransactions = transactions.filter((t) => {
    if (filterBy === 'income') return t.amount > 0;
    if (filterBy === 'expense') return t.amount < 0;
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'amount') return Math.abs(b.amount) - Math.abs(a.amount);
    return 0; // already in date order
  });

  // Summary stats
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(
    transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
            Total Income
          </p>
          <p className="mt-1 text-xl font-bold text-[var(--color-positive)]">
            +${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
            {transactions.filter((t) => t.amount > 0).length} transactions
          </p>
        </div>
        <div
          className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide">
            Total Expenses
          </p>
          <p className="mt-1 text-xl font-bold text-[var(--color-negative)]">
            -${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-tertiary)]">
            {transactions.filter((t) => t.amount < 0).length} transactions
          </p>
        </div>
      </div>

      {/* Transaction list (Image 11) */}
      <div
        className="rounded-[var(--radius-xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-4 md:p-5"
        style={{ boxShadow: 'var(--shadow-card)' }}
      >
        {/* Header with filters */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Transactions</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy(sortBy === 'date' ? 'amount' : 'date')}
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-tertiary)]"
            >
              <Calendar size={13} className="text-[var(--text-tertiary)]" />
              {sortBy === 'date' ? 'Date' : 'Amount'}
            </button>
            <button
              onClick={() =>
                setFilterBy(
                  filterBy === 'all'
                    ? 'income'
                    : filterBy === 'income'
                      ? 'expense'
                      : 'all'
                )
              }
              className="flex items-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-primary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-tertiary)]"
            >
              <SlidersHorizontal size={13} className="text-[var(--text-tertiary)]" />
              {filterBy === 'all' ? 'All' : filterBy === 'income' ? 'Income' : 'Expenses'}
            </button>
          </div>
        </div>

        {/* Transaction items */}
        <div className="flex flex-col divide-y divide-[var(--border-secondary)]">
          {sortedTransactions.map((txn) => (
            <TransactionItem
              key={txn.id}
              icon={txn.icon}
              iconBgColor={txn.iconBg}
              iconColor={txn.iconColor}
              title={txn.title}
              timestamp={txn.timestamp}
              amount={txn.amount}
            />
          ))}
        </div>

        {/* Load more */}
        <div className="mt-3 flex justify-center">
          <button className="text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--primary-700)]">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
}
