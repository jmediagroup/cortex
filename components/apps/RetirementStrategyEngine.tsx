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
import NumberInput from '@/components/ui/NumberInput';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';
import { C, bracketTax, ssTaxable } from '@/lib/tax/taxEngine2026';

// IRS Uniform Lifetime Table (simplified for RMD age 73+)
const RMD_TABLE: Record<number, number> = {
  73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1, 80: 20.2,
  81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4, 88: 13.7,
  89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1, 94: 9.5, 95: 8.9, 96: 8.4,
  97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4
};

// Tax brackets for optimization — single-filer 2026 brackets and standard
// deduction come from the shared tax engine (lib/tax/taxEngine2026). The
// engine stores [start, rate] pairs; convert to the cap-based shape the
// bracket-fill UI expects.
const SINGLE_BRACKETS = C.ordinary.single;
const TAX_BRACKETS = SINGLE_BRACKETS.map(([, rate], i) => ({
  label: `${Math.round(rate * 100)}%`,
  cap: i + 1 < SINGLE_BRACKETS.length ? SINGLE_BRACKETS[i + 1][0] : Infinity,
  rate,
}));

const STANDARD_DEDUCTION = C.stdDed.single;

// Federal tax on ordinary income (single filer, 2026 base year via the tax
// engine). `inflationFactor` indexes the bracket boundaries and standard
// deduction over the simulation horizon (real brackets are CPI-indexed);
// without it, inflated future spending gets taxed against frozen brackets
// and lifetime taxes are badly overstated in later years.
const estimateTax = (taxableIncome: number, inflationFactor: number = 1) => {
  if (taxableIncome <= 0) return 0;
  const income = Math.max(0, taxableIncome - STANDARD_DEDUCTION * inflationFactor);
  const indexedBrackets = SINGLE_BRACKETS.map(
    ([start, rate]) => [start * inflationFactor, rate] as [number, number]
  );
  return bracketTax(income, indexedBrackets);
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

  // Handles the select/checkbox controls ('strategy', 'sequenceRisk',
  // 'useAutoOptimize'); numeric fields use <NumberInput> with direct setters.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    // Pro feature gating
    if (name === 'useAutoOptimize' && !isPro && type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      if (checked) return; // Block enabling for free users
    }

    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setInputs(prev => ({ ...prev, [name]: val as any }));
  };

  const simulationResults = useMemo(() => {
    const data: any[] = [];
    let currentBalances = { ...inputs.balances };
    let baseSpending = inputs.annualSpending;
    const years = Math.max(0, inputs.retirementEndAge - inputs.currentAge);

    // SECURE 2.0: RMDs begin at 75 for anyone born 1960 or later, 73
    // otherwise. The sim starts this calendar year at the user's current age.
    const birthYear = new Date().getFullYear() - inputs.currentAge;
    const rmdStartAge = birthYear >= 1960 ? 75 : 73;

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
      const inflationFactor = Math.pow(1 + inputs.inflationRate/100, year);
      const currentYearNeed = isRetired ? baseSpending * inflationFactor : 0;
      let remainingNeed = Math.max(0, currentYearNeed - yrRes.ssIncome);
      // Ordinary income other than Social Security (RMDs, conversions,
      // traditional withdrawals). The taxable portion of SS is derived from
      // it via the Pub 915 worksheet once the year's withdrawals are known.
      let otherOrdinary = 0;

      // 2. RMD Logic — RMDs come first: they must be taken before any
      // conversion and their income counts toward the bracket the
      // auto-optimizer is trying to fill.
      if (age >= rmdStartAge) {
        const divisor = RMD_TABLE[Math.min(age, 100)] || 6.4;
        const rmd = currentBalances.traditional / divisor;
        const takeRmd = Math.min(currentBalances.traditional, rmd);
        yrRes.withdrawn.traditional += takeRmd;
        currentBalances.traditional -= takeRmd;
        otherOrdinary += takeRmd;
        // Excess RMD beyond this year's spending need is reinvested in the
        // taxable account (gross — its tax is charged with the rest of the
        // year's tax bill below), not destroyed.
        const excessRmd = Math.max(0, takeRmd - remainingNeed);
        currentBalances.taxable += excessRmd;
        remainingNeed = Math.max(0, remainingNeed - takeRmd);
      }

      // 3. Roth Conversion Logic (Enhanced with Pro Auto-Optimization)
      if (age >= inputs.rothConvStartAge && age <= inputs.rothConvEndAge && currentBalances.traditional > 0) {
        let potentialConv = 0;

        if (inputs.useAutoOptimize && isPro) {
          // Auto-optimize to fill tax bracket (caps indexed with inflation)
          const targetCap = (TAX_BRACKETS[inputs.targetBracketIndex].cap + STANDARD_DEDUCTION) * inflationFactor;
          const taxableSoFar = otherOrdinary + ssTaxable(yrRes.ssIncome, otherOrdinary, 0, 'single');
          potentialConv = Math.max(0, targetCap - taxableSoFar);
          potentialConv = Math.min(currentBalances.traditional, potentialConv);
        } else {
          // Manual conversion amount
          potentialConv = Math.min(currentBalances.traditional, inputs.rothConvAmount);
        }

        currentBalances.traditional -= potentialConv;
        currentBalances.roth += potentialConv;
        yrRes.conversions = potentialConv;
        otherOrdinary += potentialConv;
      }

      // 4. Fill remaining need based on Strategy
      if (inputs.strategy === 'taxable-first') {
        ['taxable', 'traditional', 'roth'].forEach(type => {
            const take = Math.min(currentBalances[type as keyof typeof currentBalances], remainingNeed);
            yrRes.withdrawn[type] += take;
            currentBalances[type as keyof typeof currentBalances] -= take;
            remainingNeed -= take;
            if (type === 'traditional') otherOrdinary += take;
        });
      } else if (inputs.strategy === 'bracket-filler') {
        const targetIncome = 60000 * inflationFactor; // Target bottom of 22% bracket roughly
        const taxableSoFar = otherOrdinary + ssTaxable(yrRes.ssIncome, otherOrdinary, 0, 'single');
        const tradBuffer = Math.max(0, targetIncome - taxableSoFar);
        const takeTrad = Math.min(currentBalances.traditional, tradBuffer, remainingNeed);

        yrRes.withdrawn.traditional += takeTrad;
        currentBalances.traditional -= takeTrad;
        remainingNeed -= takeTrad;
        otherOrdinary += takeTrad;

        ['taxable', 'roth', 'traditional'].forEach(type => {
            const take = Math.min(currentBalances[type as keyof typeof currentBalances], remainingNeed);
            yrRes.withdrawn[type] += take;
            currentBalances[type as keyof typeof currentBalances] -= take;
            remainingNeed -= take;
            if (type === 'traditional') otherOrdinary += take;
        });
      } else { // Proportional
        const total = currentBalances.taxable + currentBalances.traditional + currentBalances.roth;
        if (total > 0 && remainingNeed > 0) {
            ['taxable', 'traditional', 'roth'].forEach(type => {
                const share = (currentBalances[type as keyof typeof currentBalances] / total) * remainingNeed;
                const take = Math.min(currentBalances[type as keyof typeof currentBalances], share);
                yrRes.withdrawn[type] += take;
                currentBalances[type as keyof typeof currentBalances] -= take;
                if (type === 'traditional') otherOrdinary += take;
            });
            remainingNeed = Math.max(0, remainingNeed - (yrRes.withdrawn.taxable + yrRes.withdrawn.traditional + yrRes.withdrawn.roth));
        }
      }

      yrRes.shortfall = remainingNeed;
      // Taxable portion of Social Security via the IRC §86 / Pub 915
      // worksheet (single filer), given the year's other ordinary income.
      const taxableSS = ssTaxable(yrRes.ssIncome, otherOrdinary, 0, 'single');
      const taxableIncome = otherOrdinary + taxableSS;
      yrRes.taxableIncome = taxableIncome;
      yrRes.otherOrdinary = otherOrdinary;
      yrRes.inflationFactor = inflationFactor;
      yrRes.taxesPaid = estimateTax(taxableIncome, inflationFactor);

      // Withdraw taxes from Taxable, then Roth, then Traditional; anything
      // still uncovered is recorded as shortfall, consistent with how
      // spending depletion is tracked.
      const taxToPull = yrRes.taxesPaid;
      const taxFromTaxable = Math.min(currentBalances.taxable, taxToPull);
      currentBalances.taxable -= taxFromTaxable;
      const taxFromRoth = Math.min(currentBalances.roth, taxToPull - taxFromTaxable);
      currentBalances.roth -= taxFromRoth;
      const taxFromTrad = Math.min(currentBalances.traditional, taxToPull - taxFromTaxable - taxFromRoth);
      currentBalances.traditional -= taxFromTrad;
      yrRes.shortfall += taxToPull - taxFromTaxable - taxFromRoth - taxFromTrad;

      // 5. Growth — sequence-risk stress hits the first 3 years of
      // retirement, not the first 3 years of the simulation.
      let ret = inputs.avgReturn / 100;
      const yearsIntoRetirement = age - inputs.targetRetirementAge;
      if (inputs.sequenceRisk && yearsIntoRetirement >= 0 && yearsIntoRetirement < 3) ret = -0.12;

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
        // Marginal tax attributable to the conversion itself — the year's
        // tax with vs. without the converted amount.
        taxes: estimateTax(d.taxableIncome, d.inflationFactor ?? 1)
          - estimateTax(d.taxableIncome - d.conversions, d.inflationFactor ?? 1)
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
          <div className="flex items-center gap-2 text-[var(--emerald-500)] mb-2">
            <Zap size={24} fill="currentColor" />
            <span className="font-bold tracking-widest uppercase text-sm">Wealth Architecture</span>
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">Drawdown Strategy Engine <span className="text-[var(--emerald-500)]">v2</span></h1>
          <p className="text-[var(--text-tertiary)] max-w-xl mt-2">Manage Social Security timing and Roth conversion ladders to maximize portfolio longevity.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[var(--bg-card)] px-6 py-4 rounded-2xl shadow-sm border border-[var(--border-default)]">
             <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Portfolio Status</p>
             {stats.failAge ? (
               <div className="flex items-center gap-2 text-[var(--crimson-500)] font-bold">
                  <AlertTriangle size={18} /> Depleted at Age {stats.failAge}
               </div>
             ) : (
               <div className="flex items-center gap-2 text-[var(--emerald-500)] font-bold">
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
          <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-sm border border-[var(--border-default)]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
              <Calendar size={20} className="text-[var(--emerald-400)]" /> Timeline
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Current Age</label>
                  <NumberInput
                    name="currentAge" value={inputs.currentAge}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, currentAge: n }))}
                    min={1}
                    className="w-full px-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--emerald-500)] outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Target Retire Age</label>
                  <NumberInput
                    name="targetRetirementAge" value={inputs.targetRetirementAge}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, targetRetirementAge: n }))}
                    min={1}
                    className="w-full px-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--emerald-500)] outline-none font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Annual Spending</label>
                <NumberInput
                  name="annualSpending" value={inputs.annualSpending}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, annualSpending: n }))}
                  min={0}
                  className="w-full px-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--emerald-500)] outline-none font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Portfolio Growth Rate (%)</label>
                <NumberInput
                  name="avgReturn" value={inputs.avgReturn} step="0.1"
                  onValueChange={(n) => setInputs(prev => ({ ...prev, avgReturn: n }))}
                  className="w-full px-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--emerald-500)] outline-none font-medium"
                />
                <p className="text-[9px] text-[var(--text-muted)] mt-1">Assumed annual return</p>
              </div>
            </div>
          </div>

          {/* Core Portfolio */}
          <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-sm border border-[var(--border-default)]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
              <Calculator size={20} className="text-[var(--emerald-400)]" /> Accounts
            </h3>
            <div className="space-y-4">
              {['taxable', 'traditional', 'roth'].map(type => (
                <div key={type}>
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">{type}</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[var(--text-muted)]">$</span>
                    <NumberInput
                      name={type} value={inputs.balances[type as keyof typeof inputs.balances]}
                      onValueChange={(n) => setInputs(prev => ({ ...prev, balances: { ...prev.balances, [type]: n } }))}
                      min={0}
                      className="w-full pl-8 pr-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--emerald-500)] outline-none font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Security */}
          <div className="bg-[var(--bg-card)] p-6 rounded-3xl shadow-sm border border-[var(--border-default)]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-3">
              <Banknote size={20} className="text-[var(--emerald-500)]" /> Social Security
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Annual Amount</label>
                <NumberInput
                  name="ssAmount" value={inputs.ssAmount}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, ssAmount: n }))}
                  min={0}
                  className="w-full px-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Start Age</label>
                <NumberInput
                  name="ssStartAge" value={inputs.ssStartAge}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, ssStartAge: n }))}
                  min={1}
                  className="w-full px-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Roth Ladder with Pro Auto-Optimization */}
          <div className="bg-[var(--emerald-50)] p-6 rounded-3xl shadow-sm border border-[var(--emerald-border-soft)]">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b border-[var(--emerald-border)] pb-3 text-[var(--text-primary)]">
              <RefreshCcw size={20} className="text-[var(--emerald-500)]" /> Roth Ladder
            </h3>

            {/* Auto-Optimize Toggle (Pro Feature) */}
            <div className={`mb-4 p-4 rounded-2xl border transition-all ${!isPro ? 'bg-[var(--emerald-100)]/50 border-[var(--emerald-border)] opacity-80' : 'bg-[var(--bg-card)] border-[var(--emerald-border)]'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-[var(--text-primary)] flex items-center gap-2">
                    Auto-Optimize Conversions
                    {!isPro && <Lock size={12} className="text-[var(--color-warning)]" />}
                  </p>
                  <p className="text-[10px] text-[var(--emerald-500)] uppercase font-semibold">Fill tax brackets optimally</p>
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
                  className="w-full mt-3 bg-[var(--orange)] hover:opacity-90 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <Zap size={14} fill="currentColor" /> Upgrade to Pro
                </button>
              )}
            </div>

            {/* Target Bracket Selection (Pro only, when auto-optimize is on) */}
            {inputs.useAutoOptimize && isPro && (
              <div className="mb-4">
                <label className="text-xs font-bold text-[var(--emerald-500)] uppercase tracking-widest block mb-2">Target Bracket</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map(idx => (
                    <button
                      key={idx}
                      onClick={() => setInputs(p => ({...p, targetBracketIndex: idx}))}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition-all ${inputs.targetBracketIndex === idx ? 'bg-[var(--emerald-500)] text-white shadow-lg' : 'bg-[var(--bg-card)] text-[var(--emerald-500)] hover:bg-[var(--emerald-100)]'}`}
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
                  <label className="block text-xs font-bold text-[var(--emerald-500)] uppercase mb-1">Annual Conv. Amount</label>
                  <NumberInput
                    name="rothConvAmount" value={inputs.rothConvAmount}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, rothConvAmount: n }))}
                    min={0}
                    className="w-full px-4 py-2 bg-[var(--bg-card)] border border-[var(--emerald-border)] rounded-xl font-medium"
                  />
                </div>
              </div>
            )}

            {/* Conversion Window (always shown) */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[var(--emerald-500)] uppercase mb-1">Start Age</label>
                <NumberInput
                  name="rothConvStartAge" value={inputs.rothConvStartAge}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, rothConvStartAge: n }))}
                  min={1}
                  className="w-full px-4 py-2 bg-[var(--bg-card)] border border-[var(--emerald-border)] rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--emerald-500)] uppercase mb-1">End Age</label>
                <NumberInput
                  name="rothConvEndAge" value={inputs.rothConvEndAge}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, rothConvEndAge: n }))}
                  min={1}
                  className="w-full px-4 py-2 bg-[var(--bg-card)] border border-[var(--emerald-border)] rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Stress Test */}
          <button
              onClick={() => setInputs(p => ({...p, sequenceRisk: !p.sequenceRisk}))}
              className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${inputs.sequenceRisk ? 'bg-[var(--crimson-50)] border-[var(--crimson-border)] text-[var(--crimson-500)]' : 'bg-[var(--bg-card)] border-[var(--border-default)] text-[var(--text-muted)] hover:border-[var(--crimson-border)] hover:text-[var(--crimson-400)]'}`}
          >
              <div className="flex items-center gap-3">
                  <ShieldAlert size={20} />
                  <div className="text-left">
                      <p className="font-bold text-sm">Sequence Risk Stress</p>
                      <p className="text-[10px] uppercase opacity-80">Simulate Market Crash Years 1-3</p>
                  </div>
              </div>
              <div className={`w-10 h-6 rounded-full relative transition-colors ${inputs.sequenceRisk ? 'bg-[var(--crimson-500)]' : 'bg-[var(--bg-glass-strong)]'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-[var(--bg-card)] rounded-full transition-all ${inputs.sequenceRisk ? 'left-5' : 'left-1'}`} />
              </div>
          </button>
        </aside>

        {/* Visualization Area */}
        <main className="lg:col-span-8 space-y-6">
          {/* Conversion Action Plan */}
          {conversionYears.length > 0 && (
            <div className="bg-gradient-to-br from-[var(--emerald-50)] to-[var(--emerald-50)] border-2 border-[var(--emerald-border)] rounded-2xl p-8">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-[var(--emerald-500)]" size={28} />
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Your Conversion Action Plan</h3>
                  <p className="text-sm text-[var(--emerald-500)] font-medium">Year-by-year Roth conversion strategy</p>
                </div>
              </div>

              <div className="space-y-3">
                {conversionYears.slice(0, 10).map((conv, idx) => (
                  <div key={idx} className="bg-[var(--bg-card)] rounded-2xl p-4 border-2 border-[var(--emerald-border-soft)] flex items-center justify-between hover:border-[var(--emerald-border)] transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-[var(--emerald-100)] text-[var(--emerald-500)] font-bold text-sm rounded-xl px-3 py-2 min-w-[80px] text-center">
                        Age {conv.age}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">Convert ${conv.amount.toLocaleString()}</div>
                        <div className="text-xs text-[var(--text-tertiary)] font-medium">
                          Taxable income: ${Math.round(conv.taxableIncome).toLocaleString()} • Tax on this conversion: ${Math.round(conv.taxes).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[var(--emerald-500)]">{conv.year}</div>
                    </div>
                  </div>
                ))}
                {conversionYears.length > 10 && (
                  <p className="text-xs text-[var(--text-tertiary)] text-center font-medium pt-2">
                    + {conversionYears.length - 10} more years of conversions
                  </p>
                )}
              </div>

              <div className="mt-6 p-4 bg-[var(--bg-card)] rounded-2xl border-2 border-[var(--color-info-soft)]">
                <div className="flex items-start gap-2">
                  <Info className="text-[var(--color-info)] mt-0.5" size={16} />
                  <div className="text-xs text-[var(--color-info)] font-medium">
                    <strong className="font-bold">How to implement:</strong> Each year listed above, convert the specified amount from your Traditional IRA/401(k) to your Roth IRA.
                    You'll pay taxes on the conversion that year, but all future growth and withdrawals will be tax-free. Ensure you have cash in your taxable account to pay the taxes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Strategy Selection */}
          <div className="flex gap-2 bg-[var(--bg-glass-strong)] p-1.5 rounded-2xl">
              {['taxable-first', 'bracket-filler', 'proportional'].map(s => (
                  <button
                      key={s}
                      onClick={() => setInputs(p => ({...p, strategy: s}))}
                      className={`flex-1 py-3 px-4 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${inputs.strategy === s ? 'bg-[var(--bg-card)] text-[var(--emerald-500)] shadow-md' : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
                  >
                      {s.replace('-', ' ')}
                  </button>
              ))}
          </div>

          {/* High Level Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)]">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Total Lifetime Taxes</p>
                  <p className="text-2xl font-bold text-[var(--text-primary)]">${Math.round(stats.totalTaxes).toLocaleString()}</p>
              </div>
              <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)]">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Portfolio Longevity</p>
                  <p className={`text-2xl font-bold ${stats.failAge ? 'text-[var(--crimson-500)]' : 'text-[var(--emerald-500)]'}`}>
                      {stats.failAge ? `Age ${stats.failAge}` : `${inputs.retirementEndAge}+ Years`}
                  </p>
              </div>
              <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)]">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Estate Value</p>
                  <p className="text-2xl font-bold text-[var(--emerald-500)]">
                      ${Math.round(simulationResults[simulationResults.length - 1].totalBalance).toLocaleString()}
                  </p>
              </div>
          </div>

          {/* Balance Chart */}
          <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-default)] shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <UserCheck className="text-[var(--emerald-500)]" />
                  Asset Depletion Model
                </h3>
                <div className="flex gap-4 text-[10px] font-bold uppercase text-[var(--text-muted)]">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--emerald-400)]"/> Taxable</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--color-warning)]"/> Traditional</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--emerald-500)]"/> Roth</span>
                </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={simulationResults}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DBDB" />
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#767676', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#767676', fontSize: 11}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                      formatter={(val) => [`$${Math.round(Number(val) || 0).toLocaleString()}`, 'Balance']}
                  />
                  <Area type="monotone" dataKey="endBalances.taxable" stackId="1" stroke="#2E9E8D" fill="#2E9E8D" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="endBalances.traditional" stackId="1" stroke="#FEBF14" fill="#FEBF14" fillOpacity={0.8} />
                  <Area type="monotone" dataKey="endBalances.roth" stackId="1" stroke="#1D8072" fill="#1D8072" fillOpacity={0.9} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Income Mix Bar Chart */}
          <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-default)] shadow-sm">
              <h3 className="text-xl font-bold mb-6">Annual Income Composition</h3>
              <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={simulationResults}>
                          <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#767676', fontSize: 11}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: '#767676', fontSize: 11}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v) => `$${Math.round(Number(v) || 0).toLocaleString()}`} />
                          <Legend verticalAlign="top" height={36} />
                          <Bar dataKey="ssIncome" stackId="a" fill="#E0DBDB" name="Social Security" />
                          <Bar dataKey="withdrawn.taxable" stackId="a" fill="#2E9E8D" name="Taxable Dist." />
                          <Bar dataKey="withdrawn.traditional" stackId="a" fill="#FEBF14" name="Trad. Dist." />
                          <Bar dataKey="withdrawn.roth" stackId="a" fill="#1D8072" name="Roth Dist." />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Conversions and Taxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)]">
                  <h4 className="text-sm font-bold text-[var(--text-muted)] uppercase mb-4">Tax Impact</h4>
                  <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={simulationResults}>
                              <XAxis dataKey="age" hide />
                              <Bar dataKey="taxesPaid" fill="#CD2026" radius={[4, 4, 0, 0]} name="Annual Tax" />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-[var(--obsidian-800)] p-6 rounded-3xl text-white">
                  <h4 className="text-sm font-bold text-[var(--mist-200)] uppercase mb-4">Roth Conversion Flow</h4>
                  <div className="h-[200px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={simulationResults}>
                              <Area type="stepAfter" dataKey="conversions" stroke="#2E9E8D" fill="#2E9E8D" fillOpacity={0.4} />
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
