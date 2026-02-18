'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Lock,
  Filter,
  Car,
  Calculator,
  TrendingUp,
  TrendingDown,
  Landmark,
  MapPin,
  Compass,
  Wallet,
  BarChart3,
  Dices,
  Anchor,
  Brain,
  type LucideIcon,
} from 'lucide-react';
import { hasAppAccess, type Tier } from '@/lib/access-control';
import { trackEvent } from '@/lib/analytics';
import FilterPills from '@/components/ui/FilterPills';

interface AppConfig {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  tier: 'free' | 'pro';
  sector: 'finance';
  category: string;
  path: string;
}

const APPS: AppConfig[] = [
  {
    id: 'car-affordability',
    name: 'Car Affordability',
    description: 'Calculate how much car you can afford using the 20/3/8 rule.',
    icon: Car,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/car-affordability',
  },
  {
    id: 'compound-interest',
    name: 'Compound Interest Calculator',
    description: 'Visualize long-term wealth accumulation with custom contribution schedules and compound growth.',
    icon: Calculator,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/compound-interest',
  },
  {
    id: 'index-fund-visualizer',
    name: 'Index Fund Growth Visualizer',
    description: 'Simulate historical returns and volatility for popular index ETFs like VOO, VTI, VT, and QQQM.',
    icon: BarChart3,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Investing',
    path: '/apps/index-fund-visualizer',
  },
  {
    id: 's-corp-optimizer',
    name: 'S-Corp Optimizer',
    description: 'Calculate self-employment tax savings and find your ideal salary/distribution split.',
    icon: Calculator,
    iconColor: 'text-[var(--color-warning)]',
    tier: 'free',
    sector: 'finance',
    category: 'Business',
    path: '/apps/s-corp-optimizer',
  },
  {
    id: 's-corp-investment',
    name: 'S-Corp Investment Optimizer',
    description: 'Maximize retirement savings through strategic allocation across employee deferrals and company matching.',
    icon: TrendingUp,
    iconColor: 'text-[var(--color-positive)]',
    tier: 'free',
    sector: 'finance',
    category: 'Business',
    path: '/apps/s-corp-investment',
  },
  {
    id: 'retirement-strategy',
    name: 'Retirement Strategy Engine',
    description: 'Comprehensive simulation of retirement portfolio withdrawals with RMD calculations.',
    icon: TrendingUp,
    iconColor: 'text-purple-500',
    tier: 'free',
    sector: 'finance',
    category: 'Retirement',
    path: '/apps/retirement-strategy',
  },
  {
    id: 'coast-fire',
    name: 'Coast FIRE Calculator',
    description: 'Calculate your Coast FIRE number and discover when you can stop saving for retirement.',
    icon: Anchor,
    iconColor: 'text-[var(--color-positive)]',
    tier: 'free',
    sector: 'finance',
    category: 'Retirement',
    path: '/apps/coast-fire',
  },
  {
    id: 'rent-vs-buy',
    name: 'Rent vs Buy Reality Engine',
    description: 'Compare renting vs buying with real-world factors: opportunity cost, maintenance drag, mobility risk.',
    icon: Landmark,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/rent-vs-buy',
  },
  {
    id: 'debt-paydown',
    name: 'Debt Paydown Strategy Optimizer',
    description: 'Compare avalanche vs snowball vs hybrid debt paydown strategies with opportunity cost analysis.',
    icon: TrendingDown,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/debt-paydown',
  },
  {
    id: 'geographic-arbitrage',
    name: 'Geographic Arbitrage Calculator',
    description: 'Calculate wealth-building potential by comparing income, taxes, and cost of living across U.S. cities.',
    icon: MapPin,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/geographic-arbitrage',
  },
  {
    id: 'net-worth',
    name: 'Net Worth Engine',
    description: 'Track assets and liabilities, analyze liquidity and momentum, visualize your financial trajectory.',
    icon: Compass,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/net-worth',
  },
  {
    id: 'budget',
    name: 'Household Budgeting System',
    description: 'Allocate resources under constraints with AI-powered optimization, tension metrics, and flexibility analysis.',
    icon: Wallet,
    iconColor: 'text-[var(--color-accent)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/budget',
  },
  {
    id: 'gambling-redirect',
    name: 'Gambling Spend Redirect',
    description: 'See the life-changing difference between playing the odds and owning the market.',
    icon: Dices,
    iconColor: 'text-[var(--color-positive)]',
    tier: 'free',
    sector: 'finance',
    category: 'Personal Finance',
    path: '/apps/gambling-redirect',
  },
];

interface AppLibraryProps {
  userTier: Tier;
  appOrder?: string[] | null;
}

export default function AppLibrary({ userTier, appOrder }: AppLibraryProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(APPS.map((app) => app.category)))];

  // Reorder apps if personalized order provided
  const orderedApps = appOrder
    ? [...APPS].sort((a, b) => {
        const aIdx = appOrder.indexOf(a.id);
        const bIdx = appOrder.indexOf(b.id);
        const aPos = aIdx === -1 ? Infinity : aIdx;
        const bPos = bIdx === -1 ? Infinity : bIdx;
        return aPos - bPos;
      })
    : APPS;

  const filteredApps =
    selectedCategory === 'All'
      ? orderedApps
      : orderedApps.filter((app) => app.category === selectedCategory);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight md:text-3xl">
          App Library
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)] md:text-base">
          Select a tool to begin your financial analysis.
        </p>
      </div>

      {/* Category Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-[var(--text-secondary)]">
          <Filter size={16} />
          <span className="text-xs font-bold uppercase tracking-wide">Filter:</span>
        </div>
        <FilterPills
          options={categories}
          selected={selectedCategory}
          onChange={setSelectedCategory}
          size="sm"
        />
      </div>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredApps.map((app) => {
          const isLocked = !hasAppAccess(app, userTier);
          const Icon = app.icon;

          return (
            <div
              key={app.id}
              onClick={() => {
                if (!isLocked) {
                  trackEvent('app_opened', {
                    app_name: app.name,
                    app_id: app.id,
                    app_category: app.category,
                  });
                  router.push(app.path);
                }
              }}
              className={`group relative flex flex-col rounded-[var(--radius-2xl)] border border-[var(--border-primary)] bg-[var(--surface-primary)] p-6 transition-all duration-300 ${
                isLocked
                  ? 'cursor-default opacity-70 grayscale-[0.3]'
                  : 'cursor-pointer hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]'
              }`}
              style={{ boxShadow: 'var(--shadow-card)' }}
            >
              {/* Tier badge */}
              <span
                className={`absolute right-4 top-4 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  app.tier === 'pro'
                    ? 'bg-purple-500/10 text-purple-500 ring-1 ring-purple-500/20'
                    : 'bg-[var(--surface-tertiary)] text-[var(--text-tertiary)]'
                }`}
              >
                {app.tier === 'pro' ? 'Pro' : 'Free'}
              </span>

              <div className="mb-4">
                <div
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] transition-colors ${
                    isLocked
                      ? 'bg-[var(--surface-tertiary)]'
                      : 'bg-[var(--color-accent-light)] group-hover:bg-[var(--primary-100)]'
                  }`}
                >
                  <Icon size={22} className={isLocked ? 'text-[var(--text-tertiary)]' : app.iconColor} />
                </div>
              </div>

              <h3 className="mb-2 text-lg font-bold tracking-tight text-[var(--text-primary)]">
                {app.name}
              </h3>
              <p className="mb-5 flex-1 text-sm leading-relaxed text-[var(--text-secondary)]">
                {app.description}
              </p>

              <div className="flex items-center">
                {isLocked ? (
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-tertiary)]">
                    <Lock size={14} />
                    Pro Feature
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--color-accent)] transition-all group-hover:gap-2.5">
                    Launch
                    <ArrowRight size={16} />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upgrade CTA */}
      {userTier !== 'elite' && (
        <div className="mt-6 overflow-hidden rounded-[var(--radius-2xl)] bg-[var(--primary-900)] p-8 text-white shadow-xl md:p-10">
          <div className="absolute right-0 top-0 p-8 opacity-5">
            <Brain size={200} fill="currentColor" />
          </div>
          <div className="relative max-w-xl">
            <span className="mb-4 inline-block rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
              Premium Access
            </span>
            <h3 className="mb-4 text-2xl font-bold tracking-tight md:text-3xl">
              {userTier === 'free'
                ? 'Unlock Pro Financial Tools'
                : 'Upgrade to Elite - All Sectors'}
            </h3>
            <p className="mb-6 text-sm leading-relaxed text-white/80 md:text-base">
              {userTier === 'free'
                ? 'Get access to advanced Finance tools including Roth Conversion optimization, auto-optimize features, and more.'
                : 'Access pro features across ALL current and future sectors.'}
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="rounded-[var(--radius-lg)] bg-white px-6 py-3 text-sm font-bold text-[var(--primary-900)] transition-all hover:scale-105 hover:bg-white/90 active:scale-95"
            >
              Explore Pro Plans
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
