'use client';

import { useMemo, useState } from 'react';
import {
  Coffee,
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';
import { PulseCard } from '@/components/ui/PulseCard';
import { GhostChart } from '@/components/ui/GhostChart';
import { TransactionRow } from '@/components/ui/TransactionRow';
import AppLibrary from '@/components/dashboard/AppLibrary';
import { AIInsightsPanel } from '@/components/ai';
import type { Tier } from '@/lib/access-control';

type Props = {
  userName?: string;
  userTier?: Tier;
  appOrder?: string[] | null;
};

type Kpi = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  caption: string;
};

const KPIS: Kpi[] = [
  {
    label: 'NET WORTH',
    value: '$248,513.02',
    delta: '+$4,218 · 1.72%',
    positive: true,
    caption: 'Up $11,240 this quarter.',
  },
  {
    label: 'SAVINGS RATE',
    value: '31.4%',
    delta: '+1.8 pts',
    positive: true,
    caption: 'Above your 28% target.',
  },
  {
    label: 'COAST FIRE',
    value: 'Age 47',
    delta: '18 yrs to drift',
    positive: true,
    caption: '$124k contributed so far.',
  },
];

type AccountPulse = {
  account: string;
  masked: string;
  balance: number;
  change: number;
  spark: number[];
};

const ACCOUNTS: AccountPulse[] = [
  {
    account: 'Main · Checking',
    masked: '•••• 4281',
    balance: 14820.5,
    change: 2.14,
    spark: [42, 48, 45, 58, 55, 64, 62, 72, 78, 84],
  },
  {
    account: 'High-yield · Savings',
    masked: '•••• 9012',
    balance: 68942.18,
    change: 4.12,
    spark: [62, 64, 68, 70, 74, 78, 82, 86, 90, 94],
  },
  {
    account: 'Index · Brokerage',
    masked: '•••• 3340',
    balance: 164750.34,
    change: -0.92,
    spark: [84, 82, 88, 86, 84, 78, 80, 82, 78, 76],
  },
];

const HIST = [42, 48, 45, 58, 55, 64, 62, 72, 78, 84, 88, 92];
const PRED = [92, 98, 96, 104, 108, 118, 124];

type Txn = {
  title: string;
  meta: string;
  amount: number;
  positive: boolean;
  icon: typeof Coffee;
};

const TRANSACTIONS: Txn[] = [
  { title: 'Biweekly paycheck', meta: 'APR 18 · Direct deposit', amount: 3840.0, positive: true, icon: Wallet },
  { title: 'Monthly transfer to savings', meta: 'APR 18 · Recurring', amount: 1200.0, positive: true, icon: PiggyBank },
  { title: 'Whole Foods Market', meta: 'APR 17 · Groceries', amount: 142.67, positive: false, icon: ShoppingBag },
  { title: 'Blue Bottle Coffee', meta: 'APR 17 · Dining', amount: 5.75, positive: false, icon: Coffee },
  { title: 'Electric utility', meta: 'APR 16 · Bills', amount: 89.24, positive: false, icon: Zap },
];

export default function DashboardHome({ userName, userTier = 'free', appOrder }: Props) {
  const [expanded, setExpanded] = useState<string | null>(ACCOUNTS[0].account);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 5) return 'Good evening';
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 48px' }}>
      {/* Greeting */}
      <header style={{ marginBottom: 32 }}>
        <div
          className="eyebrow"
          style={{ color: 'var(--text-tertiary)', marginBottom: 8 }}
        >
          {greeting.toUpperCase()}
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            margin: 0,
          }}
        >
          {userName ? `Welcome back, ${userName}.` : 'Welcome back.'}
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-tertiary)',
            margin: '8px 0 0',
            lineHeight: 1.55,
          }}
        >
          Here&apos;s the 30-second read on where you stand.
        </p>
      </header>

      {/* KPI strip */}
      <section
        aria-label="Key metrics"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        {KPIS.map((k) => (
          <KpiTile key={k.label} kpi={k} />
        ))}
      </section>

      {/* Pulse cards */}
      <section aria-label="Accounts" style={{ marginBottom: 32 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 16,
          }}
        >
          <div>
            <div
              className="eyebrow"
              style={{ color: 'var(--emerald-500)', marginBottom: 6 }}
            >
              ● ACCOUNTS · LIVE
            </div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              Pulse — every account in one glance.
            </h2>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}
        >
          {ACCOUNTS.map((a) => (
            <PulseCard
              key={a.account}
              account={a.account}
              masked={a.masked}
              balance={a.balance}
              change={a.change}
              spark={a.spark}
              expanded={expanded === a.account}
              onPress={() =>
                setExpanded((prev) => (prev === a.account ? null : a.account))
              }
            />
          ))}
        </div>
      </section>

      {/* Ghost chart + insights */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
          gap: 16,
          marginBottom: 32,
        }}
        className="dashboard-chart-grid"
      >
        <div
          style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'var(--glass-blur)',
            WebkitBackdropFilter: 'var(--glass-blur)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 24,
            boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <div
              className="eyebrow"
              style={{ color: 'var(--text-tertiary)', marginBottom: 6 }}
            >
              12-MONTH TRAJECTORY
            </div>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: '-0.01em',
                margin: 0,
              }}
            >
              Historical <span style={{ color: 'var(--text-tertiary)' }}>+ forecast</span>.
            </h2>
            <p
              style={{
                fontSize: 12,
                color: 'var(--text-muted)',
                margin: '4px 0 0',
                fontFamily: 'var(--font-mono)',
              }}
            >
              Emerald = realized · Cyan = projected.
            </p>
          </div>
          <div style={{ height: 200 }}>
            <GhostChart
              historical={HIST}
              predicted={PRED}
              width={640}
              height={200}
              label="Net worth over 12 months with a 7-month forecast"
            />
          </div>
          <p
            style={{
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: '20px 0 0',
              paddingTop: 16,
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            Most people see the monthly balance.{' '}
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              You just saw the 12-month trajectory.
            </span>
          </p>
        </div>

        <AIInsightsPanel />
      </section>

      {/* Recent transactions */}
      <section
        aria-label="Recent transactions"
        style={{
          background: 'var(--bg-glass)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '16px 0 4px',
          marginBottom: 32,
          boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            padding: '0 18px 12px',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div>
            <div
              className="eyebrow"
              style={{ color: 'var(--text-tertiary)', marginBottom: 6 }}
            >
              RECENT
            </div>
            <h2
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.01em',
              }}
            >
              Transactions this week.
            </h2>
          </div>
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Demo data · coming soon
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {TRANSACTIONS.map((t) => (
            <TransactionRow
              key={t.title + t.meta}
              title={t.title}
              meta={t.meta}
              amount={t.amount}
              positive={t.positive}
              icon={t.icon}
            />
          ))}
        </div>
      </section>

      {/* App library */}
      <section>
        <div style={{ marginBottom: 16 }}>
          <div
            className="eyebrow"
            style={{ color: 'var(--text-tertiary)', marginBottom: 6 }}
          >
            CORTEX FINANCE
          </div>
          <h2
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.01em',
            }}
          >
            Open a tool.
          </h2>
        </div>
        <AppLibrary userTier={userTier} appOrder={appOrder ?? null} />
      </section>
    </div>
  );
}

function KpiTile({ kpi }: { kpi: Kpi }) {
  const Trend = kpi.positive ? TrendingUp : TrendingUp;
  const color = kpi.positive ? 'var(--emerald-500)' : 'var(--crimson-500)';
  return (
    <div
      style={{
        background: 'var(--bg-glass)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-xl)',
        padding: 20,
        boxShadow: 'var(--shadow-card), var(--shadow-inset-top)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div className="eyebrow" style={{ color: 'var(--text-tertiary)' }}>
          {kpi.label}
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            color,
            fontSize: 11,
            fontWeight: 600,
            fontFamily: 'var(--font-mono)',
            padding: '3px 8px',
            borderRadius: 9999,
            background: kpi.positive ? 'var(--emerald-tint-soft)' : 'var(--crimson-tint)',
            border: `1px solid ${kpi.positive ? 'var(--emerald-border-soft)' : 'var(--crimson-border)'}`,
          }}
        >
          <Trend size={11} />
          {kpi.delta}
        </span>
      </div>
      <div
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 28,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.025em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {kpi.value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{kpi.caption}</div>
    </div>
  );
}
