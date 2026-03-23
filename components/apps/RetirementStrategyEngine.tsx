"use client";

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  ShieldAlert,
  Calculator,
  RefreshCcw,
  AlertTriangle,
  UserCheck,
  Zap,
  Banknote,
  Lock,
  Calendar,
  Info,
  Scale
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';

// IRS Uniform Lifetime Table (simplified for RMD age 73+)
const RMD_TABLE: Record<number, number> = {
  73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
  81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7,
  89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4,
  97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4
};

// Tax brackets for optimization
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

// Simplified 2024 Federal Tax Brackets (Single Filer)
const estimateTax = (taxableIncome: number) => {
  if (taxableIncome <= 0) return 0;
  const income = Math.max(0, taxableIncome - STANDARD_DEDUCTION);

  const brackets = [
    { cap: 11600, rate: 0.10 },
    { cap: 47150, rate: 0.12 },
    { cap: 100525, rate: 0.22 },
    { cap: 191950, rate: 0.24 },
    { cap: 243725, rate: 0.32 },
    { cap: 609350, rate: 0.35 },
    { cap: Infinity, rate: 0.37 },
  ];

  let tax = 0;
  let previousCap = 0;
  for (const bracket of brackets) {
    if (income > bracket.cap) {
      tax += (bracket.cap - previousCap) * bracket.rate;
      previousCap = bracket.cap;
    } else {
      tax += (income - previousCap) * bracket.rate;
      break;
    }
  }
  return tax;
};

interface RetirementStrategyEngineProps {
  isPro?: boolean;
  isLoggedIn?: boolean;
  onUpgrade?: () => void;
  initialValues?: Record<string, unknown>;
}

export default function RetirementStrategyEngine({ isPro = false, isLoggedIn = false, onUpgrade, initialValues }: RetirementStrategyEngineProps) {
  const [inputs, setInputs] = useState({
    currentAge: 62,
    targetRetirementAge: 65,
    retirementEndAge: 95,
    annualSpending: 85000,
    inflationRate: 3.0,
    avgReturn: 6.5,
    sequenceRisk: false,
    strategy: 'taxable-first',
    balances: {
      taxable: 350000,
      traditional: 1500000,
      roth: 200000
    },
    // Social Security
    ssAmount: 35000,
    ssStartAge: 67,
    // Roth Conversion Ladder - Manual or Auto
    useAutoOptimize: false,
    targetBracketIndex: 1,
    rothConvAmount: 40000,
    rothConvStartAge: 62,
    rothConvEndAge: 72,
    ...(initialValues || {}),
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, category: string | null = null) => {
    const { name, value, type } = e.target;

    // Pro feature gating
    if (name === 'useAutoOptimize' && !isPro && type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) return; // Block enabling for free users
    }

    const val = (name === 'strategy' || name === 'sequenceRisk' || name === 'useAutoOptimize') ?
                (type === 'checkbox' ? (e.target as HTMLInputElement).checked : value) :
                parseFloat(value) || 0;

    if (category === 'balances') {
      setInputs(prev => ({
        ...prev,
        balances: { ...prev.balances, [name]: val as number }
      }));
    } else {
      setInputs(prev => ({ ...prev, [name]: val as any }));
    }
  };

  const simulationResults = useMemo(() => {
    const data: any[] = [];
    let currentBalances = { ...inputs.balances };
    let baseSpending = inputs.annualSpending;
    const years = inputs.retirementEndAge - inputs.currentAge;

    for (let year = 0; year <= years; year++) {
      const age = inputs.currentAge + year;
      const isRetired = age >= inputs.targetRetirementAge;

      const yrRes: any = {
        year: new Date().getFullYear() + year,
        age,
        startTotal: currentBalances.taxable + currentBalances.traditional + currentBalances.roth,
        withdrawn: { taxable: 0, traditional: 0, roth: 0 },
        conversions: 0,
        taxesPaid: 0,
        taxableIncome: 0,
        ssIncome: age >= inputs.ssStartAge ? inputs.ssAmount * Math.pow(1 + inputs.inflationRate/100, year) : 0,
        shortfall: 0
      };

      // 1. Calculate the Gap to fill after Social Security
      const currentYearNeed = isRetired ? baseSpending * Math.pow(1 + inputs.inflationRate/100, year) : 0;
      let remainingNeed = Math.max(0, currentYearNeed - yrRes.ssIncome);
      let taxableIncome = yrRes.ssIncome * 0.85; // Rough estimate of taxable SS

      // 2. Roth Conversion Logic (Enhanced with Pro Auto-Optimization)
      if (age >= inputs.rothConvStartAge && age <= inputs.rothConvEndAge && currentBalances.traditional > 0) {
        let potentialConv = 0;

        if (inputs.useAutoOptimize && isPro) {
          // Auto-optimize to fill tax bracket
          const targetCap = TAX_BRACKETS[inputs.targetBracketIndex].cap + STANDARD_DEDUCTION;
          potentialConv = Math.max(0, targetCap - taxableIncome);
          potentialConv = Math.min(currentBalances.traditional, potentialConv);
        } else {
          // Manual conversion amount
          potentialConv = Math.min(currentBalances.traditional, inputs.rothConvAmount);
        }

        currentBalances.traditional -= potentialConv;
        currentBalances.roth += potentialConv;
        yrRes.conversions = potentialConv;
        taxableIncome += potentialConv;
      }

      // 3. RMD Logic
      if (age >= 73) {
        const divisor = RMD_TABLE[Math.min(age, 100)] || 6.4;
        const rmd = currentBalances.traditional / divisor;
        const takeRmd = Math.min(currentBalances.traditional, rmd);
        yrRes.withdrawn.traditional += takeRmd;
        currentBalances.traditional -= takeRmd;
        taxableIncome += takeRmd;
        remainingNeed = Math.max(0, remainingNeed - takeRmd);
      }

      // 4. Fill remaining need based on Strategy
      if (inputs.strategy === 'taxable-first') {
        ['taxable', 'traditional', 'roth'].forEach(type => {
            const take = Math.min(currentBalances[type as keyof typeof currentBalances], remainingNeed);
            yrRes.withdrawn[type] += take;
            currentBalances[type as keyof typeof currentBalances] -= take;
            remainingNeed -= take;
            if (type === 'traditional') taxableIncome += take;
        });
      } else if (inputs.strategy === 'bracket-filler') {
        const targetIncome = 60000; // Target bottom of 22% bracket roughly
        const tradBuffer = Math.max(0, targetIncome - taxableIncome);
        const takeTrad = Math.min(currentBalances.traditional, tradBuffer, remainingNeed);

        yrRes.withdrawn.traditional += takeTrad;
        currentBalances.traditional -= takeTrad;
        remainingNeed -= takeTrad;
        taxableIncome += takeTrad;

        ['taxable', 'roth', 'traditional'].forEach(type => {
            const take = Math.min(currentBalances[type as keyof typeof currentBalances], remainingNeed);
            yrRes.withdrawn[type] += take;
            currentBalances[type as keyof typeof currentBalances] -= take;
            remainingNeed -= take;
            if (type === 'traditional') taxableIncome += take;
        });
      } else { // Proportional
        const total = currentBalances.taxable + currentBalances.traditional + currentBalances.roth;
        if (total > 0 && remainingNeed > 0) {
            ['taxable', 'traditional', 'roth'].forEach(type => {
                const share = (currentBalances[type as keyof typeof currentBalances] / total) * remainingNeed;
                const take = Math.min(currentBalances[type as keyof typeof currentBalances], share);
                yrRes.withdrawn[type] += take;
                currentBalances[type as keyof typeof currentBalances] -= take;
                if (type === 'traditional') taxableIncome += take;
            });
            remainingNeed = Math.max(0, remainingNeed - (yrRes.withdrawn.taxable + yrRes.withdrawn.traditional + yrRes.withdrawn.roth));
        }
      }

      yrRes.shortfall = remainingNeed;
      yrRes.taxableIncome = taxableIncome;
      yrRes.taxesPaid = estimateTax(taxableIncome);

      // Withdraw taxes from Taxable or Roth
      const taxToPull = yrRes.taxesPaid;
      if (currentBalances.taxable >= taxToPull) {
        currentBalances.taxable -= taxToPull;
      } else {
        const fromRoth = Math.min(currentBalances.roth, taxToPull - currentBalances.taxable);
        currentBalances.taxable = 0;
        currentBalances.roth -= fromRoth;
      }

      // 5. Growth
      let ret = inputs.avgReturn / 100;
      if (inputs.sequenceRisk && year < 3) ret = -0.12;

      currentBalances.taxable *= (1 + ret);
      currentBalances.traditional *= (1 + ret);
      currentBalances.roth *= (1 + ret);

      yrRes.endBalances = { ...currentBalances };
      yrRes.totalBalance = currentBalances.taxable + currentBalances.traditional + currentBalances.roth;
      data.push(yrRes);
    }
    return data;
  }, [inputs, isPro]);

  const { stats, conversionYears } = useMemo(() => {
    const totalTaxes = simulationResults.reduce((a, b) => a + b.taxesPaid, 0);
    const failPoint = simulationResults.find(r => r.totalBalance <= 0 && r.shortfall > 0);

    // Extract conversion years for action plan
    const conversions = simulationResults
      .filter(d => d.conversions > 0)
      .map(d => ({
        age: d.age,
        year: d.year,
        amount: d.conversions,
        taxableIncome: d.taxableIncome,
        taxes: d.taxesPaid
      }));

    return {
      stats: { totalTaxes, failAge: failPoint ? failPoint.age : null },
      conversionYears: conversions
    };
  }, [simulationResults]);

  return (
    <div className="space-y-8">
      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="retirement-strategy"
          toolName="Retirement Strategy Engine"
          getInputs={() => inputs}
          getKeyResult={() => `Age ${inputs.currentAge}→${inputs.targetRetirementAge}, $${inputs.annualSpending.toLocaleString()}/yr spending`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Zap size={24} fill="currentColor" />
            <span className="font-bold tracking-widest uppercase text-sm">Wealth Architecture</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900">Drawdown Strategy Engine <span className="text-indigo-600">v2</span></h1>
          <p className="text-slate-500 max-w-xl mt-2">Manage Social Security timing and Roth conversion ladders to maximize portfolio longevity.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-slate-200">
             <p className="text-xs font-bold text-slate-400 uppercase mb-1">Portfolio Status</p>
             {stats.failAge ? (
               <div className="flex items-center gap-2 text-rose-600 font-bold">
                  <AlertTriangle size={18} /> Depleted at Age {stats.failAge}
               </div>
             ) : (
               <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <ShieldAlert size={18} /> Solvent to {inputs.retirementEndAge}+
               </div>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Panel */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Age & Spending Settings */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
              <Calendar size={20} className="text-indigo-500" /> Timeline
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Age</label>
                  <input
                    type="number" name="currentAge" value={inputs.currentAge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Target Retire Age</label>
                  <input
                    type="number" name="targetRetirementAge" value={inputs.targetRetirementAge}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Annual Spending</label>
                <input
                  type="number" name="annualSpending" value={inputs.annualSpending}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Portfolio Growth Rate (%)</label>
                <input
                  type="number" name="avgReturn" value={inputs.avgReturn} step="0.1"
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                />
                <p className="text-[9px] text-slate-400 mt-1">Assumed annual return</p>
              </div>
            </div>
          </div>

          {/* Core Portfolio */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
              <Calculator size={20} className="text-indigo-500" /> Accounts
            </h3>
            <div className="space-y-4">
              {['taxable', 'traditional', 'roth'].map(type => (
                <div key={type}>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{type}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400">$</span>
                    <input
                      type="number" name={type} value={inputs.balances[type as keyof typeof inputs.balances]}
                      onChange={(e) => handleInputChange(e, 'balances')}
                      className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Security */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
              <Banknote size={20} className="text-emerald-500" /> Social Security
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Annual Amount</label>
                <input
                  type="number" name="ssAmount" value={inputs.ssAmount}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Age</label>
                <input
                  type="number" name="ssStartAge" value={inputs.ssStartAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Roth Ladder with Pro Auto-Optimization */}
          <div className="bg-indigo-50 p-6 rounded-3xl shadow-sm border border-indigo-100">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-indigo-200 pb-3 text-indigo-900">
              <RefreshCcw size={20} className="text-indigo-600" /> Roth Ladder
            </h3>

            {/* Auto-Optimize Toggle (Pro Feature) */}
            <div className={`mb-4 p-4 rounded-2xl border transition-all ${!isPro ? 'bg-indigo-100/50 border-indigo-200 opacity-80' : 'bg-white border-indigo-200'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-indigo-900 flex items-center gap-2">
                    Auto-Optimize Conversions
                    {!isPro && <Lock size={12} className="text-amber-600" />}
                  </p>
                  <p className="text-[10px] text-indigo-600 uppercase font-black">Fill tax brackets optimally</p>
                </div>
                <input
                  type="checkbox"
                  name="useAutoOptimize"
                  checked={inputs.useAutoOptimize}
                  onChange={handleInputChange}
                  disabled={!isPro}
                  className="w-6 h-6 rounded-lg accent-indigo-600 disabled:cursor-not-allowed"
                />
              </div>
              {!isPro && (
                <button
                  onClick={onUpgrade}
                  className="w-full mt-3 bg-amber-400 hover:bg-amber-500 text-indigo-950 text-xs font-black py-2 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Zap size={14} fill="currentColor" /> Upgrade to Pro
                </button>
              )}
            </div>

            {/* Target Bracket Selection (Pro only, when auto-optimize is on) */}
            {inputs.useAutoOptimize && isPro && (
              <div className="mb-4">
                <label className="text-xs font-bold text-indigo-700 uppercase tracking-widest block mb-2">Target Bracket</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(idx => (
                    <button
                      key={idx}
                      onClick={() => setInputs(p => ({...p, targetBracketIndex: idx}))}
                      className={`py-2 px-1 rounded-xl text-xs font-black transition-all ${inputs.targetBracketIndex === idx ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 hover:bg-indigo-100'}`}
                    >
                      {TAX_BRACKETS[idx].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual Conversion Settings (shown when auto-optimize is off) */}
            {!inputs.useAutoOptimize && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Annual Conv. Amount</label>
                  <input
                    type="number" name="rothConvAmount" value={inputs.rothConvAmount}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl font-medium"
                  />
                </div>
              </div>
            )}

            {/* Conversion Window (always shown) */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">Start Age</label>
                <input
                  type="number" name="rothConvStartAge" value={inputs.rothConvStartAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-600 uppercase mb-1">End Age</label>
                <input
                  type="number" name="rothConvEndAge" value={inputs.rothConvEndAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Stress Test */}
          <button
              onClick={() => setInputs(p => ({...p, sequenceRisk: !p.sequenceRisk}))}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${inputs.sequenceRisk ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-400'}`}
          >
              <div className="flex items-center gap-3">
                  <ShieldAlert size={20} />
                  <div className="text-left">
                      <p className="font-bold text-sm">Sequence Risk Stress</p>
                      <p className="text-[10px] uppercase opacity-80">Simulate Market Crash Years 1-3</p>
                  </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${inputs.sequenceRisk ? 'bg-rose-500' : 'bg-slate-200'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${inputs.sequenceRisk ? 'left-5' : 'left-1'}`} />
              </div>
          </button>
        </aside>

        {/* Visualization Area */}
        <main className="lg:col-span-8 space-y-6">
          {/* Conversion Action Plan */}
          {conversionYears.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-[2.5rem] p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-indigo-600" size={28} />
                <div>
                  <h3 className="text-xl font-black text-indigo-900">Your Conversion Action Plan</h3>
                  <p className="text-sm text-indigo-700 font-medium">Year-by-year Roth conversion strategy</p>
                </div>
              </div>

              <div className="space-y-3">
                {conversionYears.slice(0, 10).map((conv, idx) => (
                  <div key={idx} className="bg-white rounded-2xl p-4 border-2 border-indigo-100 flex items-center justify-between hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-indigo-100 text-indigo-700 font-black text-sm rounded-xl px-3 py-2 min-w-[80px] text-center">
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
                      <div className="text-xs font-bold text-indigo-600">{conv.year}</div>
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
                    You'll pay taxes on the conversion that year, but all future growth and withdrawals will be tax-free. Ensure you have cash in your taxable account to pay the taxes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Selection */}
          <div className="flex gap-2 bg-slate-200 p-1.5 rounded-2xl">
              {['taxable-first', 'bracket-filler', 'proportional'].map(s => (
                  <button
                      key={s}
                      onClick={() => setInputs(p => ({...p, strategy: s}))}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${inputs.strategy === s ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                      {s.replace('-', ' ')}
                  </button>
              ))}
          </div>

          {/* High Level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Total Lifetime Taxes</p>
                  <p className="text-2xl font-black text-slate-900">${Math.round(stats.totalTaxes).toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Portfolio Longevity</p>
                  <p className={`text-2xl font-black ${stats.failAge ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {stats.failAge ? `Age ${stats.failAge}` : `${inputs.retirementEndAge}+ Years`}
                  </p>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-1">Estate Value</p>
                  <p className="text-2xl font-black text-indigo-600">
                      ${Math.round(simulationResults[simulationResults.length - 1].totalBalance).toLocaleString()}
                  </p>
              </div>
          </div>

          {/* Balance Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black flex items-center gap-2">
                  <UserCheck className="text-indigo-600" />
                  Asset Depletion Model
                </h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"/> Taxable</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-400"/> Traditional</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Roth</span>
                </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      formatter={(val) => [`$${Math.round(Number(val) || 0).toLocaleString()}`, 'Balance']}
                  />
                  <Area type="monotone" dataKey="endBalances.taxable" stackId="1" stroke="#6366f1" fill="#818cf8" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="endBalances.traditional" stackId="1" stroke="#f59e0b" fill="#fbbf24" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="endBalances.roth" stackId="1" stroke="#10b981" fill="#34d399" fillOpacity={0.8} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income Mix Bar Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
              <h3 className="text-xl font-black mb-6">Annual Income Composition</h3>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={simulationResults}>
                          <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v) => `$${Math.round(Number(v) || 0).toLocaleString()}`} />
                          <Legend verticalAlign="top" height={36} />
                          <Bar dataKey="ssIncome" stackId="a" fill="#334155" name="Social Security" />
                          <Bar dataKey="withdrawn.taxable" stackId="a" fill="#818cf8" name="Taxable Dist." />
                          <Bar dataKey="withdrawn.traditional" stackId="a" fill="#fbbf24" name="Trad. Dist." />
                          <Bar dataKey="withdrawn.roth" stackId="a" fill="#34d399" name="Roth Dist." />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Conversions and Taxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Tax Impact</h4>
                  <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={simulationResults}>
                              <XAxis dataKey="age" hide />
                              <Bar dataKey="taxesPaid" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Annual Tax" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-indigo-900 p-6 rounded-3xl text-white">
                  <h4 className="text-sm font-bold text-indigo-300 uppercase mb-4">Roth Conversion Flow</h4>
                  <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={simulationResults}>
                              <Area type="stepAfter" dataKey="conversions" stroke="#818cf8" fill="#818cf8" fillOpacity={0.4} />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
        </main>
      </div>
      {!isPro && <ProUpsellCard toolId="retirement-strategy" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
