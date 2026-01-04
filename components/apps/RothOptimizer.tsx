"use client";

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Area, AreaChart
} from 'recharts';
import {
  TrendingDown,
  Scale,
  RefreshCw,
  Zap,
  Target,
  Info,
  ArrowLeftRight,
  TrendingUp,
  History,
  Lock,
  Calendar,
  DollarSign
} from 'lucide-react';

// 2024 Federal Brackets for Single Filer (Simplified)
const TAX_BRACKETS = [
  { label: '10%', cap: 11600, rate: 0.10 },
  { label: '12%', cap: 47150, rate: 0.12 },
  { label: '22%', cap: 100525, rate: 0.22 },
  { label: '24%', cap: 191950, rate: 0.24 },
  { label: '32%', cap: 243725, rate: 0.32 },
  { label: '35%', cap: 609350, rate: 0.35 },
  { label: '37%', cap: Infinity, rate: 0.37 },
];

const STANDARD_DEDUCTION = 14600;

const calculateTaxes = (taxableIncome: number) => {
  if (taxableIncome <= 0) return 0;
  let income = Math.max(0, taxableIncome - STANDARD_DEDUCTION);
  let tax = 0;
  let prevCap = 0;
  for (const b of TAX_BRACKETS) {
    const chunk = Math.min(income, b.cap - prevCap);
    tax += chunk * b.rate;
    income -= chunk;
    prevCap = b.cap;
    if (income <= 0) break;
  }
  return tax;
};

interface RothOptimizerProps {
  isPro?: boolean;
  onUpgrade?: () => void;
}

export default function RothOptimizer({ isPro = false, onUpgrade }: RothOptimizerProps) {
  const [inputs, setInputs] = useState({
    currentAge: 55,
    retirementAge: 62,
    endAge: 95,
    annualSpending: 100000,
    inflationRate: 3.0,
    avgReturn: 7.0,
    balances: {
      taxable: 400000,
      traditional: 1500000,
      roth: 200000
    },
    ssAmount: 42000,
    ssStartAge: 67,
    isAutoOptimize: false,
    targetBracketIndex: 1,
    manualConvAmount: 0,
    sequenceRisk: false,
    showComparison: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Gating logic: Intercept interaction for Pro features if user is on Free tier
    if ((name === 'isAutoOptimize' || name === 'showComparison') && !isPro && checked) {
      return;
    }

    const val = type === 'checkbox' ? checked : (isNaN(parseFloat(value)) ? value : parseFloat(value));

    if (name.includes('.')) {
      const [cat, field] = name.split('.');
      if (cat === 'balances') {
        setInputs(prev => ({ ...prev, balances: { ...prev.balances, [field]: val as number } }));
      }
    } else {
      setInputs(prev => ({ ...prev, [name]: val as any }));
    }
  };

  const runSimulation = (simInputs: typeof inputs, useLadder: boolean) => {
    const data = [];
    let balances = { ...simInputs.balances };

    for (let year = 0; year <= (simInputs.endAge - simInputs.currentAge); year++) {
      const age = simInputs.currentAge + year;
      const isRetired = age >= simInputs.retirementAge;
      const inflationFactor = Math.pow(1 + simInputs.inflationRate / 100, year);

      const yr: any = {
        age,
        year: new Date().getFullYear() + year,
        spending: isRetired ? simInputs.annualSpending * inflationFactor : 0,
        ssIncome: age >= simInputs.ssStartAge ? simInputs.ssAmount * inflationFactor : 0,
        conversion: 0,
        withdrawals: { taxable: 0, traditional: 0, roth: 0 },
        taxes: 0,
        rmd: 0,
      };

      let taxableIncome = yr.ssIncome * 0.85;
      let cashGap = Math.max(0, yr.spending - yr.ssIncome);

      if (age >= 73) {
        const divisor = 26.5 - (age - 73);
        yr.rmd = Math.max(0, balances.traditional / Math.max(divisor, 6));
        const takeRmd = Math.min(balances.traditional, yr.rmd);
        balances.traditional -= takeRmd;
        yr.withdrawals.traditional += takeRmd;
        taxableIncome += takeRmd;
        cashGap = Math.max(0, cashGap - takeRmd);
      }

      if (useLadder && age < 73 && balances.traditional > 0) {
        let amountToConvert = 0;
        if (simInputs.isAutoOptimize && isPro) {
          const targetCap = TAX_BRACKETS[simInputs.targetBracketIndex].cap + STANDARD_DEDUCTION;
          amountToConvert = Math.max(0, targetCap - taxableIncome);
          amountToConvert = Math.min(balances.traditional, amountToConvert);
        } else {
          amountToConvert = Math.min(balances.traditional, simInputs.manualConvAmount);
        }

        balances.traditional -= amountToConvert;
        balances.roth += amountToConvert;
        yr.conversion = amountToConvert;
        taxableIncome += amountToConvert;
      }

      ['taxable', 'traditional', 'roth'].forEach(type => {
        if (cashGap > 0) {
          const take = Math.min(balances[type as keyof typeof balances], cashGap);
          balances[type as keyof typeof balances] -= take;
          yr.withdrawals[type] += take;
          cashGap -= take;
          if (type === 'traditional') taxableIncome += take;
        }
      });

      yr.taxes = calculateTaxes(taxableIncome);
      yr.taxableIncome = taxableIncome;
      if (balances.taxable >= yr.taxes) {
        balances.taxable -= yr.taxes;
      } else {
        const diff = yr.taxes - balances.taxable;
        balances.taxable = 0;
        balances.roth = Math.max(0, balances.roth - diff);
      }

      let mktReturn = simInputs.avgReturn / 100;
      if (simInputs.sequenceRisk && age >= simInputs.retirementAge && age < simInputs.retirementAge + 3) {
        mktReturn = -0.12;
      }

      Object.keys(balances).forEach(k => balances[k as keyof typeof balances] *= (1 + mktReturn));
      yr.totalBalance = Math.max(0, balances.taxable + balances.traditional + balances.roth);
      yr.balances = { ...balances };
      data.push(yr);
    }
    return data;
  };

  const { activeSim, baselineSim, stats, conversionYears } = useMemo(() => {
    const activeData = runSimulation(inputs, true);
    const baselineData = runSimulation(inputs, false);

    const activeLast = activeData[activeData.length - 1];
    const baseLast = baselineData[baselineData.length - 1];

    const activeTax = activeData.reduce((acc, curr) => acc + curr.taxes, 0);
    const baseTax = baselineData.reduce((acc, curr) => acc + curr.taxes, 0);

    // Extract conversion years for the action plan
    const conversions = activeData
      .filter(d => d.conversion > 0)
      .map(d => ({
        age: d.age,
        year: d.year,
        amount: d.conversion,
        taxableIncome: d.taxableIncome,
        taxes: d.taxes
      }));

    return {
      activeSim: activeData,
      baselineSim: baselineData,
      conversionYears: conversions,
      stats: {
        activeLegacy: activeLast.totalBalance,
        baseLegacy: baseLast.totalBalance,
        activeTax,
        baseTax,
        legacyDelta: activeLast.totalBalance - baseLast.totalBalance,
        taxDelta: baseTax - activeTax,
        activeFail: activeData.find(d => d.totalBalance <= 0)?.age,
        baseFail: baselineData.find(d => d.totalBalance <= 0)?.age,
      }
    };
  }, [inputs, isPro]);

  return (
    <div className="space-y-8">
      {/* Header Metrics */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1">
              Tax Savings <TrendingDown size={10} className="text-emerald-500"/>
            </p>
            <p className="text-xl font-black text-emerald-600">${Math.round(stats.taxDelta).toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center justify-end gap-1">
              Legacy Gain <TrendingUp size={10} className="text-indigo-500"/>
            </p>
            <p className="text-xl font-black text-indigo-600">${Math.round(stats.legacyDelta).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls - Left Column */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Optimization Engine */}
          <div className="bg-indigo-900 text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <RefreshCw size={120} />
            </div>

            <h3 className="text-lg font-black mb-6 flex items-center gap-2">
              <Scale size={20} /> Optimization Strategy
            </h3>

            <div className="space-y-6 relative z-10">
              <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${!isPro ? 'bg-indigo-800/30 border-indigo-700 opacity-80' : 'bg-indigo-800/50 border-indigo-700'}`}>
                <div>
                  <p className="font-bold flex items-center gap-2">
                    Auto-Optimize Ladder
                    {!isPro && <Lock size={12} className="text-amber-400" />}
                  </p>
                  <p className="text-[10px] text-indigo-300 uppercase font-black">Maximize tax brackets</p>
                </div>
                <input
                  type="checkbox" name="isAutoOptimize"
                  checked={inputs.isAutoOptimize} onChange={handleInputChange}
                  disabled={!isPro}
                  className="w-6 h-6 rounded-lg accent-indigo-400 disabled:cursor-not-allowed"
                />
              </div>

              {!isPro && (
                <button
                  onClick={onUpgrade}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-indigo-950 text-xs font-black py-2 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Zap size={14} fill="currentColor" /> Upgrade to Pro for Auto-Optimization
                </button>
              )}

              {(inputs.isAutoOptimize && isPro) ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Target Bracket</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map(idx => (
                      <button
                        key={idx}
                        onClick={() => setInputs(p => ({...p, targetBracketIndex: idx}))}
                        className={`py-2 px-1 rounded-xl text-xs font-black transition-all ${inputs.targetBracketIndex === idx ? 'bg-white text-indigo-900 shadow-lg' : 'bg-indigo-800 text-indigo-300 hover:bg-indigo-700'}`}
                      >
                        {TAX_BRACKETS[idx].label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-indigo-200 uppercase mb-2 block">Manual Annual Conversion</label>
                  <input
                    type="number" name="manualConvAmount" value={inputs.manualConvAmount} onChange={handleInputChange}
                    className="w-full px-4 py-2.5 bg-indigo-800 border-none rounded-2xl text-white font-bold"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Basic Settings */}
          <div className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Retire Age</label>
                <input
                  type="number"
                  name="retirementAge"
                  value={inputs.retirementAge}
                  onChange={handleInputChange}
                  min="55"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
                <p className="text-[9px] text-slate-400 mt-1">Min: 55</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Annual Spend</label>
                <input type="number" name="annualSpending" value={inputs.annualSpending} onChange={handleInputChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Portfolio Breakdown</h3>
              {['taxable', 'traditional', 'roth'].map(t => (
                <div key={t} className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-slate-400">{t}</span>
                  <input type="number" name={`balances.${t}`} value={inputs.balances[t as keyof typeof inputs.balances]} onChange={handleInputChange} className="bg-slate-50 border-none text-right font-bold w-32 px-3 py-1 rounded-lg" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className={`flex items-center justify-between ${!isPro ? 'opacity-50' : ''}`}>
                <label className="text-xs font-black text-slate-400 uppercase flex items-center gap-2">
                  Compare Mode
                  {!isPro && <Lock size={12} />}
                </label>
                <input
                  type="checkbox"
                  name="showComparison"
                  checked={inputs.showComparison}
                  onChange={handleInputChange}
                  disabled={!isPro}
                  className="w-5 h-5 accent-indigo-600 disabled:cursor-not-allowed"
                />
              </div>
              {!isPro && (
                <p className="text-[10px] font-bold text-indigo-600 mt-2">Available in Pro tier</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Analytics */}
        <main className="lg:col-span-8 space-y-6">
          {/* Conversion Action Plan */}
          {conversionYears.length > 0 && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-emerald-600" size={28} />
                <div>
                  <h3 className="text-xl font-black text-emerald-900">Your Conversion Action Plan</h3>
                  <p className="text-sm text-emerald-700 font-medium">Year-by-year conversion strategy to implement</p>
                </div>
              </div>

              <div className="space-y-3">
                {conversionYears.slice(0, 10).map((conv, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-emerald-100 flex items-center justify-between hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 text-emerald-700 font-black text-sm rounded-xl px-3 py-2 min-w-[80px] text-center">
                        Age {conv.age}
                      </div>
                      <div>
                        <div className="font-black text-slate-900">Convert ${conv.amount.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 font-medium">
                          Taxable income: ${Math.round(conv.taxableIncome).toLocaleString()} • Tax owed: ${Math.round(conv.taxes).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-600">{conv.year}</div>
                    </div>
                  </div>
                ))}
                {conversionYears.length > 10 && (
                  <p className="text-xs text-slate-500 text-center font-medium pt-2">
                    + {conversionYears.length - 10} more years of conversions
                  </p>
                )}
              </div>

              <div className="mt-6 p-4 bg-white rounded-2xl border-2 border-blue-100">
                <div className="flex items-start gap-2">
                  <Info className="text-blue-600 mt-0.5" size={16} />
                  <div className="text-xs text-blue-900 font-medium">
                    <strong className="font-black">How to implement:</strong> Each year listed above, convert the specified amount from your Traditional IRA/401(k) to your Roth IRA.
                    You'll pay taxes on the conversion that year, but all future growth and withdrawals will be tax-free. Make sure to have cash available to pay the taxes from your taxable account.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conversion Timeline Visualization */}
          {conversionYears.length > 0 && (
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Annual Conversion Amounts</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={conversionYears}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="age"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Age', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => `$${Number(v).toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }}
                  />
                  <Bar dataKey="amount" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Comparison Metrics */}
          {inputs.showComparison && isPro && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-emerald-800 font-black text-lg">Total Tax Savings</p>
                  <p className="text-emerald-600 text-xs font-bold uppercase">Optimized vs. Baseline</p>
                </div>
                <p className="text-3xl font-black text-emerald-600 tracking-tighter">${Math.round(stats.taxDelta).toLocaleString()}</p>
              </div>
              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex items-center justify-between">
                <div>
                  <p className="text-indigo-800 font-black text-lg">Added Estate Legacy</p>
                  <p className="text-indigo-600 text-xs font-bold uppercase">Optimized vs. Baseline</p>
                </div>
                <p className="text-3xl font-black text-indigo-600 tracking-tighter">${Math.round(stats.legacyDelta).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Portfolio Balance Over Time */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Portfolio Balance Over Time</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={activeSim}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="age" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                <Legend />
                <Line type="monotone" dataKey="totalBalance" stroke="#4f46e5" strokeWidth={3} name="Total Portfolio" dot={false} />
                {inputs.showComparison && isPro && (
                  <Line type="monotone" dataKey="totalBalance" data={baselineSim} stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="Without Conversion" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tax Comparison Over Time */}
          {inputs.showComparison && isPro && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase mb-4 tracking-widest">Annual Tax Burden</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activeSim}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="age" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '2px solid #e2e8f0' }} />
                  <Legend />
                  <Area type="monotone" dataKey="taxes" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="With Conversion Ladder" />
                  <Area type="monotone" dataKey="taxes" data={baselineSim} stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Without Conversion" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
