"use client";

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
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
  Lock
} from 'lucide-react';
import NumberInput from '@/components/ui/NumberInput';
import { C, bracketTax, ssTaxable } from '@/lib/tax/taxEngine2026';

// 2026 single-filer brackets from the shared tax engine, reshaped to the
// { label, cap, rate } form the bracket-target UI expects.
const TAX_BRACKETS = C.ordinary.single.map(([start, rate], i, arr) => ({
  label: `${Math.round(rate * 100)}%`,
  cap: i + 1 < arr.length ? arr[i + 1][0] : Infinity,
  rate,
}));

const STANDARD_DEDUCTION = C.stdDed.single;

// IRS Uniform Lifetime Table (simplified for RMD age 73+)
const RMD_TABLE: Record<number, number> = {
  73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
  81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7,
  89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4,
  97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4
};

// Brackets and the standard deduction are inflation-indexed in real life.
// Deflating income to base-year dollars, taxing it, and re-inflating is
// equivalent to scaling every bracket threshold (and the deduction) by the
// same inflation factor the sim applies to spending and Social Security.
const calculateTaxes = (taxableIncome: number, inflationFactor: number) => {
  if (taxableIncome <= 0) return 0;
  const realIncome = Math.max(0, taxableIncome / inflationFactor - STANDARD_DEDUCTION);
  return bracketTax(realIncome, C.ordinary.single) * inflationFactor;
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

  // Checkbox-only handler; numeric fields use <NumberInput> with direct setters.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    // Gating logic: Intercept interaction for Pro features if user is on Free tier
    if ((name === 'isAutoOptimize' || name === 'showComparison') && !isPro && checked) {
      return;
    }

    setInputs(prev => ({ ...prev, [name]: checked }));
  };

  const setField = (name: string) => (n: number) =>
    setInputs(prev => ({ ...prev, [name]: n }));

  const runSimulation = (simInputs: typeof inputs, useLadder: boolean) => {
    const data = [];
    let balances = { ...simInputs.balances };
    // SECURE 2.0: RMDs start at 75 for anyone born 1960 or later.
    const birthYear = new Date().getFullYear() - simInputs.currentAge;
    const rmdStartAge = birthYear >= 1960 ? 75 : 73;
    // Tax that no account could cover — carried forward, never forgiven.
    let unpaidTax = 0;

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
        unpaidTax: 0,
      };

      let otherIncome = 0; // ordinary income other than Social Security
      let cashGap = Math.max(0, yr.spending - yr.ssIncome);

      if (age >= rmdStartAge) {
        const divisor = RMD_TABLE[Math.min(age, 100)] || 6.4;
        yr.rmd = Math.max(0, balances.traditional / divisor);
        const takeRmd = Math.min(balances.traditional, yr.rmd);
        balances.traditional -= takeRmd;
        yr.withdrawals.traditional += takeRmd;
        otherIncome += takeRmd;
        // RMD cash beyond this year's spending gap doesn't evaporate — it
        // lands in the taxable account. The tax on it is settled from the
        // taxable account in the tax step below, so the redeposit ends up
        // net of the tax charged on it.
        const excessRmd = Math.max(0, takeRmd - cashGap);
        balances.taxable += excessRmd;
        cashGap = Math.max(0, cashGap - takeRmd);
      }

      // Conversions only start at retirement: the model has no wage income,
      // so converting during working years would be taxed from the bottom
      // brackets up — far below the real marginal cost on top of a salary.
      if (useLadder && isRetired && age < rmdStartAge && balances.traditional > 0) {
        let amountToConvert = 0;
        if (simInputs.isAutoOptimize && isPro) {
          // Bracket caps are indexed with inflation like the engine brackets.
          const targetCap = (TAX_BRACKETS[simInputs.targetBracketIndex].cap + STANDARD_DEDUCTION) * inflationFactor;
          // Spending pulled from the traditional account later this year is
          // also taxable — reserve that headroom or the conversion busts the
          // target bracket once the taxable account runs dry.
          const estTradWithdrawal = Math.max(0, cashGap - balances.taxable);
          const estTaxableSS = ssTaxable(yr.ssIncome, otherIncome + estTradWithdrawal, 0, 'single');
          amountToConvert = Math.max(0, targetCap - otherIncome - estTaxableSS - estTradWithdrawal);
          amountToConvert = Math.min(balances.traditional, amountToConvert);
        } else {
          amountToConvert = Math.min(balances.traditional, Math.max(0, simInputs.manualConvAmount));
        }

        balances.traditional -= amountToConvert;
        balances.roth += amountToConvert;
        yr.conversion = amountToConvert;
        otherIncome += amountToConvert;
      }

      ['taxable', 'traditional', 'roth'].forEach(type => {
        if (cashGap > 0) {
          const take = Math.min(balances[type as keyof typeof balances], cashGap);
          balances[type as keyof typeof balances] -= take;
          yr.withdrawals[type] += take;
          cashGap -= take;
          if (type === 'traditional') otherIncome += take;
        }
      });

      // Taxable Social Security per the IRC §86 worksheet, not a flat 85%.
      const taxableSS = ssTaxable(yr.ssIncome, otherIncome, 0, 'single');
      yr.taxes = calculateTaxes(otherIncome + taxableSS, inflationFactor);

      // Pay taxes (this year's plus any carried shortfall) from taxable,
      // then Roth, then traditional. Whatever no account can cover is
      // carried forward as an unpaid shortfall — never silently forgiven.
      let taxDue = yr.taxes + unpaidTax;
      (['taxable', 'roth', 'traditional'] as const).forEach(type => {
        const pay = Math.min(balances[type], taxDue);
        balances[type] -= pay;
        taxDue -= pay;
      });
      unpaidTax = taxDue;
      yr.unpaidTax = unpaidTax;

      let mktReturn = simInputs.avgReturn / 100;
      if (simInputs.sequenceRisk && age >= simInputs.retirementAge && age < simInputs.retirementAge + 3) {
        mktReturn = -0.12;
      }

      Object.keys(balances).forEach(k => balances[k as keyof typeof balances] *= (1 + mktReturn));
      yr.totalBalance = Math.max(0, balances.taxable + balances.traditional + balances.roth - unpaidTax);
      yr.balances = { ...balances };
      data.push(yr);
    }
    return data;
  };

  const { activeSim, baselineSim, stats } = useMemo(() => {
    const activeData = runSimulation(inputs, true);
    const baselineData = runSimulation(inputs, false);

    const activeLast = activeData[activeData.length - 1];
    const baseLast = baselineData[baselineData.length - 1];

    const activeTax = activeData.reduce((acc, curr) => acc + curr.taxes, 0);
    const baseTax = baselineData.reduce((acc, curr) => acc + curr.taxes, 0);

    return {
      activeSim: activeData,
      baselineSim: baselineData,
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
        <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-4 rounded-lg shadow-[var(--shadow-card)] flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-end gap-1">
              Tax Savings <TrendingDown size={10} className="text-[var(--teal-green)]"/>
            </p>
            <p className="text-xl font-bold text-[var(--teal-green)]">${Math.round(stats.taxDelta).toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-[var(--border-default)]" />
          <div className="text-right">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center justify-end gap-1">
              Legacy Gain <TrendingUp size={10} className="text-[var(--teal-green)]"/>
            </p>
            <p className="text-xl font-bold text-[var(--teal-green)]">${Math.round(stats.legacyDelta).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls - Left Column */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Optimization Engine */}
          <div className="mgm-band p-6 text-white shadow-[var(--shadow-card-hover)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
              <RefreshCw size={120} />
            </div>

            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Scale size={20} /> Optimization Strategy
            </h3>

            <div className="space-y-6 relative z-10">
              <div className={`flex items-center justify-between p-4 rounded-lg border transition-all ${!isPro ? 'bg-white/5 border-white/15 opacity-80' : 'bg-white/10 border-white/20'}`}>
                <div>
                  <p className="font-bold flex items-center gap-2">
                    Auto-Optimize Ladder
                    {!isPro && <Lock size={12} className="text-[var(--yellow)]" />}
                  </p>
                  <p className="text-[10px] text-white/70 uppercase font-semibold">Maximize tax brackets</p>
                </div>
                <input
                  type="checkbox" name="isAutoOptimize"
                  checked={inputs.isAutoOptimize} onChange={handleInputChange}
                  disabled={!isPro}
                  className="w-6 h-6 rounded accent-[var(--sky)] disabled:cursor-not-allowed"
                />
              </div>

              {!isPro && (
                <button
                  onClick={onUpgrade}
                  className="w-full mgm-btn mgm-btn--primary mgm-btn--sm"
                >
                  <Zap size={14} fill="currentColor" /> Upgrade to Pro for Auto-Optimization
                </button>
              )}

              {(inputs.isAutoOptimize && isPro) ? (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/70 uppercase tracking-widest">Target Bracket</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[0, 1, 2].map(idx => (
                      <button
                        key={idx}
                        onClick={() => setInputs(p => ({...p, targetBracketIndex: idx}))}
                        className={`py-2 px-1 rounded text-xs font-bold transition-all ${inputs.targetBracketIndex === idx ? 'bg-white text-[var(--navy)] shadow-[var(--shadow-card)]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                      >
                        {TAX_BRACKETS[idx].label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-bold text-white/70 uppercase mb-2 block">Manual Annual Conversion</label>
                  <NumberInput
                    min={0} value={inputs.manualConvAmount} onValueChange={setField('manualConvAmount')}
                    className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded text-white font-bold outline-none focus:border-[var(--sky)]"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Basic Settings */}
          <div className="bg-[var(--bg-card)] p-7 rounded-lg border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Current Age</label>
                <NumberInput min={18} max={100} value={inputs.currentAge} onValueChange={setField('currentAge')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Retire Age</label>
                <NumberInput min={18} max={100} value={inputs.retirementAge} onValueChange={setField('retirementAge')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Plan To Age</label>
                <NumberInput min={60} max={110} value={inputs.endAge} onValueChange={setField('endAge')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Annual Spend</label>
                <NumberInput min={0} value={inputs.annualSpending} onValueChange={setField('annualSpending')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Avg Return %</label>
                <NumberInput step={0.1} value={inputs.avgReturn} onValueChange={setField('avgReturn')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Inflation %</label>
                <NumberInput step={0.1} value={inputs.inflationRate} onValueChange={setField('inflationRate')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Annual Soc. Sec.</label>
                <NumberInput min={0} value={inputs.ssAmount} onValueChange={setField('ssAmount')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">SS Start Age</label>
                <NumberInput min={62} max={70} value={inputs.ssStartAge} onValueChange={setField('ssStartAge')} className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">Portfolio Breakdown</h3>
              {['taxable', 'traditional', 'roth'].map(t => (
                <div key={t} className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">{t}</span>
                  <NumberInput min={0} value={inputs.balances[t as keyof typeof inputs.balances]} onValueChange={(n) => setInputs(prev => ({ ...prev, balances: { ...prev.balances, [t]: n } }))} className="w-32 px-3 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-lg text-right font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">
                  Sequence Risk Stress Test
                </label>
                <input
                  type="checkbox"
                  name="sequenceRisk"
                  checked={inputs.sequenceRisk}
                  onChange={handleInputChange}
                  className="w-5 h-5 accent-[var(--navy)]"
                />
              </div>
              <p className="text-[10px] font-medium text-[var(--text-muted)] mt-2">Models a −12% market in the first 3 years of retirement.</p>
            </div>

            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <div className={`flex items-center justify-between ${!isPro ? 'opacity-50' : ''}`}>
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase flex items-center gap-2">
                  Compare Mode
                  {!isPro && <Lock size={12} />}
                </label>
                <input
                  type="checkbox"
                  name="showComparison"
                  checked={inputs.showComparison}
                  onChange={handleInputChange}
                  disabled={!isPro}
                  className="w-5 h-5 accent-[var(--navy)] disabled:cursor-not-allowed"
                />
              </div>
              {!isPro && (
                <p className="text-[10px] font-bold text-[var(--emerald-500)] mt-2">Available in Pro tier</p>
              )}
            </div>
          </div>
        </aside>

        {/* Main Analytics */}
        <main className="lg:col-span-8 space-y-6">
          {/* Comparison Metrics */}
          {inputs.showComparison && isPro && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="bg-[var(--emerald-50)] border border-[var(--emerald-border-soft)] p-6 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[var(--emerald-500)] font-bold text-lg">Total Tax Savings</p>
                  <p className="text-[var(--emerald-500)] text-xs font-bold uppercase">Optimized vs. Baseline</p>
                </div>
                <p className="text-3xl font-bold text-[var(--emerald-500)] tracking-tighter">${Math.round(stats.taxDelta).toLocaleString()}</p>
              </div>
              <div className="bg-[var(--emerald-50)] border border-[var(--emerald-border-soft)] p-6 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[var(--text-primary)] font-bold text-lg">Added Estate Legacy</p>
                  <p className="text-[var(--emerald-500)] text-xs font-bold uppercase">Optimized vs. Baseline</p>
                </div>
                <p className="text-3xl font-bold text-[var(--emerald-500)] tracking-tighter">${Math.round(stats.legacyDelta).toLocaleString()}</p>
              </div>
            </div>
          )}

          {/* Performance Over Time */}
          <div className="bg-[var(--bg-card)] p-8 rounded-lg border border-[var(--border-default)] shadow-[var(--shadow-card)] relative overflow-hidden">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
              <History className="text-[var(--navy)]" /> Portfolio Value Comparison
            </h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeSim.map((d, i) => ({
                  age: d.age,
                  optimized: d.totalBalance,
                  baseline: baselineSim[i].totalBalance
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-default)" />
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 11, fontWeight: 'bold'}} tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-card-hover)'}} formatter={(v) => `$${Math.round(Number(v) || 0).toLocaleString()}`}/>
                  <Legend />
                  <Line type="monotone" dataKey="optimized" stroke="var(--chart-emerald)" strokeWidth={3} dot={false} name="Current Strategy" />
                  {isPro && <Line type="monotone" dataKey="baseline" stroke="var(--navy)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Standard (No Ladder)" />}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {!isPro && (
              <div className="absolute inset-0 bg-[var(--bg-card)]/70 flex items-center justify-center">
                <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-[var(--shadow-card-hover)] border border-[var(--border-default)] text-center max-w-xs relative z-20">
                  <div className="w-12 h-12 bg-[var(--color-warning-soft)] text-[var(--color-warning)] rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Lock size={24} />
                  </div>
                  <h4 className="font-bold text-[var(--text-primary)] mb-2">Comparison Locked</h4>
                  <p className="text-xs text-[var(--text-tertiary)] font-medium mb-6">Upgrade to Pro to see how your strategy compares to doing nothing.</p>
                  <button
                    onClick={onUpgrade}
                    className="w-full mgm-btn mgm-btn--primary mgm-btn--md"
                  >
                    Unlock Comparison
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Strategic Comparison Verdict */}
          <div className="mgm-band p-10 text-white shadow-[var(--shadow-card-hover)] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ArrowLeftRight size={120} />
            </div>
            <h3 className="text-2xl font-bold mb-8 relative z-10">Strategic Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              <div>
                <p className="text-white/70 font-bold text-xs uppercase tracking-widest mb-4">Standard Logic</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm font-medium opacity-80">
                    <div className="bg-white/10 p-1 rounded h-fit mt-1 text-[var(--crimson-400)]"><TrendingUp size={12}/></div>
                    RMDs are projected to force you into a {TAX_BRACKETS[2].label} or higher bracket later.
                  </li>
                </ul>
              </div>
              <div>
                <p className="text-[var(--sky)] font-bold text-xs uppercase tracking-widest mb-4">Active Strategy</p>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm font-medium">
                    <div className="bg-white/10 p-1 rounded h-fit mt-1 text-[var(--mint)]"><TrendingDown size={12}/></div>
                    You are {inputs.manualConvAmount > 0 ? "partially" : "not"} currently optimizing for bracket efficiency.
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <p className="text-[var(--sky)] font-bold text-xs uppercase mb-1 tracking-widest">Net Result</p>
                <p className="text-3xl font-bold">
                  {isPro ? (
                    stats.legacyDelta > 0 ? (
                      <><span className="text-[var(--mint)]">+${Math.round(stats.legacyDelta/1000).toLocaleString()}k</span> Efficiency Gain</>
                    ) : (
                      <><span className="text-white/60">Neutral</span> Result</>
                    )
                  ) : (
                    <span className="text-white/50">Pro Logic Needed</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => !isPro ? onUpgrade?.() : setInputs(p => ({...p, targetBracketIndex: p.targetBracketIndex === 1 ? 2 : 1}))}
                className="mgm-btn mgm-btn--secondary mgm-btn--white mgm-btn--md"
              >
                {!isPro ? "Upgrade to Unlock" : "Switch Target Bracket"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
