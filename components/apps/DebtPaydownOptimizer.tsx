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
  DollarSign,
  Lock,
  Target,
  Shield,
  Repeat
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
  const [monthlyIncome, setMonthlyIncome] = useState(5000);
  const [age, setAge] = useState<number | null>(null);
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

  // PRO FEATURE: Opportunity Cost Rebalancer
  const opportunityAnalysis = useMemo(() => {
    if (!isPro) return null;

    // 1. Investment vs Paydown Comparison
    // Scenario A: Pay minimum + invest difference
    const totalMinPayments = debts.reduce((sum, d) => sum + d.minPayment, 0);
    const investableAmount = monthlyBudget - totalMinPayments;

    // Simulate investing the extra cash instead of aggressive paydown
    const monthlyRate = (investmentRate / 100) / 12;
    let investmentValue = 0;
    const paydownMonths = results.avalanche.months;

    for (let i = 0; i < paydownMonths; i++) {
      investmentValue = (investmentValue + investableAmount) * (1 + monthlyRate);
    }

    // Remaining debt after paying minimums only
    let remainingDebtValue = 0;
    debts.forEach(d => {
      // Simple approximation: debt shrinks slowly with min payments
      const monthlyInterest = (d.rate / 100) / 12;
      const effectiveReduction = d.minPayment - (d.balance * monthlyInterest);
      const balanceAfterPaydown = Math.max(0, d.balance - (effectiveReduction * paydownMonths));
      remainingDebtValue += balanceAfterPaydown;
    });

    const netInvestStrategy = investmentValue - remainingDebtValue;
    const netPaydownStrategy = 0; // All debt paid, but no investments
    const opportunityCostGap = netInvestStrategy - netPaydownStrategy;

    // 2. Tax-Adjusted Analysis
    const taxDeductibleDebts = debts.filter(d => d.isTaxDeductible);
    const totalTaxDeductibleBalance = taxDeductibleDebts.reduce((sum, d) => sum + d.balance, 0);
    const taxBenefit = (totalTaxDeductibleBalance * (taxRate / 100)) * 0.05; // Rough annual benefit

    // 3. Cash Flow Flexibility Score
    // Paying minimum = high flexibility, aggressive = locked in
    const flexibilityScore = (investableAmount / monthlyBudget) * 100;

    // 4. Refinance Opportunity
    const highRateDebts = debts.filter(d => d.rate > 8);
    const refinanceSavings = highRateDebts.reduce((sum, d) => {
      const currentInterest = d.balance * (d.rate / 100) * (paydownMonths / 12);
      const refinancedInterest = d.balance * (0.05) * (paydownMonths / 12); // Assume 5% refi
      return sum + (currentInterest - refinancedInterest);
    }, 0);

    // 5. Debt-to-Income Improvement
    const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
    const annualIncome = monthlyIncome * 12;
    const initialDTI = (totalDebt / annualIncome) * 100;
    const targetDTI = 30; // Industry standard
    const monthsToTargetDTI = Math.ceil((initialDTI - targetDTI) * paydownMonths / initialDTI);

    // 6. Hybrid Strategy Recommendation
    const lowRateDebts = debts.filter(d => {
      const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
      return effectiveRate < investmentRate;
    });
    const highRateDebts2 = debts.filter(d => {
      const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
      return effectiveRate >= investmentRate;
    });

    const recommendedStrategy = highRateDebts2.length > 0
      ? `Pay aggressive on ${highRateDebts2.length} high-rate debt(s), minimum on ${lowRateDebts.length} low-rate`
      : 'All debts have rates below investment return - consider minimum payments + investing';

    return {
      investmentValue,
      remainingDebtValue,
      netInvestStrategy,
      opportunityCostGap,
      taxBenefit,
      flexibilityScore,
      refinanceSavings,
      highRateDebts: highRateDebts.length,
      initialDTI,
      monthsToTargetDTI,
      recommendedStrategy,
      lowRateDebts: lowRateDebts.length,
      highRateDebts2: highRateDebts2.length
    };
  }, [isPro, debts, monthlyBudget, monthlyIncome, investmentRate, results, taxRate]);

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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Monthly Income ($)</label>
                  <input
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Used for debt-to-income calculations
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Age (Optional)</label>
                  <input
                    type="number"
                    value={age || ''}
                    placeholder="e.g. 35"
                    onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 italic">
                    Enables life-stage recommendations
                  </p>
                </div>
              </div>

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

      {/* PRO FEATURES UPGRADE CARD */}
      {!isPro && (
        <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-black">Opportunity Cost Rebalancer</h3>
            </div>
            <p className="text-emerald-50 text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock advanced analysis that compares paying extra on debt vs. investing. See when it makes mathematical sense to pay minimums and invest the difference.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Target size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Investment vs. Paydown</h4>
                <p className="text-emerald-100 text-xs font-medium">Calculate whether paying extra on 4% debt or investing at 7% creates more wealth</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Shield size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Tax-Adjusted Reality</h4>
                <p className="text-emerald-100 text-xs font-medium">Account for mortgage interest deduction and long-term capital gains rates</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Repeat size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Hybrid Strategy Designer</h4>
                <p className="text-emerald-100 text-xs font-medium">Smart rebalancing: aggressive on high-rate debt, minimum + invest on low-rate</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="bg-white text-emerald-600 px-8 py-4 rounded-2xl font-black hover:bg-emerald-50 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              Upgrade to Pro - $9/month
            </button>
          </div>
        </div>
      )}

      {/* PRO FEATURES: Opportunity Cost Rebalancer */}
      {isPro && opportunityAnalysis && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-600 text-white p-3 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Opportunity Cost Rebalancer</h3>
              <p className="text-slate-500 font-medium">Mathematical analysis of debt vs. investment trade-offs</p>
            </div>
          </div>

          {/* Life-Stage Strategic Context */}
          {age && (
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-10 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <Brain size={32} />
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-black mb-3">Life-Stage Strategic Context</h4>
                  {age < 35 && (
                    <>
                      <p className="text-amber-50 font-medium text-lg leading-relaxed mb-4">
                        At age {age}, you have significant time for compound growth. Your ${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()} debt load requires a careful balance.
                      </p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <h5 className="font-black mb-3">Early-Career Opportunity Cost</h5>
                        <p className="text-amber-50 text-sm font-medium leading-relaxed">
                          {debts.filter(d => d.rate < investmentRate).length > 0 ? (
                            <>You have {debts.filter(d => d.rate < investmentRate).length} debt(s) with rates below {investmentRate}%. Every dollar of extra payment on these debts costs you decades of compound growth. With {results.avalanche.months} months to debt-freedom, investing your ${monthlyBudget - debts.reduce((s, d) => s + d.minPayment, 0)}/month surplus could become ${(opportunityAnalysis.investmentValue * 2).toLocaleString()} by retirement (age 65). Don't sacrifice 30+ years of market returns to rush debt payoff.</>
                          ) : (
                            <>Your debts all exceed {investmentRate}% returns. At your age, eliminating these high-cost debts creates a guaranteed return better than the market. Clear your ${debts.filter(d => d.rate >= investmentRate).map(d => `${d.name} (${d.rate.toFixed(1)}%)`).join(', ')} aggressively, then redirect that ${monthlyBudget}/month into index funds for maximum compound growth over your {65 - age} working years remaining.</>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                  {age >= 35 && age < 50 && (
                    <>
                      <p className="text-amber-50 font-medium text-lg leading-relaxed mb-4">
                        At age {age}, you're in peak earning years. Your ${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()} debt requires strategic balance between freedom and growth.
                      </p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <h5 className="font-black mb-3">Mid-Career Dual Strategy</h5>
                        <p className="text-amber-50 text-sm font-medium leading-relaxed">
                          {debts.filter(d => d.rate >= investmentRate).length > 0 && debts.filter(d => d.rate < investmentRate).length > 0 ? (
                            <>Your debt portfolio splits perfectly for a hybrid approach: crush your {debts.filter(d => d.rate >= investmentRate).map(d => `${d.name} ($${d.balance.toLocaleString()} at ${d.rate.toFixed(1)}%)`).join(' and ')} with aggressive payments while paying minimums on your {debts.filter(d => d.rate < investmentRate).map(d => d.name).join(' and ')}. This captures both debt-freedom momentum AND compound growth over your {65 - age} years until retirement. Your current ${monthlyBudget}/month strategy hits debt-free in {results.hybrid.months} months.</>
                          ) : debts.filter(d => d.rate >= investmentRate).length > 0 ? (
                            <>All your debts exceed market returns. Focus on aggressive payoff of your ${debts[0].name} (highest balance: $${debts.reduce((max, d) => d.balance > max.balance ? d : max, debts[0]).balance.toLocaleString()}) first. At your career stage, eliminating debt creates financial flexibility for life changes while still leaving {65 - age} years for retirement investing after payoff.</>
                          ) : (
                            <>All your debts are below {investmentRate}% returns. At age {age}, you have {65 - age} years until traditional retirement. Paying minimums and investing the ${monthlyBudget - debts.reduce((s, d) => s + d.minPayment, 0)}/month difference captures market growth while maintaining liquidity for career moves, home upgrades, or family needs.</>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                  {age >= 50 && (
                    <>
                      <p className="text-amber-50 font-medium text-lg leading-relaxed mb-4">
                        At age {age}, entering retirement with ${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()} debt creates risk. Certainty matters more than optimal returns.
                      </p>
                      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                        <h5 className="font-black mb-3">Pre-Retirement Risk Reduction</h5>
                        <p className="text-amber-50 text-sm font-medium leading-relaxed">
                          {results.avalanche.months < (65 - age) * 12 ? (
                            <>Your current ${monthlyBudget}/month budget eliminates all debt in {results.avalanche.months} months (age {age + Math.floor(results.avalanche.months / 12)}). This gets you debt-free before retirement with {(65 - age) * 12 - results.avalanche.months} months to shift focus entirely to retirement savings. Priority: clear your ${debts.reduce((max, d) => d.rate > max.rate ? d : max, debts[0]).name} at ${debts.reduce((max, d) => d.rate > max.rate ? d : max, debts[0]).rate.toFixed(1)}% first—this ${debts.reduce((max, d) => d.rate > max.rate ? d : max, debts[0]).balance.toLocaleString()} balance costs you ${((debts.reduce((max, d) => d.rate > max.rate ? d : max, debts[0]).balance * debts.reduce((max, d) => d.rate > max.rate ? d : max, debts[0]).rate / 100) / 12).toFixed(0)}/month in interest you can't afford on fixed retirement income.</>
                          ) : (
                            <>Your timeline to debt-freedom ({results.avalanche.months} months) extends past age 65. You need to increase your paydown budget or accept carrying your ${debts.filter(d => d.rate < 5).map(d => d.name).join(' and ')} into retirement. If increasing payments isn't possible, focus ruthlessly on eliminating your ${debts.filter(d => d.rate >= 8).length} high-rate debt(s) before retirement, then refinance or manage the low-rate remainder with pension/Social Security income.</>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Investment vs Paydown Showdown */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Target size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black mb-3">The Math You Need to See</h4>
                <p className="text-indigo-50 font-medium text-lg leading-relaxed mb-6">
                  Based on your ${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()} total debt across {debts.length} account{debts.length !== 1 ? 's' : ''}, should you pay extra or invest the difference?
                </p>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-indigo-100 text-sm font-bold mb-2">Strategy A: Aggressive Paydown</p>
                    <p className="text-4xl font-black mb-2">$0</p>
                    <p className="text-indigo-100 text-xs font-medium">Debt-free but no investments after {results.avalanche.months} months</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-indigo-100 text-sm font-bold mb-2">Strategy B: Min Payments + Invest</p>
                    <p className="text-4xl font-black mb-2">${Math.round(opportunityAnalysis.netInvestStrategy).toLocaleString()}</p>
                    <p className="text-indigo-100 text-xs font-medium">
                      ${Math.round(opportunityAnalysis.investmentValue).toLocaleString()} invested - ${Math.round(opportunityAnalysis.remainingDebtValue).toLocaleString()} debt
                    </p>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <p className="text-indigo-100 text-sm font-bold mb-2">Net Wealth Difference</p>
                  <p className="text-4xl font-black mb-2">
                    {opportunityAnalysis.opportunityCostGap > 0 ? '+' : ''}${Math.round(opportunityAnalysis.opportunityCostGap).toLocaleString()}
                  </p>
                  <p className="text-indigo-100 text-xs font-medium">
                    {opportunityAnalysis.opportunityCostGap > 0
                      ? `Investing creates ${Math.round(Math.abs(opportunityAnalysis.opportunityCostGap))} more wealth despite carrying debt longer`
                      : `Aggressive paydown wins by ${Math.round(Math.abs(opportunityAnalysis.opportunityCostGap))} - your debt rates are too high`}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-sm font-black text-indigo-100 mb-2">CORTEX INSIGHT</p>
              <p className="font-medium text-white">
                {(() => {
                  const lowestRateDebt = debts.reduce((min, d) => d.rate < min.rate ? d : min, debts[0]);
                  const highestBalanceDebt = debts.reduce((max, d) => d.balance > max.balance ? d : max, debts[0]);
                  const totalDebt = debts.reduce((sum, d) => sum + d.balance, 0);
                  const dti = (totalDebt / (monthlyIncome * 12)) * 100;

                  if (lowestRateDebt.rate < investmentRate) {
                    return `Your ${lowestRateDebt.name} at ${lowestRateDebt.rate.toFixed(1)}% costs less than ${investmentRate}% market returns. Paying extra on this debt sacrifices potential wealth growth. Better strategy: minimum payment + invest difference until DTI < 30% (currently ${dti.toFixed(0)}%).`;
                  } else {
                    return `Your ${highestBalanceDebt.name} balance of $${highestBalanceDebt.balance.toLocaleString()} at ${highestBalanceDebt.rate.toFixed(1)}% is bleeding ${((highestBalanceDebt.balance * highestBalanceDebt.rate / 100) / 12).toFixed(0)}/month in interest. This debt rate exceeds ${investmentRate}% returns—aggressive paydown guaranteed to outperform the market.`;
                  }
                })()}
              </p>
            </div>
          </div>

          {/* Tax-Adjusted Reality */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-amber-100 text-amber-600 p-3 rounded-2xl">
                <Shield size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-slate-900 mb-3">Tax-Adjusted Reality</h4>
                <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
                  Some debt is tax-deductible, and investment gains are taxed. Here's the real comparison:
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                    <span className="font-bold text-slate-700">Tax-Deductible Debt Benefit</span>
                    <span className="font-black text-slate-900 text-xl">${Math.round(opportunityAnalysis.taxBenefit).toLocaleString()}/yr</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">Investment Return (after 15% cap gains)</span>
                    <span className="font-black text-slate-900 text-xl">{(investmentRate * 0.85).toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="font-bold text-slate-700">Effective Debt Cost (after tax deduction)</span>
                    <span className="font-black text-emerald-600 text-xl">
                      {debts.filter(d => d.isTaxDeductible).length > 0
                        ? `${(debts.filter(d => d.isTaxDeductible)[0].rate * (1 - taxRate / 100)).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="mt-6 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-indigo-600 text-sm font-bold mb-2">The Verdict</p>
                  <p className="text-slate-700 font-medium">
                    {opportunityAnalysis.opportunityCostGap > 10000
                      ? 'After taxes, investing beats aggressive paydown. Pay minimums on low-rate debt and invest the difference.'
                      : 'Your debt rates are high enough that aggressive paydown makes mathematical sense despite the opportunity cost.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Hybrid Strategy Designer */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Repeat size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black mb-3">Hybrid Strategy: Best of Both Worlds</h4>
                <p className="text-purple-50 font-medium text-lg leading-relaxed mb-6">
                  Based on your {debts.length} debts totaling ${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}, here's your tactical split:
                </p>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                  <h5 className="font-black mb-4 text-lg">Your Debt-Specific Action Plan</h5>
                  <div className="space-y-4 mb-4">
                    {debts.filter(d => {
                      const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                      return effectiveRate >= investmentRate;
                    }).length > 0 && (
                      <div className="bg-red-500/20 backdrop-blur-sm rounded-xl p-4 border border-red-300/30">
                        <p className="text-xs font-black text-red-100 mb-2">🔥 AGGRESSIVE PAYDOWN ZONE</p>
                        {debts.filter(d => {
                          const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                          return effectiveRate >= investmentRate;
                        }).map(d => {
                          const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                          const monthlyInterest = (d.balance * (d.rate / 100)) / 12;
                          return (
                            <p key={d.id} className="text-white text-sm font-medium mb-2">
                              • <strong>{d.name}</strong>: ${d.balance.toLocaleString()} @ {d.rate.toFixed(1)}% {d.isTaxDeductible && `(${effectiveRate.toFixed(1)}% after tax)`} — bleeding ${monthlyInterest.toFixed(0)}/month. This rate beats {investmentRate}% market returns. Every extra dollar here is guaranteed profit.
                            </p>
                          );
                        })}
                      </div>
                    )}
                    {debts.filter(d => {
                      const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                      return effectiveRate < investmentRate;
                    }).length > 0 && (
                      <div className="bg-green-500/20 backdrop-blur-sm rounded-xl p-4 border border-green-300/30">
                        <p className="text-xs font-black text-green-100 mb-2">💰 MINIMUM PAYMENT + INVEST ZONE</p>
                        {debts.filter(d => {
                          const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                          return effectiveRate < investmentRate;
                        }).map(d => {
                          const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                          const opportunityCost = (d.balance * ((investmentRate - effectiveRate) / 100)) / 12;
                          return (
                            <p key={d.id} className="text-white text-sm font-medium mb-2">
                              • <strong>{d.name}</strong>: ${d.balance.toLocaleString()} @ {d.rate.toFixed(1)}% {d.isTaxDeductible && `(${effectiveRate.toFixed(1)}% after tax)`} — costs ${opportunityCost.toFixed(0)}/month LESS than {investmentRate}% returns. Pay ${d.minPayment} minimum, invest the rest.
                            </p>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-purple-100 text-xs mb-1">High-Rate Debts (Pay Aggressive)</p>
                      <p className="text-3xl font-black">{opportunityAnalysis.highRateDebts2}</p>
                    </div>
                    <div>
                      <p className="text-purple-100 text-xs mb-1">Low-Rate Debts (Min + Invest)</p>
                      <p className="text-3xl font-black">{opportunityAnalysis.lowRateDebts}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <h6 className="font-bold text-sm mb-2">Cash Flow Flexibility Score</h6>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/20 rounded-full h-2">
                        <div
                          className="h-2 bg-white rounded-full"
                          style={{ width: `${Math.min(100, opportunityAnalysis.flexibilityScore)}%` }}
                        ></div>
                      </div>
                      <span className="font-black text-lg">{Math.round(opportunityAnalysis.flexibilityScore)}%</span>
                    </div>
                    <p className="text-purple-100 text-xs mt-2">
                      Higher = more liquid cash for emergencies or opportunities
                    </p>
                  </div>
                  {opportunityAnalysis.refinanceSavings > 1000 && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                      <h6 className="font-bold text-sm mb-2">Refinance Opportunity Alert</h6>
                      <p className="text-purple-50 text-sm">
                        Your {debts.filter(d => d.rate > 8).map(d => `${d.name} (${d.rate.toFixed(1)}%)`).join(', ')} {debts.filter(d => d.rate > 8).length === 1 ? 'is' : 'are'} bleeding at high rates. Refinancing {debts.filter(d => d.rate > 8).length === 1 ? 'this' : 'these'} to ~5% could save you{' '}
                        <span className="font-black">${Math.round(opportunityAnalysis.refinanceSavings).toLocaleString()}</span> in interest over {results.avalanche.months} months. Check personal loan consolidation or balance transfer offers.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-sm font-black text-purple-100 mb-2">CORTEX INSIGHT</p>
              <p className="font-medium text-white">
                {(() => {
                  const highRateDebt = debts.find(d => {
                    const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                    return effectiveRate >= investmentRate;
                  });
                  const lowRateDebt = debts.find(d => {
                    const effectiveRate = d.isTaxDeductible ? d.rate * (1 - taxRate / 100) : d.rate;
                    return effectiveRate < investmentRate;
                  });

                  if (highRateDebt && lowRateDebt) {
                    return `Your ${highRateDebt.name} at ${highRateDebt.rate.toFixed(1)}% bleeds wealth while your ${lowRateDebt.name} at ${lowRateDebt.rate.toFixed(1)}% costs less than market returns. Crush the ${highRateDebt.name} with your full ${monthlyBudget}/month, then shift to the hybrid model. This captures both debt-freedom momentum AND compound growth.`;
                  } else if (highRateDebt) {
                    return `All ${debts.length} of your debts exceed ${investmentRate}% market returns. With a combined balance of $${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()}, aggressive paydown is your guaranteed best return. No hybrid needed—pure debt elimination wins here.`;
                  } else {
                    return `None of your ${debts.length} debts justify aggressive paydown over investing. Your total $${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()} balance at sub-${investmentRate}% rates is "cheap debt." Pay minimums, invest the ${monthlyBudget - debts.reduce((s, d) => s + d.minPayment, 0)}/month difference, and let compound interest do the heavy lifting.`;
                  }
                })()}
              </p>
            </div>
          </div>

          {/* Debt-to-Income Tracker */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
                <TrendingDown size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-slate-900 mb-3">Debt-to-Income Trajectory</h4>
                <p className="text-slate-600 font-medium text-lg leading-relaxed mb-6">
                  With ${debts.reduce((sum, d) => sum + d.balance, 0).toLocaleString()} debt and ${monthlyIncome.toLocaleString()}/month income, here's your DTI path to financial optionality:
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                    <p className="text-slate-500 text-sm font-bold mb-2">Current DTI</p>
                    <p className="text-4xl font-black text-slate-900">{opportunityAnalysis.initialDTI.toFixed(0)}%</p>
                    <p className="text-slate-500 text-xs mt-2">
                      {opportunityAnalysis.initialDTI > 43 ? 'High - limits loan options' : opportunityAnalysis.initialDTI > 36 ? 'Moderate' : 'Excellent - strong position'}
                    </p>
                  </div>
                  <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                    <p className="text-indigo-600 text-sm font-bold mb-2">Target DTI</p>
                    <p className="text-4xl font-black text-slate-900">30%</p>
                    <p className="text-slate-500 text-xs mt-2">Industry standard for strong credit</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100">
                    <p className="text-emerald-600 text-sm font-bold mb-2">Months to Target</p>
                    <p className="text-4xl font-black text-slate-900">{opportunityAnalysis.monthsToTargetDTI}</p>
                    <p className="text-slate-500 text-xs mt-2">Following hybrid strategy</p>
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
