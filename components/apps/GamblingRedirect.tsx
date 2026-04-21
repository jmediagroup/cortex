"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Info, Target, Calendar, ArrowUpRight, Lock, Zap, Clock, ArrowRight
} from 'lucide-react';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';
import ProGatedPreview from '@/components/monetization/ProGatedPreview';

interface GamblingRedirectProps {
  isPro?: boolean;
  onUpgrade?: () => void;
  isLoggedIn?: boolean;
  initialValues?: Record<string, unknown>;
}

export default function GamblingRedirect({ isPro = false, onUpgrade, isLoggedIn = false, initialValues }: GamblingRedirectProps) {
  const [inputs, setInputs] = useState({
    monthlyBet: 250,
    years: 30,
    marketReturn: 10,
    ...(initialValues || {}),
  });

  const simulationData = useMemo(() => {
    const chartData = [];
    const monthlyRate = inputs.marketReturn / 100 / 12;

    let cumulativeSpent = 0;
    let portfolioValue = 0;

    for (let i = 0; i <= inputs.years; i++) {
      if (i > 0) {
        for (let m = 0; m < 12; m++) {
          cumulativeSpent += inputs.monthlyBet;
          portfolioValue = (portfolioValue + inputs.monthlyBet) * (1 + monthlyRate);
        }
      }

      chartData.push({
        year: i,
        burned: Math.round(cumulativeSpent),
        invested: Math.round(portfolioValue),
        gap: Math.round(portfolioValue - cumulativeSpent)
      });
    }
    return chartData;
  }, [inputs]);

  const finalStats = simulationData[simulationData.length - 1];
  const wealthGap = finalStats.invested - finalStats.burned;

  // PRO FEATURE: Advanced Analysis
  const proAnalysis = useMemo(() => {
    if (!isPro) {
      // Sample data for blurred preview
      return {
        totalWagered: 930000,
        expectedLoss: 74400,
        realCostEstimate: 315000,
        annualIncome: 24000,
        monthlyIncome: 2000,
        milestones: [
          { name: 'Emergency Fund (6 months)', cost: 18000, yearsToReach: 3 },
          { name: 'Used Car (Cash)', cost: 15000, yearsToReach: 2 },
          { name: 'House Down Payment', cost: 60000, yearsToReach: 8 },
        ],
        breakEvenYear: 4,
        _isPreview: true
      };
    }

    const rate = inputs.marketReturn / 100;
    const yearlyContribution = inputs.monthlyBet * 12;

    // 1. House Edge Analysis - What the house actually takes
    const houseEdge = 0.08; // 8% average house edge
    let totalWagered = 0;
    let expectedLoss = 0;
    for (let year = 0; year <= inputs.years; year++) {
      totalWagered += yearlyContribution * 10; // Assumes 10x churn on deposits
      expectedLoss = totalWagered * houseEdge;
    }

    // 2. Addiction cost multiplier - What problem gamblers actually spend
    const addictionMultiplier = 3.5; // Problem gamblers spend 3.5x their "budget"
    const realCostEstimate = finalStats.burned * addictionMultiplier;

    // 3. 4% Rule - Sustainable retirement income from invested amount
    const safeWithdrawalRate = 0.04;
    const annualIncome = finalStats.invested * safeWithdrawalRate;
    const monthlyIncome = annualIncome / 12;

    // 4. Life milestones you could afford
    const milestones = [
      { name: 'Emergency Fund (6 months)', cost: inputs.monthlyBet * 6 * 12, yearsToReach: 0 },
      { name: 'Used Car (Cash)', cost: 15000, yearsToReach: 0 },
      { name: 'House Down Payment', cost: 60000, yearsToReach: 0 },
      { name: 'Child College Fund', cost: 100000, yearsToReach: 0 }
    ];

    milestones.forEach((milestone, idx) => {
      let balance = 0;
      for (let year = 1; year <= inputs.years; year++) {
        for (let m = 0; m < 12; m++) {
          balance = (balance + inputs.monthlyBet) * (1 + inputs.marketReturn / 100 / 12);
        }
        if (balance >= milestone.cost && milestone.yearsToReach === 0) {
          milestones[idx].yearsToReach = year;
        }
      }
    });

    // 5. Breakeven analysis - When does investing beat gambling's "entertainment value"?
    const entertainmentValue = inputs.monthlyBet * 0.1; // Assume 10% of budget is "fun"
    let investedBalance = 0;
    let breakEvenYear = 0;
    for (let year = 1; year <= inputs.years; year++) {
      for (let m = 0; m < 12; m++) {
        investedBalance = (investedBalance + inputs.monthlyBet) * (1 + inputs.marketReturn / 100 / 12);
      }
      const investmentGains = investedBalance - (inputs.monthlyBet * 12 * year);
      const totalEntertainment = entertainmentValue * 12 * year;
      if (investmentGains > totalEntertainment && breakEvenYear === 0) {
        breakEvenYear = year;
      }
    }

    return {
      totalWagered: Math.round(totalWagered),
      expectedLoss: Math.round(expectedLoss),
      realCostEstimate: Math.round(realCostEstimate),
      annualIncome: Math.round(annualIncome),
      monthlyIncome: Math.round(monthlyIncome),
      milestones: milestones.filter(m => m.yearsToReach > 0 && m.yearsToReach <= inputs.years),
      breakEvenYear
    };
  }, [isPro, inputs, finalStats]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingDown className="w-12 h-12 text-[var(--crimson-500)]" />
          </div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Burned Spending</p>
          <h4 className="text-3xl font-black text-[var(--crimson-500)]">{formatCurrency(finalStats.burned)}</h4>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-2">Pure out-of-pocket expenditure over {inputs.years} years</p>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-12 h-12 text-[var(--emerald-500)]" />
          </div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Potential Wealth Growth</p>
          <h4 className="text-3xl font-black text-[var(--emerald-500)]">{formatCurrency(finalStats.invested)}</h4>
          <p className="text-xs font-bold text-[var(--text-muted)] mt-2">Assuming compound interest and market growth</p>
        </div>
      </div>

      {/* Opportunity Cost Highlight */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] shadow-sm p-8 text-center">
        <div className="bg-[var(--color-warning-soft)] text-[var(--color-warning)] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase inline-block mb-4">
          The Opportunity Cost
        </div>
        <h3 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] tracking-tight mb-4">
          {formatCurrency(wealthGap)}
        </h3>
        <p className="text-[var(--text-tertiary)] font-medium max-w-md mx-auto">
          This is the "Wealth Gap"—the massive difference between supporting the sportsbook and supporting your future self.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-default)] shadow-sm space-y-6">
            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Target size={16} className="text-[var(--emerald-500)]" /> Your Habits
            </h3>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase">Monthly Betting Budget</label>
                  <span className="text-[var(--emerald-500)] font-black text-sm">{formatCurrency(inputs.monthlyBet)}</span>
                </div>
                <input
                  type="range"
                  name="monthlyBet"
                  min="10"
                  max="5000"
                  step="10"
                  value={inputs.monthlyBet}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)] font-bold">
                  <span>$10</span>
                  <span>$5,000</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase">Time Horizon (Years)</label>
                  <span className="text-[var(--emerald-500)] font-black text-sm">{inputs.years} Years</span>
                </div>
                <input
                  type="range"
                  name="years"
                  min="1"
                  max="50"
                  value={inputs.years}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between mt-1 text-[10px] text-[var(--text-muted)] font-bold">
                  <span>1 Year</span>
                  <span>50 Years</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase flex items-center gap-1">
                    S&P 500 Avg. Return
                    <div className="group relative">
                      <Info className="w-3 h-3 text-[var(--text-muted)] cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-[var(--obsidian-800)] text-white text-[10px] rounded-lg shadow-lg z-10">
                        Historically, the S&P 500 returns ~10% annually before inflation.
                      </div>
                    </div>
                  </label>
                  <span className="text-[var(--emerald-500)] font-black text-sm">{inputs.marketReturn}%</span>
                </div>
                <input
                  type="range"
                  name="marketReturn"
                  min="1"
                  max="15"
                  value={inputs.marketReturn}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Reality Check Card */}
          <div className="bg-[var(--obsidian-800)] text-white p-8 rounded-[2.5rem] shadow-xl">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[var(--emerald-400)]" /> The Reality Check
            </h4>
            <ul className="text-xs space-y-3 opacity-90 font-medium">
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--emerald-400)] mt-1.5 shrink-0" />
                <span>Only <strong>3-4%</strong> of sports bettors are profitable long-term.</span>
              </li>
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--emerald-400)] mt-1.5 shrink-0" />
                <span>The "House Edge" (Hold) typically takes <strong>7-9%</strong> of every dollar wagered.</span>
              </li>
              <li className="flex gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-[var(--emerald-400)] mt-1.5 shrink-0" />
                <span>In 20 years, the S&P 500 has a <strong>100% historical success rate</strong> for positive returns.</span>
              </li>
            </ul>
          </div>
        </aside>

        {/* Chart View */}
        <main className="lg:col-span-8 bg-[var(--bg-card)] p-8 rounded-[3rem] border border-[var(--border-default)] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
              <Calendar className="text-[var(--emerald-500)]" /> Growth Comparison Over Time
            </h3>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C285" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00C285" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C2C2E" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#8E8E93', fontSize: 11, fontWeight: 'bold'}}
                  label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#8E8E93', fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#8E8E93', fontSize: 11, fontWeight: 'bold'}}
                  tickFormatter={(val) => `$${val > 999 ? (val/1000).toFixed(0) + 'k' : val}`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="invested"
                  name="Potential S&P 500 Wealth"
                  stroke="#00C285"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorInvested)"
                />
                <Area
                  type="monotone"
                  dataKey="burned"
                  name="Total Money Burned"
                  stroke="#FF3B30"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorBurned)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm">
          <span className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Daily Cost</span>
          <span className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency((inputs.monthlyBet * 12) / 365)}/day</span>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm">
          <span className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Annual Cost</span>
          <span className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(inputs.monthlyBet * 12)}/yr</span>
        </div>
        <div className="p-6 rounded-3xl bg-[var(--bg-card)] border border-[var(--border-default)] shadow-sm">
          <span className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1">Growth Factor</span>
          <span className="text-2xl font-black text-[var(--text-primary)]">
            {((finalStats.invested / finalStats.burned) || 0).toFixed(1)}x
          </span>
        </div>
      </div>

      {/* PRO FEATURES SECTION */}
      {!isPro && (
        <div className="bg-gradient-to-br from-[var(--color-warning)] to-[var(--color-warning)] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-black">Recovery Roadmap Analyzer</h3>
            </div>
            <p className="text-[var(--color-warning-soft)] text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock advanced insights that show the true cost of gambling, milestone achievements you could reach, and a personalized path to financial freedom.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <AlertTriangle size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">True Cost Analysis</h4>
                <p className="text-[var(--color-warning-soft)] text-xs font-medium">See the hidden multiplier effect of gambling losses including house edge and churn</p>
              </div>
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Target size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Milestone Tracker</h4>
                <p className="text-[var(--color-warning-soft)] text-xs font-medium">See exactly when you could afford a car, house down payment, or college fund</p>
              </div>
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Clock size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Retirement Income</h4>
                <p className="text-[var(--color-warning-soft)] text-xs font-medium">Calculate sustainable monthly income from your redirected wealth</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="bg-[var(--bg-card)] text-[var(--color-warning)] px-8 py-4 rounded-2xl font-black hover:bg-[var(--color-warning-soft)] transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              Upgrade to Pro - $9/month
            </button>
          </div>
        </div>
      )}

      {/* PRO FEATURES: Recovery Roadmap Analyzer */}
      {proAnalysis && (
        <ProGatedPreview isLocked={!isPro} toolId="gambling-redirect">
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[var(--color-warning)] text-white p-3 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[var(--text-primary)]">Recovery Roadmap Analyzer</h3>
              <p className="text-[var(--text-tertiary)] font-medium">Advanced insights for your financial transformation</p>
            </div>
          </div>

          {/* True Cost Warning */}
          <div className="bg-gradient-to-br from-[var(--crimson-500)] to-[var(--color-warning)] rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--bg-card)]/20 p-3 rounded-2xl backdrop-blur-sm">
                <AlertTriangle size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black mb-3">The True Cost of Gambling</h4>
                <p className="text-[var(--crimson-50)] font-medium text-lg leading-relaxed mb-6">
                  What the sportsbooks don't want you to see:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-[var(--crimson-100)] text-sm font-bold mb-2">Total Amount Wagered (Est.)</p>
                    <p className="text-4xl font-black">{formatCurrency(proAnalysis.totalWagered)}</p>
                    <p className="text-[var(--crimson-100)] text-xs font-medium mt-2">
                      Based on typical 10x churn on deposits
                    </p>
                  </div>
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-[var(--crimson-100)] text-sm font-bold mb-2">Expected Loss to House Edge</p>
                    <p className="text-4xl font-black">{formatCurrency(proAnalysis.expectedLoss)}</p>
                    <p className="text-[var(--crimson-100)] text-xs font-medium mt-2">
                      At 8% house edge over {inputs.years} years
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-sm font-black text-[var(--crimson-100)] mb-2">CORTEX INSIGHT</p>
              <p className="font-medium text-white">
                Problem gamblers typically spend 3.5x their stated "budget." That could mean a real cost of {formatCurrency(proAnalysis.realCostEstimate)} over {inputs.years} years.
              </p>
            </div>
          </div>

          {/* Milestone Achievements */}
          {proAnalysis.milestones.length > 0 && (
            <div className="bg-gradient-to-br from-[var(--emerald-500)] to-[var(--color-info)] rounded-[3rem] p-10 text-white shadow-xl">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[var(--bg-card)]/20 p-3 rounded-2xl backdrop-blur-sm">
                  <Target size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black mb-3">Life Milestones You Could Reach</h4>
                  <p className="text-[var(--emerald-50)] font-medium text-lg leading-relaxed mb-6">
                    By redirecting your betting budget to investing:
                  </p>
                  <div className="space-y-4">
                    {proAnalysis.milestones.map((milestone, idx) => (
                      <div key={idx} className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 flex items-center justify-between">
                        <div>
                          <p className="font-black text-lg">{milestone.name}</p>
                          <p className="text-[var(--emerald-100)] text-sm font-medium">{formatCurrency(milestone.cost)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-black">{milestone.yearsToReach}</p>
                          <p className="text-[var(--emerald-100)] text-xs font-bold uppercase">Years</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Retirement Income */}
          <div className="bg-[var(--bg-card)] rounded-[3rem] p-10 border border-[var(--border-default)] shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--emerald-100)] text-[var(--emerald-500)] p-3 rounded-2xl">
                <TrendingUp size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-[var(--text-primary)] mb-3">Your Future Freedom</h4>
                <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed mb-6">
                  Your redirected wealth of <span className="font-black text-[var(--text-primary)]">{formatCurrency(finalStats.invested)}</span> can sustainably support:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[var(--emerald-50)] rounded-2xl p-6 border border-[var(--emerald-border-soft)]">
                    <p className="text-[var(--emerald-500)] text-sm font-bold mb-2">Annual Income (4% Rule)</p>
                    <p className="text-4xl font-black text-[var(--text-primary)]">{formatCurrency(proAnalysis.annualIncome)}</p>
                    <p className="text-[var(--text-tertiary)] text-xs font-medium mt-2">Sustainable for 30+ years</p>
                  </div>
                  <div className="bg-[var(--emerald-50)] rounded-2xl p-6 border border-[var(--emerald-border-soft)]">
                    <p className="text-[var(--emerald-500)] text-sm font-bold mb-2">Monthly Income</p>
                    <p className="text-4xl font-black text-[var(--text-primary)]">{formatCurrency(proAnalysis.monthlyIncome)}</p>
                    <p className="text-[var(--text-tertiary)] text-xs font-medium mt-2">Every month, forever</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--obsidian-800)] text-white rounded-2xl p-6">
              <p className="text-xs font-black text-[var(--mist-200)] mb-2">THE TRANSFORMATION</p>
              <p className="text-sm font-medium text-[var(--mist-50)]">
                Instead of giving money to sportsbooks, you could be receiving {formatCurrency(proAnalysis.monthlyIncome)}/month in passive income. That's what financial freedom looks like.
              </p>
            </div>
          </div>
        </div>
        </ProGatedPreview>
      )}

      {/* Call to Action */}
      <div className="bg-[var(--bg-card)] p-10 rounded-[3rem] border-2 border-dashed border-[var(--border-default)] text-center">
        <h4 className="text-2xl font-black text-[var(--text-primary)] mb-3">Change the Play</h4>
        <p className="text-[var(--text-tertiary)] font-medium mb-6 max-w-lg mx-auto">
          Instead of checking the spread, consider checking your portfolio.
          One habit burns wealth; the other builds it.
        </p>
        <a
          href="https://www.ncpgambling.org/help-treatment/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[var(--emerald-500)] hover:bg-[var(--emerald-500)] text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95"
        >
          Get Support <ArrowRight className="w-4 h-4" />
        </a>
        <p className="text-xs text-[var(--text-muted)] mt-4">
          National Council on Problem Gambling: 1-800-522-4700
        </p>
      </div>
      {!isPro && <ProUpsellCard toolId="gambling-redirect" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
