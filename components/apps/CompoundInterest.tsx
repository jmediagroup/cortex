"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import {
  Calculator, TrendingUp, Info, ArrowUpRight, Lock, Zap, AlertTriangle, Target, Clock, ArrowRight
} from 'lucide-react';

interface CompoundInterestProps {
  isPro?: boolean;
  onUpgrade?: () => void;
}

export default function CompoundInterest({ isPro = false, onUpgrade }: CompoundInterestProps) {
  const [inputs, setInputs] = useState({
    principal: 25000,
    monthlyContribution: 500,
    annualReturn: 8,
    years: 30,
    compoundingFrequency: 12
  });

  const simulationData = useMemo(() => {
    let data = [];
    let balance = inputs.principal;
    let totalContributions = inputs.principal;

    for (let year = 0; year <= inputs.years; year++) {
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions)
      });

      // Simple yearly calculation for performance
      const yearlyContribution = inputs.monthlyContribution * 12;
      const rate = inputs.annualReturn / 100;
      balance = (balance + yearlyContribution) * (1 + rate);
      totalContributions += yearlyContribution;
    }
    return data;
  }, [inputs]);

  const finalStats = simulationData[simulationData.length - 1];

  // PRO FEATURE: Life Impact Analysis
  const lifeImpactAnalysis = useMemo(() => {
    if (!isPro) return null;

    const rate = inputs.annualReturn / 100;
    const yearlyContribution = inputs.monthlyContribution * 12;

    // 1. Delay Cost Analysis - What if you delay starting by 5 years?
    const delayYears = 5;
    let delayedBalance = inputs.principal;
    let delayedContributions = inputs.principal;
    for (let year = 0; year <= inputs.years - delayYears; year++) {
      delayedBalance = (delayedBalance + yearlyContribution) * (1 + rate);
      delayedContributions += yearlyContribution;
    }
    const delayCost = finalStats.balance - delayedBalance;
    const delayPercentageLoss = (delayCost / finalStats.balance) * 100;

    // To match same outcome after delay, calculate required monthly increase
    let requiredMonthly = inputs.monthlyContribution;
    let testBalance = inputs.principal;
    for (let attempt = 0; attempt < 100; attempt++) {
      testBalance = inputs.principal;
      for (let year = 0; year <= inputs.years - delayYears; year++) {
        testBalance = (testBalance + requiredMonthly * 12) * (1 + rate);
      }
      if (testBalance >= finalStats.balance) break;
      requiredMonthly += 50;
    }
    const requiredIncreasePct = ((requiredMonthly - inputs.monthlyContribution) / inputs.monthlyContribution) * 100;

    // 2. Contribution Optimization - What if you increase monthly by 20%?
    let optimizedBalance = inputs.principal;
    const optimizedMonthly = inputs.monthlyContribution * 1.2;
    for (let year = 0; year <= inputs.years; year++) {
      optimizedBalance = (optimizedBalance + optimizedMonthly * 12) * (1 + rate);
    }
    const optimizationGain = optimizedBalance - finalStats.balance;

    // 3. Withdrawal Strategy - Show what this portfolio can support
    const safeWithdrawalRate = 0.04; // 4% rule
    const annualIncome = finalStats.balance * safeWithdrawalRate;
    const monthlyIncome = annualIncome / 12;

    // 4. Critical Ages - Identify momentum milestones
    const criticalAges = [];
    const currentAge = 30; // Could make this an input
    for (let year = 5; year <= inputs.years; year += 5) {
      criticalAges.push({
        age: currentAge + year,
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Future Value</p>
          <h4 className="text-2xl font-black text-slate-900">${finalStats.balance.toLocaleString()}</h4>
          <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> After {inputs.years} years
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contributions</p>
          <h4 className="text-2xl font-black text-slate-800">${finalStats.contributions.toLocaleString()}</h4>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Interest Earned</p>
          <h4 className="text-2xl font-black text-white">${finalStats.interest.toLocaleString()}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calculator size={16} className="text-indigo-600" /> Variables
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Initial Principal</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" name="principal" value={inputs.principal} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Monthly Contribution</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Avg. Return Rate (%)</label>
                <input type="number" name="annualReturn" value={inputs.annualReturn} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Investment Horizon (Years)</label>
                <input type="number" name="years" value={inputs.years} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" /> The Rule of 72
            </h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              At {inputs.annualReturn}% return, your initial principal of ${inputs.principal.toLocaleString()} will double approximately every {Math.round(72 / (inputs.annualReturn || 1))} years.
            </p>
          </div>
        </aside>

        {/* Chart View */}
        <main className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" /> Growth Trajectory
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="w-3 h-3 rounded-full bg-indigo-600" /> Total Balance
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="w-3 h-3 rounded-full bg-slate-200" /> Basis
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  formatter={(v) => `$${(v || 0).toLocaleString()}`}
                />
                <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={4} fill="#818cf8" fillOpacity={0.1} />
                <Area type="monotone" dataKey="contributions" stroke="#cbd5e1" strokeWidth={2} fill="#f1f5f9" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>

      {/* PRO FEATURES SECTION */}
      {!isPro && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-black">Life Impact Analyzer</h3>
            </div>
            <p className="text-amber-50 text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock advanced insights that reveal the invisible consequences of your decisions. See what delaying costs you, what optimization gains you, and how to align your savings with life goals.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <AlertTriangle size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Delay Cost Analysis</h4>
                <p className="text-amber-100 text-xs font-medium">See exactly how much waiting 5 years costs in real dollars and required contribution increases</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Target size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Withdrawal Strategy</h4>
                <p className="text-amber-100 text-xs font-medium">Calculate sustainable income from your future portfolio using proven withdrawal rates</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Clock size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Critical Milestones</h4>
                <p className="text-amber-100 text-xs font-medium">Identify key ages where momentum matters most for reaching your wealth targets</p>
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

      {/* PRO FEATURES: Life Impact Analyzer */}
      {isPro && lifeImpactAnalysis && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500 text-white p-3 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Life Impact Analyzer</h3>
              <p className="text-slate-500 font-medium">Advanced insights that reveal invisible consequences</p>
            </div>
          </div>

          {/* Delay Cost Warning */}
          <div className="bg-gradient-to-br from-rose-500 to-orange-500 rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <AlertTriangle size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black mb-3">The Cost of Waiting</h4>
                <p className="text-rose-50 font-medium text-lg leading-relaxed mb-6">
                  If you delay starting this investment strategy by 5 years, here's what happens:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-rose-100 text-sm font-bold mb-2">Wealth Lost</p>
                    <p className="text-4xl font-black">${Math.round(lifeImpactAnalysis.delayCost).toLocaleString()}</p>
                    <p className="text-rose-100 text-xs font-medium mt-2">
                      That's {lifeImpactAnalysis.delayPercentageLoss.toFixed(1)}% of your potential outcome
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-rose-100 text-sm font-bold mb-2">Required Contribution Increase</p>
                    <p className="text-4xl font-black">+{lifeImpactAnalysis.requiredIncreasePct.toFixed(0)}%</p>
                    <p className="text-rose-100 text-xs font-medium mt-2">
                      You'd need ${Math.round(lifeImpactAnalysis.requiredMonthly).toLocaleString()}/mo instead of ${inputs.monthlyContribution.toLocaleString()}/mo
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-sm font-black text-rose-100 mb-2">CORTEX INSIGHT</p>
              <p className="font-medium text-white">
                Time is more valuable than amount. Starting today with ${inputs.monthlyContribution}/mo beats waiting 5 years and saving {lifeImpactAnalysis.requiredIncreasePct.toFixed(0)}% more per month.
              </p>
            </div>
          </div>

          {/* Optimization Opportunity */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <TrendingUp size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black mb-3">Optimization Opportunity</h4>
                <p className="text-emerald-50 font-medium text-lg leading-relaxed mb-6">
                  What if you could increase your monthly contribution by just 20%?
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-emerald-100 text-sm font-bold mb-1">Current Strategy</p>
                      <p className="text-2xl font-black">${inputs.monthlyContribution.toLocaleString()}/mo</p>
                    </div>
                    <ArrowRight size={32} className="text-white/60" />
                    <div>
                      <p className="text-emerald-100 text-sm font-bold mb-1">Optimized Strategy</p>
                      <p className="text-2xl font-black">${Math.round(inputs.monthlyContribution * 1.2).toLocaleString()}/mo</p>
                    </div>
                  </div>
                  <div className="border-t border-white/20 pt-4">
                    <p className="text-emerald-100 text-sm font-bold mb-2">Additional Wealth Created</p>
                    <p className="text-4xl font-black mb-2">${Math.round(lifeImpactAnalysis.optimizationGain).toLocaleString()}</p>
                    <p className="text-emerald-100 text-xs font-medium">
                      Just +${Math.round(inputs.monthlyContribution * 0.2).toLocaleString()}/mo compounds to an extra ${Math.round(lifeImpactAnalysis.optimizationGain).toLocaleString()} over {inputs.years} years
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Withdrawal Strategy */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
                <Target size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-slate-900 mb-3">Withdrawal Strategy Preview</h4>
                <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
                  Your future portfolio of <span className="font-black text-slate-900">${finalStats.balance.toLocaleString()}</span> can sustainably support:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <p className="text-indigo-600 text-sm font-bold mb-2">Annual Income (4% Rule)</p>
                    <p className="text-4xl font-black text-slate-900">${Math.round(lifeImpactAnalysis.annualIncome).toLocaleString()}</p>
                    <p className="text-slate-500 text-xs font-medium mt-2">Adjusted for inflation</p>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <p className="text-indigo-600 text-sm font-bold mb-2">Monthly Income</p>
                    <p className="text-4xl font-black text-slate-900">${Math.round(lifeImpactAnalysis.monthlyIncome).toLocaleString()}</p>
                    <p className="text-slate-500 text-xs font-medium mt-2">Sustainable for 30+ years</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-indigo-900 text-white rounded-2xl p-6">
              <p className="text-xs font-black text-indigo-300 mb-2">THE 4% RULE</p>
              <p className="text-sm font-medium text-indigo-50">
                Research shows withdrawing 4% annually from a balanced portfolio historically sustains wealth for 30+ years through market cycles. This is your "work optional" number.
              </p>
            </div>
          </div>

          {/* Multi-Goal Allocation */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl">
                <Calculator size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-slate-900 mb-3">Multi-Goal Allocation Example</h4>
                <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
                  How your ${finalStats.balance.toLocaleString()} portfolio could be strategically allocated:
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-slate-700">Retirement (60%)</span>
                        <span className="text-lg font-black text-slate-900">${Math.round(lifeImpactAnalysis.goalSplit.retirement).toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[60%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-slate-700">Home Purchase (25%)</span>
                        <span className="text-lg font-black text-slate-900">${Math.round(lifeImpactAnalysis.goalSplit.house).toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 w-[25%]"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-slate-700">Other Goals (15%)</span>
                        <span className="text-lg font-black text-slate-900">${Math.round(lifeImpactAnalysis.goalSplit.other).toLocaleString()}</span>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500 w-[15%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
