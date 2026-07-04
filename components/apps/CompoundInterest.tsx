"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Calculator, TrendingUp, Info, ArrowUpRight, Lock, Zap, AlertTriangle, Target, Clock, ArrowRight
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import Tooltip from '@/components/ui/Tooltip';
import NumberInput from '@/components/ui/NumberInput';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';
import ProGatedPreview from '@/components/monetization/ProGatedPreview';

interface CompoundInterestProps {
  isPro?: boolean;
  isLoggedIn?: boolean;
  onUpgrade?: () => void;
  initialValues?: Record<string, unknown>;
}

export default function CompoundInterest({ isPro = false, isLoggedIn = false, onUpgrade, initialValues }: CompoundInterestProps) {
  const [inputs, setInputs] = useState({
    principal: 25000,
    monthlyContribution: 500,
    annualReturn: 8,
    years: 30,
    currentAge: 30,
    compoundingFrequency: 12,
    ...(initialValues || {}),
  });

  const simulationData = useMemo(() => {
    let data = [];
    let balance = inputs.principal;
    let totalContributions = inputs.principal;
    const years = Math.max(0, Math.floor(inputs.years));
    // Convert nominal annual rate to the effective annual rate for the
    // selected compounding frequency, so the dropdown actually moves the math,
    // then derive the equivalent monthly growth rate so contributions can be
    // deposited monthly (end of month), matching the "Monthly Contribution" label.
    const freq = inputs.compoundingFrequency || 1;
    const ear = Math.pow(1 + (inputs.annualReturn / 100) / freq, freq) - 1;
    const monthlyRate = Math.pow(1 + ear, 1 / 12) - 1;

    for (let year = 0; year <= years; year++) {
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions)
      });

      for (let month = 0; month < 12; month++) {
        balance = balance * (1 + monthlyRate) + inputs.monthlyContribution;
      }
      totalContributions += inputs.monthlyContribution * 12;
    }
    return data;
  }, [inputs]);

  const finalStats = simulationData[simulationData.length - 1];

  // PRO FEATURE: Life Impact Analysis
  const lifeImpactAnalysis = useMemo(() => {
    if (!isPro) {
      // Sample data for blurred preview
      return {
        delayCost: 185000,
        delayPercentageLoss: 28.5,
        requiredIncreasePct: 65,
        optimizationGain: 142000,
        annualIncome: 38000,
        monthlyIncome: 3167,
        criticalAges: [
          { age: 35, year: 5, balance: 85000 },
          { age: 40, year: 10, balance: 195000 },
          { age: 45, year: 15, balance: 365000 },
        ],
        goalSplit: { retirement: 570000, house: 237500, other: 142500 },
        requiredMonthly: 825,
        _isPreview: true
      };
    }

    const freq = inputs.compoundingFrequency || 1;
    const ear = Math.pow(1 + (inputs.annualReturn / 100) / freq, freq) - 1;
    const monthlyRate = Math.pow(1 + ear, 1 / 12) - 1;
    const totalYears = Math.max(0, Math.floor(inputs.years));

    // Same convention as the main simulation: growth applied monthly,
    // contribution deposited at end of each month.
    const grow = (principal: number, monthly: number, months: number) => {
      let b = principal;
      for (let m = 0; m < months; m++) b = b * (1 + monthlyRate) + monthly;
      return b;
    };

    // 1. Delay Cost Analysis - What if you delay starting by 5 years?
    const delayYears = 5;
    const delayedYears = Math.max(0, totalYears - delayYears);
    const delayedBalance = grow(inputs.principal, inputs.monthlyContribution, delayedYears * 12);
    const delayCost = finalStats.balance - delayedBalance;
    const delayPercentageLoss = finalStats.balance > 0 ? (delayCost / finalStats.balance) * 100 : 0;

    // To match the same outcome after the delay, solve the annuity formula
    // FV = P·g + M·(g−1)/r for M over the remaining months (null if no time remains).
    let requiredMonthly: number | null = null;
    if (delayedYears > 0) {
      const n = delayedYears * 12;
      const g = Math.pow(1 + monthlyRate, n);
      requiredMonthly = monthlyRate > 0
        ? ((finalStats.balance - inputs.principal * g) * monthlyRate) / (g - 1)
        : (finalStats.balance - inputs.principal) / n;
      requiredMonthly = Math.max(0, requiredMonthly);
    }
    const requiredIncreasePct = requiredMonthly !== null && inputs.monthlyContribution > 0
      ? ((requiredMonthly - inputs.monthlyContribution) / inputs.monthlyContribution) * 100
      : null;

    // 2. Contribution Optimization - What if you increase monthly by 20%?
    const optimizedBalance = grow(inputs.principal, inputs.monthlyContribution * 1.2, totalYears * 12);
    const optimizationGain = optimizedBalance - finalStats.balance;

    // 3. Withdrawal Strategy - Show what this portfolio can support
    const safeWithdrawalRate = 0.04; // 4% rule
    const annualIncome = finalStats.balance * safeWithdrawalRate;
    const monthlyIncome = annualIncome / 12;

    // 4. Critical Ages - Identify momentum milestones
    const criticalAges = [];
    for (let year = 5; year <= totalYears; year += 5) {
      criticalAges.push({
        age: inputs.currentAge + year,
        year,
        balance: simulationData[year].balance
      });
    }

    // 5. Multi-Goal Split Simulation
    const goalSplit = {
      retirement: finalStats.balance * 0.6,
      house: finalStats.balance * 0.25,
      other: finalStats.balance * 0.15
    };

    return {
      delayCost,
      delayPercentageLoss,
      requiredIncreasePct,
      optimizationGain,
      annualIncome,
      monthlyIncome,
      criticalAges,
      goalSplit,
      requiredMonthly
    };
  }, [isPro, inputs, simulationData, finalStats]);

  const setField = (name: string) => (n: number) =>
    setInputs(prev => ({ ...prev, [name]: n }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Save Scenario */}
      <div className="flex justify-end">
        <SaveScenarioButton
          toolId="compound-interest"
          toolName="Compound Interest Calculator"
          getInputs={() => inputs}
          getKeyResult={() => `$${finalStats.balance.toLocaleString()} after ${finalStats.year} years`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Future Value</p>
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">${finalStats.balance.toLocaleString()}</h4>
          <p className="text-xs font-bold text-[var(--teal-green)] mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> After {finalStats.year} years
          </p>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-lg border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Total Contributions</p>
          <h4 className="text-2xl font-bold text-[var(--text-primary)]">${finalStats.contributions.toLocaleString()}</h4>
        </div>
        <div className="bg-[var(--teal-green)] p-6 rounded-xl shadow-[var(--shadow-card)] text-white">
          <p className="text-[10px] font-bold text-white/75 uppercase tracking-widest mb-1">Total Interest Earned</p>
          <h4 className="text-2xl font-bold text-white">${finalStats.interest.toLocaleString()}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-card)] p-8 rounded-lg border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calculator size={16} className="text-[var(--navy)]" /> Variables
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Initial Principal</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[var(--text-muted)] font-bold">$</span>
                  <NumberInput value={inputs.principal} onValueChange={setField('principal')} min={0} className="w-full pl-7 pr-4 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Monthly Contribution</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-[var(--text-muted)] font-bold">$</span>
                  <NumberInput value={inputs.monthlyContribution} onValueChange={setField('monthlyContribution')} min={0} className="w-full pl-7 pr-4 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Avg. Return Rate (%)</label>
                <NumberInput value={inputs.annualReturn} onValueChange={setField('annualReturn')} step={0.1} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Investment Horizon (Years)</label>
                <NumberInput value={inputs.years} onValueChange={setField('years')} min={0} max={80} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Current Age</label>
                <NumberInput value={inputs.currentAge} onValueChange={setField('currentAge')} min={0} max={100} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">
                  Compound Frequency
                  <Tooltip content="How often interest is calculated and added to your balance. More frequent compounding means slightly higher returns." />
                </label>
                <select
                  value={inputs.compoundingFrequency}
                  onChange={(e) => setInputs({ ...inputs, compoundingFrequency: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                >
                  <option value={1}>Annually</option>
                  <option value={4}>Quarterly</option>
                  <option value={12}>Monthly</option>
                  <option value={365}>Daily</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mgm-band p-8 shadow-[var(--shadow-card-hover)]">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2 text-white">
              <Info size={16} className="text-[var(--sky)]" /> The Rule of 72
            </h4>
            <p className="text-xs font-medium leading-relaxed">
              {inputs.annualReturn > 0
                ? `At ${inputs.annualReturn}% return, your initial principal of $${inputs.principal.toLocaleString()} will double approximately every ${Math.round(72 / inputs.annualReturn)} years.`
                : `At 0% return, your money never doubles — growth only comes from what you contribute.`}
            </p>
          </div>
        </aside>

        {/* Chart View */}
        <main className="lg:col-span-8 bg-[var(--bg-card)] p-8 rounded-lg border border-[var(--border-default)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="text-[var(--teal-green)]" /> Growth Trajectory
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase">
                <div className="w-3 h-3 rounded-full bg-[var(--teal-green)]" /> Total Balance
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase">
                <div className="w-3 h-3 rounded-full bg-[var(--navy)]" /> Basis
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold'}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <ChartTooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card-hover)' }}
                  formatter={(v) => `$${(v || 0).toLocaleString()}`}
                />
                <Area type="monotone" dataKey="balance" stroke="var(--chart-emerald)" strokeWidth={3} fill="var(--chart-emerald)" fillOpacity={0.12} />
                <Area type="monotone" dataKey="contributions" stroke="var(--navy)" strokeWidth={2} fill="var(--navy)" fillOpacity={0.12} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>

      {/* PRO FEATURES SECTION */}
      {!isPro && (
        <div className="mgm-band p-12 text-white relative overflow-hidden shadow-[var(--shadow-card-hover)]">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-bold">Life Impact Analyzer</h3>
            </div>
            <p className="text-white/85 text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock advanced insights that reveal the invisible consequences of your decisions. See what delaying costs you, what optimization gains you, and how to align your savings with life goals.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <AlertTriangle size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Delay Cost Analysis</h4>
                <p className="text-white/85 text-xs font-medium">See exactly how much waiting 5 years costs in real dollars and required contribution increases</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <Target size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Withdrawal Strategy</h4>
                <p className="text-white/85 text-xs font-medium">Calculate sustainable income from your future portfolio using proven withdrawal rates</p>
              </div>
              <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                <Clock size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Critical Milestones</h4>
                <p className="text-white/85 text-xs font-medium">Identify key ages where momentum matters most for reaching your wealth targets</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="mgm-btn mgm-btn--primary mgm-btn--lg"
            >
              <Zap size={20} fill="currentColor" />
              Upgrade to Pro - $9/month
            </button>
          </div>
        </div>
      )}

      {/* PRO FEATURES: Life Impact Analyzer */}
      {lifeImpactAnalysis && (
        <ProGatedPreview isLocked={!isPro} toolId="compound-interest">
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[var(--navy)] text-white p-3 rounded-lg">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Life Impact Analyzer</h3>
              <p className="text-[var(--text-tertiary)] font-medium">Advanced insights that reveal invisible consequences</p>
            </div>
          </div>

          {/* Delay Cost Warning */}
          <div className="mgm-band p-10 text-white shadow-[var(--shadow-card-hover)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/15 p-3 rounded-lg">
                <AlertTriangle size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold mb-3">The Cost of Waiting</h4>
                <p className="text-white/90 font-medium text-lg leading-relaxed mb-6">
                  If you delay starting this investment strategy by 5 years, here's what happens:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <p className="text-white/85 text-sm font-bold mb-2">Wealth Lost</p>
                    <p className="text-4xl font-bold">${Math.round(lifeImpactAnalysis.delayCost).toLocaleString()}</p>
                    <p className="text-white/85 text-xs font-medium mt-2">
                      That's {lifeImpactAnalysis.delayPercentageLoss.toFixed(1)}% of your potential outcome
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                    <p className="text-white/85 text-sm font-bold mb-2">Required Contribution Increase</p>
                    {lifeImpactAnalysis.requiredMonthly !== null ? (
                      <>
                        <p className="text-4xl font-bold">
                          {lifeImpactAnalysis.requiredIncreasePct !== null
                            ? `+${lifeImpactAnalysis.requiredIncreasePct.toFixed(0)}%`
                            : `$${Math.round(lifeImpactAnalysis.requiredMonthly).toLocaleString()}/mo`}
                        </p>
                        <p className="text-white/85 text-xs font-medium mt-2">
                          You'd need ${Math.round(lifeImpactAnalysis.requiredMonthly).toLocaleString()}/mo instead of ${inputs.monthlyContribution.toLocaleString()}/mo
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-4xl font-bold">N/A</p>
                        <p className="text-white/85 text-xs font-medium mt-2">
                          With a 5-year delay on a {Math.max(0, Math.floor(inputs.years))}-year horizon, no contribution level catches up in time
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-6 border border-white/20">
              <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">MUTANT INSIGHT</p>
              <p className="font-medium text-white">
                Time is more valuable than amount. Starting today with ${inputs.monthlyContribution}/mo beats waiting 5 years{lifeImpactAnalysis.requiredIncreasePct !== null ? ` and saving ${lifeImpactAnalysis.requiredIncreasePct.toFixed(0)}% more per month` : ''}.
              </p>
            </div>
          </div>

          {/* Optimization Opportunity */}
          <div className="mgm-band p-10 text-white shadow-[var(--shadow-card-hover)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/15 p-3 rounded-lg">
                <TrendingUp size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold mb-3">Optimization Opportunity</h4>
                <p className="text-white/85 font-medium text-lg leading-relaxed mb-6">
                  What if you could increase your monthly contribution by just 20%?
                </p>
                <div className="bg-white/10 rounded-lg p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-white/85 text-sm font-bold mb-1">Current Strategy</p>
                      <p className="text-2xl font-bold">${inputs.monthlyContribution.toLocaleString()}/mo</p>
                    </div>
                    <ArrowRight size={32} className="text-white/60" />
                    <div>
                      <p className="text-white/85 text-sm font-bold mb-1">Optimized Strategy</p>
                      <p className="text-2xl font-bold">${Math.round(inputs.monthlyContribution * 1.2).toLocaleString()}/mo</p>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-white/85 text-sm font-bold mb-2">Additional Wealth Created</p>
                    <p className="text-4xl font-bold mb-2">${Math.round(lifeImpactAnalysis.optimizationGain).toLocaleString()}</p>
                    <p className="text-white/85 text-xs font-medium">
                      Just +${Math.round(inputs.monthlyContribution * 0.2).toLocaleString()}/mo compounds to an extra ${Math.round(lifeImpactAnalysis.optimizationGain).toLocaleString()} over {finalStats.year} years
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Strategy */}
          <div className="bg-[var(--bg-card)] rounded-lg p-10 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--emerald-100)] text-[var(--teal-green)] p-3 rounded-lg">
                <Target size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Withdrawal Strategy Preview</h4>
                <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed mb-6">
                  Your future portfolio of <span className="font-bold text-[var(--text-primary)]">${finalStats.balance.toLocaleString()}</span> can sustainably support:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[var(--emerald-50)] rounded-lg p-6 border border-[var(--emerald-border-soft)]">
                    <p className="text-[var(--teal-green)] text-sm font-bold mb-2">Annual Income (4% Rule)</p>
                    <p className="text-4xl font-bold text-[var(--text-primary)]">${Math.round(lifeImpactAnalysis.annualIncome).toLocaleString()}</p>
                    <p className="text-[var(--text-tertiary)] text-xs font-medium mt-2">In future dollars — not adjusted for inflation</p>
                  </div>
                  <div className="bg-[var(--emerald-50)] rounded-lg p-6 border border-[var(--emerald-border-soft)]">
                    <p className="text-[var(--teal-green)] text-sm font-bold mb-2">Monthly Income</p>
                    <p className="text-4xl font-bold text-[var(--text-primary)]">${Math.round(lifeImpactAnalysis.monthlyIncome).toLocaleString()}</p>
                    <p className="text-[var(--text-tertiary)] text-xs font-medium mt-2">Sustainable for 30+ years</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mgm-band rounded-lg p-6">
              <p className="text-xs font-bold text-[var(--sky)] uppercase tracking-widest mb-1">THE 4% RULE</p>
              <p className="text-sm font-medium text-[var(--mist-50)]">
                Research shows withdrawing 4% annually from a balanced portfolio historically sustains wealth for 30+ years through market cycles. This is your "work optional" number.
              </p>
            </div>
          </div>

          {/* Critical Milestones */}
          {lifeImpactAnalysis.criticalAges.length > 0 && (
            <div className="bg-[var(--bg-card)] rounded-lg p-10 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-[var(--emerald-100)] text-[var(--teal-green)] p-3 rounded-lg">
                  <Clock size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Critical Milestones</h4>
                  <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed mb-6">
                    Where your balance lands at each five-year checkpoint, starting from age {inputs.currentAge}:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {lifeImpactAnalysis.criticalAges.map((m) => (
                      <div key={m.year} className="bg-[var(--emerald-50)] rounded-lg p-5 border border-[var(--emerald-border-soft)]">
                        <p className="text-[var(--teal-green)] text-sm font-bold mb-1">Age {m.age}</p>
                        <p className="text-2xl font-bold text-[var(--text-primary)]">${m.balance.toLocaleString()}</p>
                        <p className="text-[var(--text-tertiary)] text-xs font-medium mt-1">Year {m.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Goal Allocation */}
          <div className="bg-[var(--bg-card)] rounded-lg p-10 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--emerald-100)] text-[var(--teal-green)] p-3 rounded-lg">
                <Calculator size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Multi-Goal Allocation Example</h4>
                <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed mb-6">
                  How your ${finalStats.balance.toLocaleString()} portfolio could be strategically allocated:
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">Retirement (60%)</span>
                        <span className="text-lg font-bold text-[var(--text-primary)]">${Math.round(lifeImpactAnalysis.goalSplit.retirement).toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-[var(--off-white)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--teal-green)] w-[60%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">Home Purchase (25%)</span>
                        <span className="text-lg font-bold text-[var(--text-primary)]">${Math.round(lifeImpactAnalysis.goalSplit.house).toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-[var(--off-white)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--navy)] w-[25%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-[var(--text-secondary)]">Other Goals (15%)</span>
                        <span className="text-lg font-bold text-[var(--text-primary)]">${Math.round(lifeImpactAnalysis.goalSplit.other).toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-[var(--off-white)] rounded-full overflow-hidden">
                        <div className="h-full bg-[var(--sky)] w-[15%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </ProGatedPreview>
      )}
      {!isPro && <ProUpsellCard toolId="compound-interest" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
