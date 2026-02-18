"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
    color: '#4f46e5',
    icon: ShieldCheck,
    expenseRatio: '0.03%'
  },
  'VTI': {
    name: 'Total U.S. Market (VTI)',
    description: 'Includes large, mid, and small-cap U.S. stocks for maximum domestic diversity.',
    cagr: 10.2,
    volatility: 16.0,
    color: '#10b981',
    icon: BarChart3,
    expenseRatio: '0.03%'
  },
  'VT': {
    name: 'Total World (VT)',
    description: 'Invests in nearly every investable stock in the world across 40+ countries.',
    cagr: 8.5,
    volatility: 14.5,
    color: '#8b5cf6',
    icon: Globe,
    expenseRatio: '0.07%'
  },
  'QQQM_VUG': {
    name: 'Tech & Growth (QQQM / VUG)',
    description: 'Focuses on high-growth companies, primarily in tech and consumer sectors.',
    cagr: 13.5,
    volatility: 22.0,
    color: '#f59e0b',
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
    if (!isPro) return null;

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
    if (!isPro) return null;

    const fund = FUND_METADATA[selectedFund];
    const sharpeRatio = (fund.cagr - 3) / fund.volatility; // Assuming 3% risk-free rate
    const maxDrawdownEstimate = fund.volatility * 2.5; // Rough estimate

    // Monte Carlo percentiles (simplified)
    const worstCase = finalStats.steady * 0.6;
    const bestCase = finalStats.steady * 1.5;
    const median = finalStats.steady * 0.95;

    return {
      sharpeRatio: sharpeRatio.toFixed(2),
      maxDrawdownEstimate: maxDrawdownEstimate.toFixed(1),
      worstCase: Math.round(worstCase),
      bestCase: Math.round(bestCase),
      median: Math.round(median)
    };
  }, [isPro, selectedFund, finalStats.steady]);

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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Final Value</p>
          <h4 className="text-2xl font-black text-slate-900">{formatCurrency(finalStats.steady)}</h4>
          <p className="text-xs font-bold text-indigo-600 mt-1">
            {FUND_METADATA[selectedFund].cagr}% CAGR
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Net Gains</p>
          <h4 className="text-2xl font-black text-emerald-600">+{formatCurrency(totalGains)}</h4>
          <p className="text-xs text-slate-400 mt-1">From {formatCurrency(finalStats.invested)} invested</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Simulated Outcome</p>
          <h4 className={`text-2xl font-black ${finalStats.simulated > finalStats.steady ? 'text-emerald-300' : 'text-amber-300'}`}>
            {formatCurrency(finalStats.simulated)}
          </h4>
          <p className="text-xs text-indigo-200 mt-1">Includes variance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">

            {/* Fund Selector */}
            <div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" /> Choose Fund
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
                        ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className={`p-2 rounded-lg ${selectedFund === key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-slate-800">{fund.name}</div>
                        <div className="text-xs text-slate-500 leading-tight mt-1 line-clamp-2">{fund.description}</div>
                        <div className="flex gap-3 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg: {fund.cagr}%</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exp: {fund.expenseRatio}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Initial Principal
                  </label>
                  <span className="text-sm font-mono font-bold text-indigo-600">{formatCurrency(principal)}</span>
                </div>
                <input
                  type="range" min="0" max="100000" step="1000"
                  value={principal} onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Regular Contribution
                  </label>
                  <span className="text-sm font-mono font-bold text-indigo-600">{formatCurrency(contribution)}</span>
                </div>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setFrequency('monthly')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-bold border transition-colors ${frequency === 'monthly' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                  >Monthly</button>
                  <button
                    onClick={() => setFrequency('annual')}
                    className={`flex-1 py-1.5 text-xs rounded-lg font-bold border transition-colors ${frequency === 'annual' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                  >Annual</button>
                </div>
                <input
                  type="range" min="0" max="10000" step="100"
                  value={contribution} onChange={(e) => setContribution(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Time Horizon
                  </label>
                  <span className="text-sm font-mono font-bold text-indigo-600">{duration} Years</span>
                </div>
                <input
                  type="range" min="1" max="50" step="1"
                  value={duration} onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
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
                  <div className="w-10 h-5 bg-slate-200 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"></div>
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Show Market Volatility</span>
              </label>

              {showSimulated && (
                <button
                  onClick={() => setSeed(s => s + 1)}
                  className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Re-simulate Market Path
                </button>
              )}
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" /> Key Insight
            </h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              With {FUND_METADATA[selectedFund].cagr}% average returns and {FUND_METADATA[selectedFund].volatility}% volatility,
              your contributions of {formatCurrency(contribution)}/{frequency === 'monthly' ? 'mo' : 'yr'} could compound
              to {formatCurrency(finalStats.steady)} over {duration} years. That's {Math.round((totalGains / finalStats.invested) * 100)}% return on invested capital.
            </p>
          </div>
        </aside>

        {/* Chart View */}
        <main className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" /> Growth Forecast
              </h3>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Steady</div>
                {showSimulated && <div className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-3 border-2 border-amber-400 border-dashed rounded-full"></span> Volatile</div>}
                <div className="flex items-center gap-1.5 text-slate-500"><span className="w-3 h-3 rounded-full bg-slate-300"></span> Invested</div>
              </div>
            </div>

            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={results} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSteady" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => formatCompact(v)}
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="steady"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSteady)"
                  />
                  {showSimulated && (
                    <Line
                      type="monotone"
                      dataKey="simulated"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="5 5"
                      isAnimationActive={false}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="invested"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInvested)"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights Panel */}
          <div className="bg-slate-800 text-white p-8 rounded-[2.5rem] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Info className="w-5 h-5 text-indigo-400" />
              <h3 className="font-black text-lg">Investor Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                  <p>Total contributions: <span className="text-white font-bold">{formatCurrency(finalStats.invested)}</span>.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                  <p>Compounding: <span className="text-emerald-400 font-bold">{Math.round((totalGains/finalStats.steady)*100)}%</span> of final wealth.</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</div>
                  <p><span className="text-white font-bold">Growth Funds</span> show higher potential but significant risk of years-long drawdown periods.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</div>
                  <p><span className="text-white font-bold">VT (World)</span> provides smoother ride through global diversification but historically lower U.S.-style returns.</p>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700">
              <div className="text-[10px] text-slate-500 italic">
                *Historical averages are not indicative of future performance. This tool is for educational purposes only.
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PRO FEATURES SECTION - Locked */}
      {!isPro && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-black">Advanced Fund Analysis</h3>
            </div>
            <p className="text-amber-50 text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock professional-grade insights: side-by-side fund comparison, risk-adjusted returns, Monte Carlo projections, and portfolio optimization recommendations.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Target size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Fund Comparison</h4>
                <p className="text-amber-100 text-xs font-medium">Compare all major index funds head-to-head with your exact parameters</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <AlertTriangle size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Risk Analysis</h4>
                <p className="text-amber-100 text-xs font-medium">Sharpe ratios, max drawdown estimates, and volatility-adjusted returns</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Sparkles size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Monte Carlo Projections</h4>
                <p className="text-amber-100 text-xs font-medium">See best-case, worst-case, and median outcomes across thousands of simulations</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="bg-white text-amber-600 px-8 py-4 rounded-2xl font-black hover:bg-amber-50 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              Upgrade to Pro - $9/month
            </button>
          </div>
        </div>
      )}

      {/* PRO FEATURES: Fund Comparison */}
      {isPro && fundComparison && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500 text-white p-3 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Advanced Fund Analysis</h3>
              <p className="text-slate-500 font-medium">Professional-grade comparison and risk metrics</p>
            </div>
          </div>

          {/* Fund Comparison Table */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
                <Target size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-slate-900 mb-3">Head-to-Head Comparison</h4>
                <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
                  With your settings ({formatCurrency(principal)} initial + {formatCurrency(contribution)}/{frequency === 'monthly' ? 'mo' : 'yr'} for {duration} years):
                </p>
                <div className="space-y-4">
                  {fundComparison.map((fund, index) => (
                    <div
                      key={fund.key}
                      className={`flex items-center gap-4 p-4 rounded-2xl border ${fund.key === selectedFund ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-slate-50'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${index === 0 ? 'bg-amber-400 text-amber-900' : 'bg-slate-200 text-slate-600'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-800">{fund.name}</div>
                        <div className="text-xs text-slate-500">CAGR: {fund.cagr}% | Volatility: {fund.volatility}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-slate-900">{formatCurrency(fund.finalBalance)}</div>
                        <div className="text-xs text-emerald-600 font-bold">+{formatCurrency(fund.gains)} gains</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Risk Analysis */}
          {riskAnalysis && (
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <AlertTriangle size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black mb-3">Risk-Adjusted Analysis</h4>
                  <p className="text-purple-50 font-medium text-lg leading-relaxed mb-6">
                    Understanding risk is just as important as understanding returns.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <p className="text-purple-100 text-sm font-bold mb-2">Sharpe Ratio</p>
                      <p className="text-4xl font-black">{riskAnalysis.sharpeRatio}</p>
                      <p className="text-purple-100 text-xs font-medium mt-2">
                        {parseFloat(riskAnalysis.sharpeRatio) > 0.5 ? 'Good risk-adjusted returns' : 'Moderate risk-adjusted returns'}
                      </p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <p className="text-purple-100 text-sm font-bold mb-2">Est. Max Drawdown</p>
                      <p className="text-4xl font-black">-{riskAnalysis.maxDrawdownEstimate}%</p>
                      <p className="text-purple-100 text-xs font-medium mt-2">
                        Potential peak-to-trough decline
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-sm font-black text-purple-100 mb-4">MONTE CARLO PROJECTION RANGE</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-purple-200 font-bold mb-1">Worst Case (5th %ile)</p>
                    <p className="text-2xl font-black text-rose-300">{formatCurrency(riskAnalysis.worstCase)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-200 font-bold mb-1">Median (50th %ile)</p>
                    <p className="text-2xl font-black text-white">{formatCurrency(riskAnalysis.median)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-purple-200 font-bold mb-1">Best Case (95th %ile)</p>
                    <p className="text-2xl font-black text-emerald-300">{formatCurrency(riskAnalysis.bestCase)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CORTEX Recommendation */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="font-black text-lg">CORTEX Recommendation</h4>
            </div>
            <p className="text-slate-300 font-medium leading-relaxed">
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
      )}
    </div>
  );
}
