'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingDown,
  Zap,
  Brain,
  Scale,
  Plus,
  Trash2,
  Info,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface Debt {
  id: number;
  name: string;
  balance: number;
  rate: number;
  minPayment: number;
  isTaxDeductible: boolean;
}

interface DebtPaydownOptimizerProps {
  isPro?: boolean;
  onUpgrade?: () => void;
}

interface SimulationResult {
  months: number;
  totalInterest: number;
  timeline: Array<{
    month: number;
    totalBalance: number;
    interestPaid: number;
  }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

export default function DebtPaydownOptimizer({ isPro, onUpgrade }: DebtPaydownOptimizerProps) {
  const [debts, setDebts] = useState<Debt[]>([
    { id: 1, name: 'Credit Card A', balance: 5000, rate: 24.99, minPayment: 150, isTaxDeductible: false },
    { id: 2, name: 'Student Loan', balance: 15000, rate: 4.5, minPayment: 200, isTaxDeductible: true },
    { id: 3, name: 'Auto Loan', balance: 8000, rate: 6.5, minPayment: 350, isTaxDeductible: false },
  ]);

  const [monthlyBudget, setMonthlyBudget] = useState(1200);
  const [investmentRate, setInvestmentRate] = useState(7);
  const [taxRate, setTaxRate] = useState(25);
  const [psychologicalWeight, setPsychologicalWeight] = useState(50); // 0 = Pure Math, 100 = Pure Motivation

  // Input Handlers
  const addDebt = () => {
    const newId = debts.length > 0 ? Math.max(...debts.map(d => d.id)) + 1 : 1;
    setDebts([...debts, { id: newId, name: 'New Debt', balance: 0, rate: 0, minPayment: 0, isTaxDeductible: false }]);
  };

  const removeDebt = (id: number) => setDebts(debts.filter(d => d.id !== id));

  const updateDebt = (id: number, field: keyof Debt, value: string | number | boolean) => {
    setDebts(debts.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  // Logic: Simulation Engine
  const simulate = (strategyType: 'avalanche' | 'snowball' | 'hybrid'): SimulationResult => {
    let currentDebts = debts.map(d => ({
      ...d,
      currentBalance: d.balance,
      effectiveRate: d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate
    }));

    let totalInterest = 0;
    let months = 0;
    let timeline: Array<{ month: number; totalBalance: number; interestPaid: number }> = [];
    const maxMonths = 360; // 30 year cap

    const totalMinPayments = currentDebts.reduce((sum, d) => sum + d.minPayment, 0);
    let extraCash = Math.max(0, monthlyBudget - totalMinPayments);

    while (currentDebts.some(d => d.currentBalance > 0) && months < maxMonths) {
      months++;
      let monthlyInterest = 0;

      // 1. Calculate and add interest
      currentDebts.forEach(d => {
        if (d.currentBalance > 0) {
          const interest = (d.currentBalance * (d.rate / 100)) / 12;
          d.currentBalance += interest;
          monthlyInterest += interest;
        }
      });
      totalInterest += monthlyInterest;

      // 2. Pay Minimums
      currentDebts.forEach(d => {
        if (d.currentBalance > 0) {
          const payment = Math.min(d.currentBalance, d.minPayment);
          d.currentBalance -= payment;
        }
      });

      // 3. Apply Snowball/Avalanche logic to extra cash + freed up minimums
      let availableForExtra = extraCash + currentDebts
        .filter(d => d.currentBalance <= 0)
        .reduce((sum, d) => sum + d.minPayment, 0);

      // Sorting Strategy
      let sorted = [...currentDebts].filter(d => d.currentBalance > 0);
      if (strategyType === 'avalanche') {
        sorted.sort((a, b) => b.rate - a.rate);
      } else if (strategyType === 'snowball') {
        sorted.sort((a, b) => a.currentBalance - b.currentBalance);
      } else if (strategyType === 'hybrid') {
        // Hybrid: Weighs interest rate and balance based on psychologicalWeight
        // High rate = good for math. Low balance = good for momentum.
        sorted.sort((a, b) => {
          const scoreA = (b.rate * (100 - psychologicalWeight)) + ((1/a.currentBalance) * psychologicalWeight * 100000);
          const scoreB = (a.rate * (100 - psychologicalWeight)) + ((1/b.currentBalance) * psychologicalWeight * 100000);
          return scoreA - scoreB;
        });
      }

      for (let d of sorted) {
        if (availableForExtra <= 0) break;
        const payment = Math.min(d.currentBalance, availableForExtra);
        d.currentBalance -= payment;
        availableForExtra -= payment;
      }

      timeline.push({
        month: months,
        totalBalance: currentDebts.reduce((sum, d) => sum + Math.max(0, d.currentBalance), 0),
        interestPaid: totalInterest
      });
    }

    return { months, totalInterest, timeline };
  };

  const results = useMemo(() => ({
    avalanche: simulate('avalanche'),
    snowball: simulate('snowball'),
    hybrid: simulate('hybrid'),
  }), [debts, monthlyBudget, taxRate, psychologicalWeight]);

  // Opportunity Cost Calculation
  const opportunityCost = useMemo(() => {
    const avgMonths = results.avalanche.months;
    let investedValue = 0;
    const monthlyContribution = monthlyBudget;
    const monthlyRate = (investmentRate / 100) / 12;

    for (let i = 0; i < avgMonths; i++) {
      investedValue = (investedValue + monthlyContribution) * (1 + monthlyRate);
    }
    return investedValue;
  }, [results, monthlyBudget, investmentRate]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Panel: Inputs */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-indigo-500" />
                Your Debts
              </h2>
              <button
                onClick={addDebt}
                className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-medium hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Add Debt
              </button>
            </div>

            <div className="space-y-4">
              {debts.map((debt) => (
                <div key={debt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                  <button
                    onClick={() => removeDebt(debt.id)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="text-xs font-bold text-slate-400 uppercase">Debt Name</label>
                      <input
                        type="text"
                        value={debt.name}
                        onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none py-1 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Balance ($)</label>
                      <input
                        type="number"
                        value={debt.balance}
                        onChange={(e) => updateDebt(debt.id, 'balance', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none py-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">APR (%)</label>
                      <input
                        type="number"
                        value={debt.rate}
                        onChange={(e) => updateDebt(debt.id, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none py-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase">Min Pay ($)</label>
                      <input
                        type="number"
                        value={debt.minPayment}
                        onChange={(e) => updateDebt(debt.id, 'minPayment', parseFloat(e.target.value) || 0)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-indigo-500 outline-none py-1"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        checked={debt.isTaxDeductible}
                        onChange={(e) => updateDebt(debt.id, 'isTaxDeductible', e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-500">Tax Deductible</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-500" />
              Optimization Parameters
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 font-medium">Monthly Paydown Budget</span>
                  <span className="text-indigo-600 font-bold">${monthlyBudget}</span>
                </div>
                <input
                  type="range" min="100" max="5000" step="50"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  Min required to cover all debts: ${debts.reduce((s, d) => s + d.minPayment, 0)}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 font-medium">Psychological Weighting</span>
                  <span className="text-indigo-600 font-bold">
                    {psychologicalWeight < 30 ? 'Math Focused' : psychologicalWeight > 70 ? 'Momentum Focused' : 'Balanced'}
                  </span>
                </div>
                <input
                  type="range" min="0" max="100"
                  value={psychologicalWeight}
                  onChange={(e) => setPsychologicalWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                  <span>Avalanche (Logic)</span>
                  <span>Snowball (Behavior)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Invest Return (%)</label>
                  <input
                    type="number"
                    value={investmentRate}
                    onChange={(e) => setInvestmentRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Tax Bracket (%)</label>
                  <input
                    type="number"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel: Analysis */}
        <div className="lg:col-span-7 space-y-6">
          {/* Strategy Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StrategyCard
              title="Debt Avalanche"
              subtitle="Pure Mathematical Efficiency"
              icon={<TrendingDown className="text-blue-500" />}
              months={results.avalanche.months}
              interest={results.avalanche.totalInterest}
              active={true}
            />
            <StrategyCard
              title="Debt Snowball"
              subtitle="Maximum Psychological Wins"
              icon={<Zap className="text-amber-500" />}
              months={results.snowball.months}
              interest={results.snowball.totalInterest}
              active={false}
            />
            <StrategyCard
              title="Personalized Hybrid"
              subtitle="Your Behavioral Profile"
              icon={<Brain className="text-indigo-500" />}
              months={results.hybrid.months}
              interest={results.hybrid.totalInterest}
              active={true}
              highlight={true}
            />
          </div>

          {/* Main Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-indigo-500" />
              Balance Paydown Timeline
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={results.avalanche.timeline}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    label={{ value: 'Months', position: 'insideBottomRight', offset: -5 }}
                    tick={{fontSize: 12}}
                  />
                  <YAxis
                    tick={{fontSize: 12}}
                    tickFormatter={(value) => `$${value/1000}k`}
                  />
                  <Tooltip
                    formatter={(val: number) => `$${Math.round(val).toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalBalance"
                    name="Remaining Debt"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="interestPaid"
                    name="Cumulative Interest"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Insights Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                The Opportunity Cost
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  If you invested your <strong>${monthlyBudget}</strong> monthly at <strong>{investmentRate}%</strong> instead of paying off debt, you&apos;d have:
                </p>
                <div className="text-3xl font-bold text-slate-900">
                  ${Math.round(opportunityCost).toLocaleString()}
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex gap-3">
                  <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    <strong>Verdict:</strong> Any debt with an APR higher than {investmentRate}% (adjusted for taxes) is a &quot;guaranteed return&quot; better than the market.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Strategy Recommendation
              </h3>
              <div className="space-y-3">
                {results.avalanche.totalInterest < results.snowball.totalInterest - 500 ? (
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
                    <p className="text-xs text-slate-600">
                      The <strong>Avalanche</strong> saves you <strong>${Math.round(results.snowball.totalInterest - results.avalanche.totalInterest).toLocaleString()}</strong> in interest. Unless you struggle with motivation, go pure math.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-xs text-slate-600">
                      The interest difference is negligible. Use the <strong>Snowball</strong> method to clear small balances fast and get the dopamine hits you need to stay the course.
                    </p>
                  </div>
                )}

                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-2">Psychological Momentum Plan</div>
                  <div className="flex flex-wrap gap-2">
                    {debts.map((d, i) => (
                      <div key={d.id} className="text-[10px] px-2 py-1 bg-slate-100 rounded-md border border-slate-200">
                        {i+1}. {d.name}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StrategyCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactElement;
  months: number;
  interest: number;
  highlight?: boolean;
  active?: boolean;
}

const StrategyCard = ({ title, subtitle, icon, months, interest, highlight = false }: StrategyCardProps) => (
  <div className={`p-4 rounded-2xl border transition-all ${
    highlight
      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-200'
      : 'bg-white border-slate-200 text-slate-900 shadow-sm'
  }`}>
    <div className="flex items-center gap-2 mb-3">
      <div className={`p-1.5 rounded-lg ${highlight ? 'bg-white/20' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <span className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-indigo-100' : 'text-slate-400'}`}>
        {title}
      </span>
    </div>
    <div className="space-y-1">
      <div className="text-2xl font-bold">{months} <span className="text-xs font-normal opacity-80">months</span></div>
      <div className={`text-sm font-medium ${highlight ? 'text-indigo-200' : 'text-slate-500'}`}>
        ${Math.round(interest).toLocaleString()} <span className="text-[10px] uppercase">Interest</span>
      </div>
    </div>
    <div className={`mt-3 text-[10px] leading-tight ${highlight ? 'text-indigo-100' : 'text-slate-400'}`}>
      {subtitle}
    </div>
  </div>
);
