'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MarketingIcon, type MarketingIconName } from './Icons';

export type MarketingTool = {
  icon: MarketingIconName;
  title: string;
  desc: string;
  href: string;
  tag?: 'FREE' | 'PRO';
  featured?: boolean;
};

export const DEFAULT_TOOLS: MarketingTool[] = [
  {
    icon: 'calculator',
    title: 'Compound Interest Calculator',
    desc: 'See how your money grows over time with different contribution strategies and rates.',
    href: '/apps/compound-interest',
    tag: 'FREE',
  },
  {
    icon: 'barChart',
    title: 'Index Fund Growth Visualizer',
    desc: 'Simulate historical returns and volatility for popular index ETFs like VOO, VTI, VT, and QQQM.',
    href: '/apps/index-fund-visualizer',
    tag: 'FREE',
  },
  {
    icon: 'wallet',
    title: 'Household Budgeting System',
    desc: 'Allocate resources under constraints with AI-powered optimization and flexibility analysis.',
    href: '/apps/budget',
    tag: 'FREE',
  },
  {
    icon: 'dices',
    title: 'Gambling Spend Redirect',
    desc: 'See the wealth gap between playing the odds and owning the market. Redirect toward real wealth.',
    href: '/apps/gambling-redirect',
    tag: 'FREE',
  },
  {
    icon: 'trendUp',
    title: 'Retirement Strategy Engine',
    desc: 'Decumulation planning with Roth conversions, tax optimization, and sequence risk analysis.',
    href: '/apps/retirement-strategy',
    tag: 'PRO',
    featured: true,
  },
  {
    icon: 'anchor',
    title: 'Coast FIRE Calculator',
    desc: 'Find out if your current savings will grow to your retirement number on their own — no more contributions needed.',
    href: '/apps/coast-fire',
    tag: 'FREE',
  },
  {
    icon: 'compass',
    title: 'Net Worth Engine',
    desc: 'Track assets and liabilities, analyze liquidity, and visualize your financial trajectory.',
    href: '/apps/net-worth',
    tag: 'PRO',
    featured: true,
  },
  {
    icon: 'landmark',
    title: 'Rent vs Buy Reality Engine',
    desc: 'Compare renting vs buying with opportunity cost, maintenance drag, and tax treatment.',
    href: '/apps/rent-vs-buy',
    tag: 'PRO',
  },
  {
    icon: 'trendDown',
    title: 'Debt Paydown Optimizer',
    desc: 'Compare avalanche vs snowball strategies with psychological weighting and opportunity cost.',
    href: '/apps/debt-paydown',
    tag: 'PRO',
  },
  {
    icon: 'mapPin',
    title: 'Geographic Arbitrage',
    desc: 'Calculate wealth-building potential by comparing income, taxes, and cost of living across all 50 states.',
    href: '/apps/geographic-arbitrage',
    tag: 'PRO',
  },
  {
    icon: 'building',
    title: 'S-Corp Investment Optimizer',
    desc: 'Maximize retirement contributions while optimizing your S-Corp owner compensation.',
    href: '/apps/s-corp-investment',
    tag: 'PRO',
  },
  {
    icon: 'scale',
    title: 'S-Corp Optimizer',
    desc: 'Calculate self-employment tax savings and find your ideal salary/distribution split.',
    href: '/apps/s-corp-optimizer',
    tag: 'PRO',
  },
  {
    icon: 'landmark',
    title: 'Capital Gains Tax Estimator',
    desc: 'See how much stock you can sell before each tax cliff — models the 0/15/20% brackets, NIIT, IRMAA, ACA, and Virginia tax for 2026.',
    href: '/apps/capital-gains-tax',
    tag: 'FREE',
  },
  {
    icon: 'car',
    title: 'Car Affordability Calculator',
    desc: 'Understand the true cost of vehicle ownership including depreciation and opportunity cost.',
    href: '/apps/car-affordability',
    tag: 'PRO',
  },
  {
    icon: 'brain',
    title: 'Financial Personality Quiz',
    desc: 'Map your money instincts to one of six investor archetypes — from patient Accumulator to high-conviction Visionary.',
    href: '/apps/personality-quiz',
    tag: 'FREE',
  },
];

function ToolCard({ tool }: { tool: MarketingTool }) {
  const [hover, setHover] = useState(false);
  const isFree = tool.tag === 'FREE';
  const isPro = tool.tag === 'PRO';
  return (
    <Link
      href={tool.href}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        display: 'block',
        textDecoration: 'none',
        background: hover ? 'var(--bg-glass-strong)' : 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: `1px solid ${hover ? 'var(--glass-border-strong)' : 'var(--glass-border)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: 24,
        boxShadow: hover
          ? 'var(--shadow-card-hover), var(--shadow-inset-top)'
          : 'var(--shadow-card), var(--shadow-inset-top)',
        transform: hover ? 'translateY(-3px)' : 'none',
        transition:
          'transform 320ms var(--ease-out-expo), background 160ms, border-color 160ms, box-shadow 320ms',
      }}
    >
      {tool.featured && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: -1,
            borderRadius: 'var(--radius-xl)',
            background:
              'linear-gradient(135deg, var(--emerald-border), transparent 40%)',
            opacity: hover ? 0.6 : 0.3,
            pointerEvents: 'none',
            zIndex: -1,
            filter: 'blur(8px)',
            transition: 'opacity 200ms',
          }}
        />
      )}

      {tool.tag && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: isFree ? 'var(--emerald-500)' : 'var(--text-tertiary)',
            padding: '4px 10px',
            borderRadius: 9999,
            background: isFree ? 'var(--emerald-tint-soft)' : 'var(--bg-glass-strong)',
            border: `1px solid ${isFree ? 'var(--emerald-border-soft)' : 'var(--glass-border)'}`,
          }}
        >
          {tool.tag}
        </div>
      )}

      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 'var(--radius-md)',
          background: hover
            ? 'linear-gradient(135deg, var(--emerald-tint), var(--emerald-tint-soft))'
            : 'var(--bg-glass-strong)',
          border: `1px solid ${hover ? 'var(--emerald-border)' : 'var(--glass-border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: hover ? 'var(--emerald-500)' : 'var(--text-secondary)',
          marginBottom: 20,
          transition: 'all 200ms var(--ease-out-quart)',
          boxShadow: hover ? '0 0 20px var(--cta-glow-soft)' : 'none',
        }}
      >
        <MarketingIcon name={tool.icon} size={20} />
      </div>

      <h3
        style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          letterSpacing: '-0.01em',
          paddingRight: isPro ? 56 : 0,
        }}
      >
        {tool.title}
      </h3>
      <p
        style={{
          color: 'var(--text-tertiary)',
          fontSize: 13,
          lineHeight: 1.55,
          margin: '0 0 20px',
        }}
      >
        {tool.desc}
      </p>

      <span
        style={{
          color: hover ? 'var(--emerald-500)' : 'var(--text-secondary)',
          fontWeight: 600,
          fontSize: 12,
          display: 'inline-flex',
          alignItems: 'center',
          gap: hover ? 8 : 6,
          transition: 'all 160ms',
        }}
      >
        Open tool <MarketingIcon name="arrowRight" size={12} />
      </span>
    </Link>
  );
}

export function MarketingToolGrid({ tools = DEFAULT_TOOLS }: { tools?: MarketingTool[] } = {}) {
  return (
    <section
      id="tools"
      style={{
        position: 'relative',
        padding: '120px 24px',
        background: 'var(--bg-page)',
        borderTop: '1px solid var(--border-subtle)',
        scrollMarginTop: 64,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 800,
          height: 300,
          background: 'radial-gradient(ellipse at top, var(--emerald-wash), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
        <div style={{ maxWidth: 640, marginBottom: 64 }}>
          <div
            className="eyebrow"
            style={{ marginBottom: 16, color: 'var(--emerald-500)' }}
          >
            ● CORTEX FINANCE — AVAILABLE NOW
          </div>
          <h2
            style={{
              fontSize: 'clamp(32px,4.5vw,52px)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.025em',
              margin: '0 0 20px',
              lineHeight: 1.1,
            }}
          >
            Fifteen tools.
            <br />
            One mental model.
          </h2>
          <p
            style={{
              fontSize: 17,
              color: 'var(--text-secondary)',
              fontWeight: 400,
              lineHeight: 1.55,
              margin: 0,
              maxWidth: 560,
            }}
          >
            Our first suite focuses on personal and small-business finance — where small decisions compound dramatically over time.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {tools.map((t) => (
            <ToolCard key={t.href} tool={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
