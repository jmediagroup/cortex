"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Area
} from 'recharts';
import {
  TrendingUp,
  Info,
  DollarSign,
  Calendar,
  BarChart3,
  ShieldCheck,
  Globe,
  Zap,
  ArrowRight,
  RefreshCw,
  Lock,
  Target,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import Tooltip from '@/components/ui/Tooltip';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';
import ProGatedPreview from '@/components/monetization/ProGatedPreview';

interface IndexFundVisualizerProps {
  isPro?: boolean;
  onUpgrade?: () => void;
  isLoggedIn?: boolean;
  initialValues?: Record<string, unknown>;
}

// Historical data approximations based on 10-20 year rolling averages
const FUND_METADATA = {
  'VOO_IVV': {
    name: 'S&P 500 (VOO / IVV)',
    description: 'Top 500 U.S. companies. The gold standard for U.S. large-cap equity.',
    cagr: 10.5,
    volatility: 15.0,
    color: '#1D8072',
    icon: ShieldCheck,
    expenseRatio: '0.03%'
  },
  'VTI': {
    name: 'Total U.S. Market (VTI)',
    description: 'Includes large, mid, and small-cap U.S. stocks for maximum domestic diversity.',
    cagr: 10.2,
    volatility: 16.0,
    color: '#1D8072',
    icon: BarChart3,
    expenseRatio: '0.03%'
  },
  'VT': {
    name: 'Total World (VT)',
    description: 'Invests in nearly every investable stock in the world across 40+ countries.',
    cagr: 8.5,
    volatility: 14.5,
    color: '#1D8072',
    icon: Globe,
    expenseRatio: '0.07%'
  },
  'QQQM_VUG': {
    name: 'Tech & Growth (QQQM / VUG)',
    description: 'Focuses on high-growth companies, primarily in tech and consumer sectors.',
    cagr: 13.5,
    volatility: 22.0,
    color: '#FFB800',
    icon: Zap,
    expenseRatio: '0.15% / 0.04%'
  }
} as const;

type FundKey = keyof typeof FUND_METADATA;

export default function IndexFundVisualizer({ isPro = false, onUpgrade, isLoggedIn = false, initialValues }: IndexFundVisualizerProps) {
  const [principal, setPrincipal] = useState(10000);
  const [contribution, setContribution] = useState(1000);
  const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');
  const [duration, setDuration] = useState(25);
  const [selectedFund, setSelectedFund] = useState<FundKey>('VOO_IVV');
  const [showSimulated, setShowSimulated] = useState(true);
  const [seed, setSeed] = useState(0);

  const initialApplied = useRef(false);
  useEffect(() => {
    if (!initialValues || initialApplied.current) return;
    initialApplied.current = true;
    const v = initialValues as Record<string, any>;
    if (v.principal != null) setPrincipal(v.principal);
    if (v.contribution != null) setContribution(v.contribution);
    if (v.frequency != null) setFrequency(v.frequency);
    if (v.duration != null) setDuration(v.duration);
    if (v.selectedFund != null) setSelectedFund(v.selectedFund);
  }, [initialValues]);

  // Formatting helpers
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);

  const formatCompact = (val: number) =>
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1
    }).format(val);

  // Simulation Logic
  const results = useMemo(() => {
    const data = [];
    const fund = FUND_METADATA[selectedFund];
    const annualReturn = fund.cagr / 100;
    const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
    const monthlyContribution = frequency === 'monthly' ? contribution : contribution / 12;

    let currentBalanceSteady = principal;
    let currentBalanceSimulated = principal;
    let totalInvested = principal;

    // Seeded random for reproducible volatility simulation
    const seededRandom = (index: number) => {
      const x = Math.sin(seed * 9999 + index) * 10000;
      return x - Math.floor(x);
    };

    // Normal Distribution helper for Volatility (Box-Muller transform)
    const getRandomReturn = (baseMonthlyReturn: number, annualVol: number, index: number) => {
      const u1 = Math.max(seededRandom(index * 2), 1e-10);
      const u2 = seededRandom(index * 2 + 1);
      const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const monthlyVol = (annualVol / 100) / Math.sqrt(12);
      return baseMonthlyReturn + z * monthlyVol;
    };

    data.push({
      year: 0,
      steady: Math.round(currentBalanceSteady),
      simulated: Math.round(currentBalanceSimulated),
      invested: Math.round(totalInvested)
    });

    for (let month = 1; month <= duration * 12; month++) {
      // Steady Path
      currentBalanceSteady = (currentBalanceSteady + monthlyContribution) * (1 + monthlyReturn);

      // Simulated Path (Volatility)
      const randomRet = getRandomReturn(monthlyReturn, fund.volatility, month);
      currentBalanceSimulated = (currentBalanceSimulated + monthlyContribution) * (1 + randomRet);

      // Floor simulation at 0
      if (currentBalanceSimulated < 0) currentBalanceSimulated = 0;

      totalInvested += monthlyContribution;

      if (month % 12 === 0) {
        data.push({
          year: month / 12,
          steady: Math.round(currentBalanceSteady),
          simulated: Math.round(currentBalanceSimulated),
          invested: Math.round(totalInvested)
        });
      }
    }
    return data;
  }, [principal, contribution, frequency, duration, selectedFund, seed]);

  const finalStats = results[results.length - 1] || { steady: 0, simulated: 0, invested: 0 };
  const totalGains = finalStats.steady - finalStats.invested;

  // PRO FEATURE: Fund Comparison Analysis
  const fundComparison = useMemo(() => {
    if (!isPro) {
      // Sample data for blurred preview
      return [
        { key: 'VOO_SPY', name: 'S&P 500 (VOO/SPY)', cagr: 10.2, volatility: 15.5, finalBalance: 685000, totalContributions: 220000, gains: 465000 },
        { key: 'VT', name: 'Total World (VT)', cagr: 8.5, volatility: 14.2, finalBalance: 520000, totalContributions: 220000, gains: 300000 },
        { key: 'QQQM_VUG', name: 'Growth (QQQM/VUG)', cagr: 12.1, volatility: 19.8, finalBalance: 890000, totalContributions: 220000, gains: 670000 },
      ];
    }

    const comparisons = Object.entries(FUND_METADATA).map(([key, fund]) => {
      const annualReturn = fund.cagr / 100;
      const monthlyReturn = Math.pow(1 + annualReturn, 1/12) - 1;
      const monthlyContrib = frequency === 'monthly' ? contribution : contribution / 12;

      let balance = principal;
      for (let month = 1; month <= duration * 12; month++) {
        balance = (balance + monthlyContrib) * (1 + monthlyReturn);
      }

      return {
        key,
        name: fund.name,
        cagr: fund.cagr,
        volatility: fund.volatility,
        finalBalance: Math.round(balance),
        totalContributions: principal + (monthlyContrib * duration * 12),
        gains: Math.round(balance - (principal + (monthlyContrib * duration * 12)))
      };
    });

    return comparisons.sort((a, b) => b.finalBalance - a.finalBalance);
  }, [isPro, principal, contribution, frequency, duration]);

  // PRO FEATURE: Risk-Adjusted Analysis
  const riskAnalysis = useMemo(() => {
    if (!isPro) {
      // Sample data for blurred preview
      return {
        sharpeRatio: '0.65',
        maxDrawdownEstimate: '38.8',
        worstCase: 411000,
        bestCase: 1027500,
        median: 651750,
        _isPreview: true
      };
    }

    const fund = FUND_METADATA[selectedFund];
    const sharpeRatio = (fund.cagr - 3) / fund.volatility; // Assuming 3% risk-free rate
    const maxDrawdownEstimate = fund.volatility * 2.5; // Rough estimate

    // Monte Carlo percentiles: run seeded random-return paths (same return
    // model as the main chart) and take the 5th/50th/95th percentile of
    // final balances, so the range actually responds to volatility/duration.
    const monthlyReturn = Math.pow(1 + fund.cagr / 100, 1 / 12) - 1;
    const monthlyContrib = frequency === 'monthly' ? contribution : contribution / 12;
    const monthlyVol = (fund.volatility / 100) / Math.sqrt(12);
    const months = Math.max(1, Math.round(duration * 12));

    const rand = (i: number) => {
      const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
      return x - Math.floor(x);
    };

    const NUM_PATHS = 200;
    const finals: number[] = [];
    for (let p = 0; p < NUM_PATHS; p++) {
      let bal = principal;
      for (let m = 1; m <= months; m++) {
        const idx = p * months + m;
        const u1 = Math.max(rand(idx * 2), 1e-10);
        const u2 = rand(idx * 2 + 1);
        const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        bal = (bal + monthlyContrib) * (1 + monthlyReturn + z * monthlyVol);
        if (bal < 0) bal = 0;
      }
      finals.push(bal);
    }
    finals.sort((a, b) => a - b);
    const percentile = (pct: number) => finals[Math.min(finals.length - 1, Math.floor(pct * finals.length))];

    return {
      sharpeRatio: sharpeRatio.toFixed(2),
      maxDrawdownEstimate: maxDrawdownEstimate.toFixed(1),
      worstCase: Math.round(percentile(0.05)),
      bestCase: Math.round(percentile(0.95)),
      median: Math.round(percentile(0.5))
    };
  }, [isPro, selectedFund, principal, contribution, frequency, duration]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="index-fund-visualizer"
          toolName="Index Fund Visualizer"
          getInputs={() => ({ principal, contribution, frequency, duration, selectedFund })}
          getKeyResult={() => `$${principal.toLocaleString()} initial, $${contribution.toLocaleString()}/${frequency}, ${duration}yr`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)] shadow-sm">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Estimated Final Value</p>
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">{formatCurrency(finalStats.steady)}</h4>
          <p className="text-xs font-bold text-[var(--emerald-500)] mt-1">
            {FUND_METADATA[selectedFund].cagr}% CAGR
          </p>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)] shadow-sm">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Net Gains</p>
          <h4 className="text-2xl font-bold text-[var(--emerald-500)]">+{formatCurrency(totalGains)}</h4>
          <p className="text-xs text-[var(--text-muted)] mt-1">From {formatCurrency(finalStats.invested)} invested</p>
        </div>
        <div className="bg-gradient-to-br from-[var(--emerald-700)] to-[var(--emerald-500)] p-6 rounded-3xl shadow-lg text-white">
          <p className="text-[10px] font-bold text-[var(--mist-200)] uppercase tracking-widest mb-1">Simulated Outcome</p>
          <h4 className={`text-2xl font-bold ${finalStats.simulated > finalStats.steady ? 'text-[var(--emerald-400)]' : 'text-[var(--color-warning)]'}`}>
            {formatCurrency(finalStats.simulated)}
          </h4>
          <p className="text-xs text-[var(--mist-200)] mt-1">Includes variance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-default)] shadow-sm space-y-6">

            {/* Fund Selector */}
            <div>
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--emerald-500)]" /> Choose Fund
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {(Object.entries(FUND_METADATA) as [FundKey, typeof FUND_METADATA[FundKey]][]).map(([key, fund]) => {
                  const IconComp = fund.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedFund(key)}
                      className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        selectedFund === key
                        ? 'border-[var(--emerald-border)] bg-[var(--emerald-50)]/50 ring-1 ring-[var(--emerald-500)]'
                        : 'border-[var(--border-default)] hover:border-[var(--border-strong)] bg-[var(--bg-card)]'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedFund === key ? 'bg-[var(--emerald-500)] text-white' : 'bg-[var(--bg-glass)] text-[var(--text-tertiary)]'}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[var(--text-primary)]">{fund.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)] leading-tight mt-1 line-clamp-2">{fund.description}</div>
                        <div className="flex gap-3 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Avg: {fund.cagr}%</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Exp: {fund.expenseRatio}<Tooltip content="Annual fee charged by the fund, expressed as a percentage. Even small differences compound significantly over time." /></span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[var(--border-subtle)]" />

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Initial Principal
                  </label>
                  <span className="text-sm font-mono font-bold text-[var(--emerald-500)]">{formatCurrency(principal)}</span>
                </div>
                <input
                  type="range" min="0" max="100000" step="1000"
                  value={principal} onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Regular Contribution
                  </label>
                  <span className="text-sm font-mono font-bold text-[var(--emerald-500)]">{formatCurrency(contribution)}</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setFrequency('monthly')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-bold border transition-colors ${frequency === 'monthly' ? 'bg-[var(--obsidian-800)] text-white border-[var(--border-strong)]' : 'bg-[var(--bg-card)] text-[var(--text-tertiary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'}`}
                  >Monthly</button>
                  <button
                    onClick={() => setFrequency('annual')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-bold border transition-colors ${frequency === 'annual' ? 'bg-[var(--obsidian-800)] text-white border-[var(--border-strong)]' : 'bg-[var(--bg-card)] text-[var(--text-tertiary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'}`}
                  >Annual</button>
                </div>
                <input
                  type="range" min="0" max="10000" step="100"
                  value={contribution} onChange={(e) => setContribution(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Time Horizon
                  </label>
                  <span className="text-sm font-mono font-bold text-[var(--emerald-500)]">{duration} Years</span>
                </div>
                <input
                  type="range" min="1" max="50" step="1"
                  value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={showSimulated}
                    onChange={() => setShowSimulated(!showSimulated)}
                  />
                  <div className="w-10 h-5 bg-[var(--bg-glass-strong)] rounded-full peer peer-checked:bg-[var(--emerald-500)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--bg-card)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </div>
                <span className="text-sm font-medium text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">Show Market Volatility</span>
              </label>

              {showSimulated && (
                <button
                  onClick={() => setSeed(s => s + 1)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-glass)] rounded-lg hover:bg-[var(--bg-glass-strong)] transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Re-simulate Market Path
                </button>
              )}
            </div>
          </div>

          <div data-theme="dark" className="bg-[var(--obsidian-800)] text-white p-8 rounded-2xl shadow-xl">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-[var(--emerald-400)]" /> Key Insight
            </h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              With {FUND_METADATA[selectedFund].cagr}% average returns and {FUND_METADATA[selectedFund].volatility}% volatility,
              your contributions of {formatCurrency(contribution)}/{frequency === 'monthly' ? 'mo' : 'yr'} could compound
              to {formatCurrency(finalStats.steady)} over {duration} years. That's {finalStats.invested > 0 ? Math.round((totalGains / finalStats.invested) * 100) : 0}% return on invested capital.
            </p>
          </div>
        </aside>

        {/* Chart View */}
        <main className="lg:col-span-8 space-y-6">
          <div className="bg-[var(--bg-card)] p-8 rounded-2xl border border-[var(--border-default)] shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <TrendingUp className="text-[var(--emerald-500)]" /> Growth Forecast
              </h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]"><span className="w-3 h-3 rounded-full bg-[var(--emerald-400)]"></span> Steady</div>
                {showSimulated && <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]"><span className="w-3 h-3 border-2 border-[var(--color-warning)] border-dashed rounded-full"></span> Volatile</div>}
                <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]"><span className="w-3 h-3 rounded-full bg-[var(--bg-glass-strong)]"></span> Invested</div>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSteady" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D8072" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#1D8072" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8E8E93" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8E8E93" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C2C2E" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#8E8E93', fontSize: 11, fontWeight: 'bold'}}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#8E8E93' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCompact(v)}
                    tick={{fill: '#8E8E93', fontSize: 11, fontWeight: 'bold'}}
                  />
                  <ChartTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="steady"
                    stroke="#1D8072"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSteady)"
                  />
                  {showSimulated && (
                    <Line
                      type="monotone"
                      dataKey="simulated"
                      stroke="#FFB800"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                      isAnimationActive={false}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#8E8E93"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights Panel */}
          <div data-theme="dark" className="bg-[var(--obsidian-800)] text-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-[var(--emerald-400)]" />
              <h3 className="font-bold text-lg">Investor Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--text-muted)]">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--emerald-400)]/20 text-[var(--emerald-400)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <p>Total contributions: <span className="text-white font-bold">{formatCurrency(finalStats.invested)}</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--emerald-400)]/20 text-[var(--emerald-400)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <p>Compounding: <span className="text-[var(--emerald-400)] font-bold">{finalStats.steady > 0 ? Math.round((totalGains/finalStats.steady)*100) : 0}%</span> of final wealth.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--emerald-400)]/20 text-[var(--emerald-400)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <p><span className="text-white font-bold">Growth Funds</span> show higher potential but significant risk of years-long drawdown periods.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[var(--emerald-400)]/20 text-[var(--emerald-400)] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                  <p><span className="text-white font-bold">VT (World)</span> provides smoother ride through global diversification but historically lower U.S.-style returns.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-[var(--border-strong)]">
              <div className="text-[10px] text-[var(--text-tertiary)] italic">
                *Historical averages are not indicative of future performance. This tool is for educational purposes only.
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PRO FEATURES SECTION - Locked */}
      {!isPro && (
        <div data-theme="dark" className="bg-gradient-to-br from-[var(--emerald-700)] to-[var(--emerald-500)] rounded-2xl p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-bold">Advanced Fund Analysis</h3>
            </div>
            <p className="text-white/85 text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock professional-grade insights: side-by-side fund comparison, risk-adjusted returns, Monte Carlo projections, and portfolio optimization recommendations.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Target size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Fund Comparison</h4>
                <p className="text-white/85 text-xs font-medium">Compare all major index funds head-to-head with your exact parameters</p>
              </div>
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <AlertTriangle size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Risk Analysis</h4>
                <p className="text-white/85 text-xs font-medium">Sharpe ratios, max drawdown estimates, and volatility-adjusted returns</p>
              </div>
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Sparkles size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Monte Carlo Projections</h4>
                <p className="text-white/85 text-xs font-medium">See best-case, worst-case, and median outcomes across thousands of simulations</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="bg-white text-[var(--emerald-700)] px-8 py-4 rounded-2xl font-bold hover:bg-[var(--emerald-50)] transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              Upgrade to Pro - $9/month
            </button>
          </div>
        </div>
      )}

      {/* PRO FEATURES: Fund Comparison */}
      {fundComparison && (
        <ProGatedPreview isLocked={!isPro} toolId="index-fund-visualizer">
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[var(--emerald-500)] text-white p-3 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Advanced Fund Analysis</h3>
              <p className="text-[var(--text-tertiary)] font-medium">Professional-grade comparison and risk metrics</p>
            </div>
          </div>

          {/* Fund Comparison Table */}
          <div className="bg-[var(--bg-card)] rounded-2xl p-10 border border-[var(--border-default)] shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--emerald-100)] text-[var(--emerald-500)] p-3 rounded-2xl">
                <Target size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Head-to-Head Comparison</h4>
                <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed mb-6">
                  With your settings ({formatCurrency(principal)} initial + {formatCurrency(contribution)}/{frequency === 'monthly' ? 'mo' : 'yr'} for {duration} years):
                </p>
                <div className="space-y-4">
                  {fundComparison.map((fund, index) => (
                    <div
                      key={fund.key}
                      className={`flex items-center gap-4 p-4 rounded-2xl border ${fund.key === selectedFund ? 'border-[var(--emerald-border)] bg-[var(--emerald-50)]' : 'border-[var(--border-default)] bg-[var(--bg-section)]'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-[var(--emerald-500)] text-white' : 'bg-[var(--bg-glass-strong)] text-[var(--text-secondary)]'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-[var(--text-primary)]">{fund.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)]">CAGR: {fund.cagr}% | Volatility: {fund.volatility}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-[var(--text-primary)]">{formatCurrency(fund.finalBalance)}</div>
                        <div className="text-xs text-[var(--emerald-500)] font-bold">+{formatCurrency(fund.gains)} gains</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          {riskAnalysis && (
            <div data-theme="dark" className="bg-gradient-to-br from-[var(--emerald-700)] to-[var(--emerald-500)] rounded-2xl p-10 text-white shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[var(--bg-card)]/20 p-3 rounded-2xl backdrop-blur-sm">
                  <AlertTriangle size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold mb-3">Risk-Adjusted Analysis</h4>
                  <p className="text-[var(--mist-50)] font-medium text-lg leading-relaxed mb-6">
                    Understanding risk is just as important as understanding returns.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <p className="text-[var(--mist-100)] text-sm font-bold mb-2">Sharpe Ratio</p>
                      <p className="text-4xl font-bold">{riskAnalysis.sharpeRatio}</p>
                      <p className="text-[var(--mist-100)] text-xs font-medium mt-2">
                        {parseFloat(riskAnalysis.sharpeRatio) > 0.5 ? 'Good risk-adjusted returns' : 'Moderate risk-adjusted returns'}
                      </p>
                    </div>
                    <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <p className="text-[var(--mist-100)] text-sm font-bold mb-2">Est. Max Drawdown</p>
                      <p className="text-4xl font-bold">-{riskAnalysis.maxDrawdownEstimate}%</p>
                      <p className="text-[var(--mist-100)] text-xs font-medium mt-2">
                        Potential peak-to-trough decline
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-sm font-bold text-[var(--mist-100)] mb-4">MONTE CARLO PROJECTION RANGE</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-[var(--mist-200)] font-bold mb-1">Worst Case (5th %ile)</p>
                    <p className="text-2xl font-bold text-[var(--crimson-400)]">{formatCurrency(riskAnalysis.worstCase)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--mist-200)] font-bold mb-1">Median (50th %ile)</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(riskAnalysis.median)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--mist-200)] font-bold mb-1">Best Case (95th %ile)</p>
                    <p className="text-2xl font-bold text-[var(--emerald-400)]">{formatCurrency(riskAnalysis.bestCase)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MUTANT Recommendation */}
          <div className="bg-[var(--obsidian-900)] rounded-2xl p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[var(--color-warning)]" />
              <h4 className="font-bold text-lg">MUTANT Recommendation</h4>
            </div>
            <p className="text-[var(--text-muted)] font-medium leading-relaxed">
              Based on your {duration}-year time horizon and {formatCurrency(contribution)}/{frequency === 'monthly' ? 'month' : 'year'} contribution capacity,
              {selectedFund === 'QQQM_VUG' ? (
                <span> consider the higher volatility of growth funds. While they offer greater upside, a 30%+ drawdown can test your resolve. Ensure you can stay invested during downturns.</span>
              ) : selectedFund === 'VT' ? (
                <span> global diversification reduces single-country risk but historically trails U.S.-focused funds. Best for those prioritizing stability over maximum growth.</span>
              ) : (
                <span> the S&P 500 remains the benchmark for U.S. large-cap investing. Low costs, broad diversification, and a proven track record make it a solid core holding.</span>
              )}
            </p>
          </div>
        </div>
        </ProGatedPreview>
      )}
      {!isPro && <ProUpsellCard toolId="index-fund-visualizer" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
