"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, ReferenceLine
} from 'recharts';
import {
  TrendingUp, Calculator, Info, ArrowUpRight, Lock, Zap, AlertTriangle, Target, Clock, ArrowRight,
  CheckCircle2, PiggyBank, Calendar, RefreshCw, Anchor, Briefcase, Heart, Sparkles, DollarSign,
  ShieldCheck, Gauge, Flame, Coffee
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';

interface CoastFIREProps {
  isPro?: boolean;
  onUpgrade?: () => void;
  isLoggedIn?: boolean;
  initialValues?: Record<string, unknown>;
}

export default function CoastFIRE({ isPro = false, onUpgrade, isLoggedIn = false, initialValues }: CoastFIREProps) {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 65,
    annualSpending: 50000,
    currentInvested: 100000,
    monthlyContribution: 1000,
    investmentGrowth: 10,
    inflationRate: 3,
    withdrawalRate: 4,
    investmentFees: 0.18,
    // Pro inputs
    currentIncome: 80000,
    desiredCoastAge: 45,
    socialSecurityAge: 67,
    estimatedSocialSecurity: 2000,
    riskTolerance: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    ...(initialValues || {}),
  });

  // --- Core Calculations ---
  const calculations = useMemo(() => {
    const realGrowthRate = (inputs.investmentGrowth - inputs.inflationRate - inputs.investmentFees) / 100;
    const yearsToRetire = inputs.retirementAge - inputs.currentAge;

    // FIRE Number = Annual Spending / (Withdrawal Rate / 100)
    const targetFIRENumber = inputs.annualSpending / (inputs.withdrawalRate / 100);

    // Coast FIRE Formula: Target / (1 + R)^n
    const coastFIRENumber = targetFIRENumber / Math.pow(1 + realGrowthRate, yearsToRetire);

    const hasReachedCoast = inputs.currentInvested >= coastFIRENumber;
    const coastGap = coastFIRENumber - inputs.currentInvested;
    const coastProgress = Math.min((inputs.currentInvested / coastFIRENumber) * 100, 100);

    // Calculate when user will hit Coast FIRE at current savings rate
    let yearsToCoast = 0;
    let balanceAtCoast = inputs.currentInvested;
    if (!hasReachedCoast) {
      let testBalance = inputs.currentInvested;
      const annualContribution = inputs.monthlyContribution * 12;
      const nominalRate = inputs.investmentGrowth / 100;

      for (let year = 1; year <= yearsToRetire; year++) {
        testBalance = (testBalance + annualContribution) * (1 + nominalRate);
        const yearsRemaining = yearsToRetire - year;
        const futureCoastNumber = targetFIRENumber / Math.pow(1 + realGrowthRate, yearsRemaining);

        if (testBalance >= futureCoastNumber) {
          yearsToCoast = year;
          balanceAtCoast = testBalance;
          break;
        }
      }
    }

    // Projection Data for Chart
    const projectionData = [];
    let currentBalance = inputs.currentInvested;
    let coastBalance = inputs.currentInvested;
    const nominalRate = inputs.investmentGrowth / 100;

    for (let age = inputs.currentAge; age <= 85; age++) {
      const yearsRemaining = Math.max(0, inputs.retirementAge - age);
      const coastLineAtAge = yearsRemaining > 0
        ? targetFIRENumber / Math.pow(1 + realGrowthRate, yearsRemaining)
        : targetFIRENumber;

      projectionData.push({
        age,
        withContributions: Math.round(currentBalance),
        coastingOnly: Math.round(coastBalance),
        targetLine: Math.round(targetFIRENumber),
        coastLine: Math.round(coastLineAtAge)
      });

      currentBalance = (currentBalance + inputs.monthlyContribution * 12) * (1 + realGrowthRate);
      coastBalance = coastBalance * (1 + realGrowthRate);
    }

    // Estimated Retirement Income
    const projectedAtRetirement = projectionData.find(d => d.age === inputs.retirementAge)?.withContributions || 0;
    const estAnnualIncome = projectedAtRetirement * (inputs.withdrawalRate / 100);

    return {
      targetFIRENumber,
      coastFIRENumber,
      hasReachedCoast,
      coastGap,
      coastProgress,
      yearsToCoast,
      balanceAtCoast,
      projectedAtRetirement,
      estAnnualIncome,
      projectionData,
      yearsToRetire,
      realGrowthRate
    };
  }, [inputs]);

  // --- PRO FEATURE: Advanced Analytics ---
  const proAnalytics = useMemo(() => {
    if (!isPro) return null;

    const realGrowthRate = calculations.realGrowthRate;
    const nominalRate = inputs.investmentGrowth / 100;

    // 1. COAST DATE OPTIMIZER - Find optimal age to stop contributing
    const coastDateAnalysis = [];
    for (let targetCoastAge = inputs.currentAge + 1; targetCoastAge <= inputs.retirementAge; targetCoastAge++) {
      const yearsToCoastTarget = targetCoastAge - inputs.currentAge;
      const yearsCoastingAfter = inputs.retirementAge - targetCoastAge;

      // Calculate required balance at coast age to reach FIRE target
      const requiredAtCoastAge = calculations.targetFIRENumber / Math.pow(1 + realGrowthRate, yearsCoastingAfter);

      // Calculate what we'll have at that age with current contributions
      let projectedBalance = inputs.currentInvested;
      for (let y = 0; y < yearsToCoastTarget; y++) {
        projectedBalance = (projectedBalance + inputs.monthlyContribution * 12) * (1 + realGrowthRate);
      }

      // Calculate required monthly contribution to hit that target
      const FV = requiredAtCoastAge;
      const PV = inputs.currentInvested;
      const n = yearsToCoastTarget;
      const r = realGrowthRate;

      // Using PMT formula: PMT = (FV - PV*(1+r)^n) / (((1+r)^n - 1) / r)
      const compoundFactor = Math.pow(1 + r, n);
      const requiredMonthly = n > 0
        ? ((FV - PV * compoundFactor) / ((compoundFactor - 1) / r)) / 12
        : 0;

      // Calculate "freedom years" gained (years of not having to save)
      const freedomYears = yearsCoastingAfter;

      // Calculate total contributions required
      const totalContributions = Math.max(0, requiredMonthly * 12 * yearsToCoastTarget);

      coastDateAnalysis.push({
        coastAge: targetCoastAge,
        requiredMonthly: Math.max(0, Math.round(requiredMonthly)),
        freedomYears,
        totalContributions: Math.round(totalContributions),
        projectedBalance: Math.round(projectedBalance),
        requiredBalance: Math.round(requiredAtCoastAge),
        surplus: Math.round(projectedBalance - requiredAtCoastAge),
        feasible: projectedBalance >= requiredAtCoastAge || requiredMonthly <= inputs.currentIncome / 12 * 0.5
      });
    }

    // 2. BARISTA FIRE ANALYSIS - Part-time work scenarios
    const baristaScenarios = [
      { name: 'Full Coast', partTimeIncome: 0, hoursPerWeek: 0 },
      { name: 'Minimal (10hr/wk)', partTimeIncome: 15000, hoursPerWeek: 10 },
      { name: 'Part-Time (20hr/wk)', partTimeIncome: 30000, hoursPerWeek: 20 },
      { name: 'Half-Time (25hr/wk)', partTimeIncome: 40000, hoursPerWeek: 25 }
    ].map(scenario => {
      // With part-time income, you need less from investments
      const adjustedSpending = inputs.annualSpending - scenario.partTimeIncome;
      const adjustedFIRENumber = Math.max(0, adjustedSpending / (inputs.withdrawalRate / 100));
      const adjustedCoastNumber = adjustedFIRENumber / Math.pow(1 + realGrowthRate, inputs.retirementAge - inputs.currentAge);

      const canCoastNow = inputs.currentInvested >= adjustedCoastNumber;
      const gapToBarista = adjustedCoastNumber - inputs.currentInvested;

      // Calculate when they can reach this barista number
      let yearsToBarista = 0;
      let testBalance = inputs.currentInvested;
      if (!canCoastNow && adjustedCoastNumber > 0) {
        for (let y = 1; y <= 50; y++) {
          testBalance = (testBalance + inputs.monthlyContribution * 12) * (1 + realGrowthRate);
          const yearsRemaining = inputs.retirementAge - inputs.currentAge - y;
          if (yearsRemaining <= 0) break;
          const futureBarista = adjustedFIRENumber / Math.pow(1 + realGrowthRate, yearsRemaining);
          if (testBalance >= futureBarista) {
            yearsToBarista = y;
            break;
          }
        }
      }

      return {
        ...scenario,
        adjustedFIRENumber: Math.round(adjustedFIRENumber),
        adjustedCoastNumber: Math.round(adjustedCoastNumber),
        canCoastNow,
        gapToBarista: Math.round(Math.max(0, gapToBarista)),
        yearsToBarista,
        coastAge: canCoastNow ? inputs.currentAge : inputs.currentAge + yearsToBarista
      };
    });

    // 3. COAST FLEXIBILITY SCORE - How resilient is your coast position?
    const flexibilityMetrics = {
      // Buffer analysis - what if markets underperform?
      pessimisticGrowth: inputs.investmentGrowth - 2,
      pessimisticCoastNumber: calculations.targetFIRENumber / Math.pow(1 + (inputs.investmentGrowth - 2 - inputs.inflationRate - inputs.investmentFees) / 100, calculations.yearsToRetire),

      // Inflation spike analysis
      highInflationCoastNumber: calculations.targetFIRENumber / Math.pow(1 + (inputs.investmentGrowth - (inputs.inflationRate + 2) - inputs.investmentFees) / 100, calculations.yearsToRetire),

      // Spending flexibility
      reducedSpendingCoastNumber: (inputs.annualSpending * 0.85) / (inputs.withdrawalRate / 100) / Math.pow(1 + realGrowthRate, calculations.yearsToRetire),
    };

    const scenarioResults = {
      baseCase: calculations.hasReachedCoast,
      pessimisticMarket: inputs.currentInvested >= flexibilityMetrics.pessimisticCoastNumber,
      highInflation: inputs.currentInvested >= flexibilityMetrics.highInflationCoastNumber,
      reducedSpending: inputs.currentInvested >= flexibilityMetrics.reducedSpendingCoastNumber
    };

    const passedScenarios = Object.values(scenarioResults).filter(Boolean).length;
    const flexibilityScore = (passedScenarios / 4) * 100;

    const flexibilityGrade =
      flexibilityScore >= 100 ? 'A+' :
      flexibilityScore >= 75 ? 'A' :
      flexibilityScore >= 50 ? 'B' :
      flexibilityScore >= 25 ? 'C' : 'D';

    // 4. LIFESTYLE DESIGN SCENARIOS
    const lifestyleScenarios = [
      {
        name: 'Lean FIRE',
        spendingMultiplier: 0.7,
        description: 'Minimalist lifestyle',
        icon: 'leaf'
      },
      {
        name: 'Regular FIRE',
        spendingMultiplier: 1.0,
        description: 'Current lifestyle',
        icon: 'home'
      },
      {
        name: 'Fat FIRE',
        spendingMultiplier: 1.5,
        description: 'Comfortable lifestyle',
        icon: 'star'
      },
      {
        name: 'Chubby FIRE',
        spendingMultiplier: 1.25,
        description: 'Slightly elevated',
        icon: 'heart'
      }
    ].map(scenario => {
      const adjustedSpending = inputs.annualSpending * scenario.spendingMultiplier;
      const adjustedFIRE = adjustedSpending / (inputs.withdrawalRate / 100);
      const adjustedCoast = adjustedFIRE / Math.pow(1 + realGrowthRate, calculations.yearsToRetire);
      const reached = inputs.currentInvested >= adjustedCoast;

      return {
        ...scenario,
        annualSpending: Math.round(adjustedSpending),
        fireNumber: Math.round(adjustedFIRE),
        coastNumber: Math.round(adjustedCoast),
        reached,
        progress: Math.min(100, (inputs.currentInvested / adjustedCoast) * 100)
      };
    });

    // 5. SOCIAL SECURITY INTEGRATION
    const reducedFIRENumber = Math.max(0, (inputs.annualSpending - inputs.estimatedSocialSecurity * 12)) / (inputs.withdrawalRate / 100);
    const reducedCoastNumber = reducedFIRENumber / Math.pow(1 + realGrowthRate, inputs.socialSecurityAge - inputs.currentAge);

    const ssIntegration = {
      monthlyBenefit: inputs.estimatedSocialSecurity,
      annualBenefit: inputs.estimatedSocialSecurity * 12,
      yearsUntilSS: inputs.socialSecurityAge - inputs.currentAge,
      reducedAnnualNeed: inputs.annualSpending - (inputs.estimatedSocialSecurity * 12),
      reducedFIRENumber,
      reducedCoastNumber,
      ssAdjustedCoastReached: inputs.currentInvested >= reducedCoastNumber
    };

    // 6. WORK OPTIONAL TIMELINE
    const workOptionalTimeline = [];
    let runningBalance = inputs.currentInvested;

    for (let age = inputs.currentAge; age <= inputs.retirementAge; age++) {
      const yearsRemaining = inputs.retirementAge - age;
      const coastAtAge = yearsRemaining > 0
        ? calculations.targetFIRENumber / Math.pow(1 + realGrowthRate, yearsRemaining)
        : calculations.targetFIRENumber;

      const isCoastReached = runningBalance >= coastAtAge;
      const monthlyRequired = isCoastReached ? 0 : Math.round((coastAtAge - runningBalance) / (yearsRemaining * 12));

      workOptionalTimeline.push({
        age,
        balance: Math.round(runningBalance),
        coastTarget: Math.round(coastAtAge),
        isCoastReached,
        monthlyRequired,
        status: isCoastReached ? 'Work Optional' : 'Building Phase'
      });

      runningBalance = (runningBalance + inputs.monthlyContribution * 12) * (1 + realGrowthRate);
    }

    // 7. OPPORTUNITY COST CALCULATOR
    const opportunityCost = {
      yearsOfFreedom: calculations.hasReachedCoast ? calculations.yearsToRetire : 0,
      potentialEarningsIfWorking: calculations.hasReachedCoast ? inputs.currentIncome * calculations.yearsToRetire : 0,
      savedByCoasting: calculations.hasReachedCoast ? inputs.monthlyContribution * 12 * calculations.yearsToRetire : 0,

      // Time value calculation
      hoursSavedPerYear: calculations.hasReachedCoast ? 2080 : 0, // 40hr * 52 weeks
      totalHoursSaved: calculations.hasReachedCoast ? 2080 * calculations.yearsToRetire : 0,
    };

    return {
      coastDateAnalysis,
      baristaScenarios,
      flexibilityMetrics,
      flexibilityScore,
      flexibilityGrade,
      scenarioResults,
      lifestyleScenarios,
      ssIntegration,
      workOptionalTimeline,
      opportunityCost
    };
  }, [isPro, inputs, calculations]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: name === 'riskTolerance' ? value : parseFloat(value) || 0 }));
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Save Scenario */}
      <div className="flex justify-end">
        <SaveScenarioButton
          toolId="coast-fire"
          toolName="Coast FIRE Calculator"
          getInputs={() => inputs}
          getKeyResult={() => {
            const coastNumber = inputs.annualSpending / (inputs.withdrawalRate / 100);
            return `Coast FIRE number: $${Math.round(coastNumber).toLocaleString()}`;
          }}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* Primary Status Card */}
      <div className={`rounded-[3rem] p-8 md:p-10 border-2 transition-all shadow-lg ${
        calculations.hasReachedCoast
          ? 'bg-emerald-600 border-emerald-500 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className={`text-lg font-bold mb-2 uppercase tracking-widest ${calculations.hasReachedCoast ? 'text-emerald-100' : 'text-slate-400'}`}>
              Coast FIRE Status
            </h2>
            <div className="flex items-center gap-3">
              {calculations.hasReachedCoast ? (
                <CheckCircle2 size={40} className="text-white" />
              ) : (
                <Anchor size={40} className="text-amber-500" />
              )}
              <span className="text-3xl md:text-4xl font-black tracking-tight">
                {calculations.hasReachedCoast ? "YOU'VE REACHED COAST FIRE!" : "BUILDING MOMENTUM"}
              </span>
            </div>
            {calculations.hasReachedCoast && (
              <p className="mt-3 text-emerald-100 font-medium">
                You can stop contributing and still reach your retirement goal through compound growth alone.
              </p>
            )}
          </div>

          <div className={`text-right ${calculations.hasReachedCoast ? 'bg-emerald-500/30' : 'bg-slate-50'} p-6 rounded-2xl min-w-[240px]`}>
            <p className="text-[10px] opacity-80 font-black uppercase tracking-widest mb-1">Your Coast FIRE Number</p>
            <p className="text-3xl font-black">{formatCurrency(calculations.coastFIRENumber)}</p>
            <p className="text-xs mt-1 opacity-70 italic">Inflation-adjusted target</p>
          </div>
        </div>

        {!calculations.hasReachedCoast && (
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-slate-600">
                <RefreshCw size={18} className="text-amber-500" />
                <span>
                  You need <strong className="text-slate-900">{formatCurrency(calculations.coastGap)}</strong> more to coast today.
                </span>
              </div>
              {calculations.yearsToCoast > 0 && (
                <div className="bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm font-bold border border-amber-200">
                  Coast FIRE in ~{calculations.yearsToCoast} years at current pace
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                <span>Progress to Coast FIRE</span>
                <span>{calculations.coastProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500"
                  style={{ width: `${calculations.coastProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-indigo-50 w-10 h-10 rounded-full flex items-center justify-center mb-3">
            <Target className="text-indigo-600" size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">FIRE Target</p>
          <p className="text-xl font-black text-slate-800">{formatCurrency(calculations.targetFIRENumber)}</p>
          <p className="text-xs text-slate-400 mt-1">at {inputs.withdrawalRate}% withdrawal</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center mb-3">
            <Calendar className="text-purple-600" size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Years to Retirement</p>
          <p className="text-xl font-black text-slate-800">{calculations.yearsToRetire}</p>
          <p className="text-xs text-slate-400 mt-1">Age {inputs.currentAge} → {inputs.retirementAge}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="text-emerald-600" size={20} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected at Retirement</p>
          <p className="text-xl font-black text-slate-800">{formatCurrency(calculations.projectedAtRetirement)}</p>
          <p className="text-xs text-slate-400 mt-1">with current contributions</p>
        </div>

        <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white">
          <div className="bg-white/20 w-10 h-10 rounded-full flex items-center justify-center mb-3">
            <DollarSign className="text-white" size={20} />
          </div>
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Est. Annual Income</p>
          <p className="text-xl font-black">{formatCurrency(calculations.estAnnualIncome)}</p>
          <p className="text-xs text-indigo-200 mt-1">sustainable withdrawal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <Calculator size={16} className="text-emerald-600" /> Your Numbers
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Current Age</label>
                  <input
                    type="number"
                    name="currentAge"
                    value={inputs.currentAge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Retirement Age</label>
                  <input
                    type="number"
                    name="retirementAge"
                    value={inputs.retirementAge}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Current Investments ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-300 font-bold">$</span>
                  <input
                    type="number"
                    name="currentInvested"
                    value={inputs.currentInvested}
                    onChange={handleInputChange}
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Monthly Contribution ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-300 font-bold">$</span>
                  <input
                    type="number"
                    name="monthlyContribution"
                    value={inputs.monthlyContribution}
                    onChange={handleInputChange}
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Annual Spending in Retirement ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-300 font-bold">$</span>
                  <input
                    type="number"
                    name="annualSpending"
                    value={inputs.annualSpending}
                    onChange={handleInputChange}
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  Advanced Assumptions
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Growth Rate (%)</span>
                    <input
                      type="number"
                      name="investmentGrowth"
                      step="0.1"
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-right font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={inputs.investmentGrowth}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Inflation Rate (%)</span>
                    <input
                      type="number"
                      name="inflationRate"
                      step="0.1"
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-right font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={inputs.inflationRate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Withdrawal Rate (%)</span>
                    <input
                      type="number"
                      name="withdrawalRate"
                      step="0.1"
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-right font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={inputs.withdrawalRate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Investment Fees (%)</span>
                    <input
                      type="number"
                      name="investmentFees"
                      step="0.01"
                      className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-right font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                      value={inputs.investmentFees}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Snippet */}
          <div className="bg-emerald-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-emerald-400" /> What is Coast FIRE?
            </h4>
            <p className="text-sm font-medium leading-relaxed text-emerald-50 mb-4">
              Coast FIRE is reaching the point where your current investments will grow to your FIRE number by retirement age, <strong>even if you never contribute another cent</strong>.
            </p>
            <div className="bg-emerald-800/50 rounded-xl p-4 border border-emerald-700/50">
              <p className="text-xs font-bold text-emerald-300 mb-1">THE FORMULA</p>
              <p className="text-sm font-mono text-emerald-50">
                Coast Number = FIRE Target ÷ (1 + r)^years
              </p>
            </div>
          </div>
        </aside>

        {/* Chart Area */}
        <main className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <TrendingUp className="text-emerald-600" /> Portfolio Projection
              </h3>
              <p className="text-sm text-slate-500 font-medium">Your path with vs. without future contributions</p>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Current Plan</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-blue-400" /> Coasting Only</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-300" /> FIRE Target</div>
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calculations.projectionData}>
                <defs>
                  <linearGradient id="colorWithCoast" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCoastOnly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="age"
                  stroke="#94a3b8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  ticks={[inputs.currentAge, inputs.retirementAge, 85]}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  fontWeight={600}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: 600 }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <ReferenceLine
                  y={calculations.targetFIRENumber}
                  stroke="#cbd5e1"
                  strokeDasharray="5 5"
                  label={{ position: 'right', value: 'FIRE Goal', fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <ReferenceLine
                  x={inputs.retirementAge}
                  stroke="#cbd5e1"
                  strokeDasharray="5 5"
                  label={{ position: 'top', value: 'Retire', fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />

                <Area
                  type="monotone"
                  dataKey="withContributions"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorWithCoast)"
                  name="With Contributions"
                />
                <Area
                  type="monotone"
                  dataKey="coastingOnly"
                  stroke="#60a5fa"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCoastOnly)"
                  name="Coasting Only"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Math Breakdown */}
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl">
            <h4 className="font-bold text-slate-800 mb-3 text-sm">The Math Behind Your Result</h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-600">
              <div>
                <p>
                  To support <strong className="text-slate-800">{formatCurrency(inputs.annualSpending)}/year</strong>, you need a total portfolio of <strong className="text-slate-800">{formatCurrency(calculations.targetFIRENumber)}</strong> (using the {inputs.withdrawalRate}% rule).
                </p>
              </div>
              <div>
                <p>
                  With a real return of <strong className="text-slate-800">{(inputs.investmentGrowth - inputs.inflationRate - inputs.investmentFees).toFixed(2)}%</strong> and <strong className="text-slate-800">{calculations.yearsToRetire} years</strong> to grow, you need <strong className="text-slate-800">{formatCurrency(calculations.coastFIRENumber)}</strong> today to coast.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* PRO FEATURES SECTION - Locked State */}
      {!isPro && (
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-black">Coast FIRE Command Center</h3>
            </div>
            <p className="text-amber-50 text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock advanced Cortex analytics that reveal hidden pathways to financial freedom. See exactly when you can coast, explore Barista FIRE options, and stress-test your plan against multiple scenarios.
            </p>
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <Clock size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Coast Date Optimizer</h4>
                <p className="text-amber-100 text-xs font-medium">Find your optimal coast age with contribution trade-offs</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <Coffee size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Barista FIRE Paths</h4>
                <p className="text-amber-100 text-xs font-medium">Explore part-time work scenarios that accelerate freedom</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <ShieldCheck size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Flexibility Score</h4>
                <p className="text-amber-100 text-xs font-medium">Stress-test your plan against market and inflation shocks</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20">
                <Flame size={24} className="mb-3" />
                <h4 className="font-black text-sm mb-2">Lifestyle Scenarios</h4>
                <p className="text-amber-100 text-xs font-medium">Compare Lean, Regular, Chubby, and Fat FIRE targets</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="bg-white text-amber-600 px-8 py-4 rounded-2xl font-black hover:bg-amber-50 transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              Upgrade to Cortex Pro - $9/month
            </button>
          </div>
        </div>
      )}

      {/* PRO FEATURES - Unlocked Content */}
      {isPro && proAnalytics && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-amber-500 text-white p-3 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Coast FIRE Command Center</h3>
              <p className="text-slate-500 font-medium">Advanced Cortex analytics for financial freedom</p>
            </div>
          </div>

          {/* Pro Input Section */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] p-8 text-white">
            <h4 className="font-black text-sm uppercase tracking-widest mb-6 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Pro Inputs
            </h4>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Current Annual Income ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    name="currentIncome"
                    value={inputs.currentIncome}
                    onChange={handleInputChange}
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Social Security Start Age</label>
                <input
                  type="number"
                  name="socialSecurityAge"
                  value={inputs.socialSecurityAge}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Est. Monthly SS Benefit ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    name="estimatedSocialSecurity"
                    value={inputs.estimatedSocialSecurity}
                    onChange={handleInputChange}
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-700 border border-slate-600 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Flexibility Score Card */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${
                proAnalytics.flexibilityScore >= 75 ? 'bg-emerald-100 text-emerald-600' :
                proAnalytics.flexibilityScore >= 50 ? 'bg-amber-100 text-amber-600' :
                'bg-rose-100 text-rose-600'
              }`}>
                <Gauge size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-black text-slate-900 mb-1">Coast Flexibility Score</h4>
                <p className="text-slate-600 font-medium">How resilient is your coast position against adverse scenarios?</p>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-black ${
                  proAnalytics.flexibilityScore >= 75 ? 'text-emerald-600' :
                  proAnalytics.flexibilityScore >= 50 ? 'text-amber-600' :
                  'text-rose-600'
                }`}>
                  {proAnalytics.flexibilityGrade}
                </div>
                <p className="text-sm text-slate-500 font-bold">{proAnalytics.flexibilityScore.toFixed(0)}% scenarios passed</p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Base Case', passed: proAnalytics.scenarioResults.baseCase, desc: 'Current assumptions' },
                { label: 'Market Downturn', passed: proAnalytics.scenarioResults.pessimisticMarket, desc: '-2% returns' },
                { label: 'High Inflation', passed: proAnalytics.scenarioResults.highInflation, desc: '+2% inflation' },
                { label: 'Reduced Spending', passed: proAnalytics.scenarioResults.reducedSpending, desc: '-15% expenses' }
              ].map((scenario, i) => (
                <div key={i} className={`p-4 rounded-2xl border-2 ${
                  scenario.passed
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-rose-50 border-rose-200'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {scenario.passed ? (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    ) : (
                      <AlertTriangle size={18} className="text-rose-600" />
                    )}
                    <span className="font-black text-sm text-slate-800">{scenario.label}</span>
                  </div>
                  <p className="text-xs text-slate-500">{scenario.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-indigo-900 text-white rounded-2xl">
              <p className="text-xs font-black text-indigo-300 mb-1">CORTEX INSIGHT</p>
              <p className="text-sm font-medium">
                {proAnalytics.flexibilityScore >= 75
                  ? "Your coast position is highly resilient. You're protected against most adverse scenarios."
                  : proAnalytics.flexibilityScore >= 50
                  ? "Your coast position has moderate flexibility. Consider building a small buffer for additional security."
                  : "Your coast position is fragile. We recommend continuing contributions until you pass at least 3 of 4 scenarios."}
              </p>
            </div>
          </div>

          {/* Barista FIRE Analysis */}
          <div className="bg-gradient-to-br from-amber-600 to-orange-600 rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Coffee size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-2">Barista FIRE Analysis</h4>
                <p className="text-amber-50 font-medium">
                  What if you switched to part-time work instead of waiting for full Coast FIRE?
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {proAnalytics.baristaScenarios.map((scenario, i) => (
                <div key={i} className={`rounded-2xl p-5 border ${
                  scenario.canCoastNow
                    ? 'bg-white text-slate-900 border-transparent'
                    : 'bg-white/10 border-white/20'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <h5 className={`font-black text-sm ${scenario.canCoastNow ? 'text-slate-800' : 'text-white'}`}>
                      {scenario.name}
                    </h5>
                    {scenario.canCoastNow && (
                      <CheckCircle2 size={18} className="text-emerald-500" />
                    )}
                  </div>
                  <p className={`text-xs mb-3 ${scenario.canCoastNow ? 'text-slate-500' : 'text-amber-100'}`}>
                    {scenario.hoursPerWeek > 0 ? `${scenario.hoursPerWeek} hrs/week @ $${Math.round(scenario.partTimeIncome / 52 / scenario.hoursPerWeek)}/hr` : 'No work required'}
                  </p>
                  <div className={`text-lg font-black mb-1 ${scenario.canCoastNow ? 'text-emerald-600' : 'text-white'}`}>
                    {scenario.canCoastNow ? 'Available Now!' : `${scenario.yearsToBarista} years away`}
                  </div>
                  <p className={`text-xs ${scenario.canCoastNow ? 'text-slate-400' : 'text-amber-100'}`}>
                    Coast # needed: {formatCurrency(scenario.adjustedCoastNumber)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-xs font-black text-amber-200 mb-1">CORTEX INSIGHT</p>
              <p className="text-sm font-medium">
                {proAnalytics.baristaScenarios.some(s => s.canCoastNow && s.hoursPerWeek > 0)
                  ? `You could switch to part-time work today! Consider the "${proAnalytics.baristaScenarios.find(s => s.canCoastNow && s.hoursPerWeek > 0)?.name}" option for immediate freedom with some income.`
                  : "You're building toward multiple Barista FIRE options. Keep contributing and you'll unlock part-time freedom soon."}
              </p>
            </div>
          </div>

          {/* Coast Date Optimizer */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl">
                <Clock size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 mb-1">Coast Date Optimizer</h4>
                <p className="text-slate-600 font-medium">
                  Explore different coast ages and see the contribution trade-offs
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-black text-slate-500 text-xs uppercase">Coast Age</th>
                    <th className="text-right py-3 px-4 font-black text-slate-500 text-xs uppercase">Monthly Needed</th>
                    <th className="text-right py-3 px-4 font-black text-slate-500 text-xs uppercase">Total to Save</th>
                    <th className="text-right py-3 px-4 font-black text-slate-500 text-xs uppercase">Freedom Years</th>
                    <th className="text-center py-3 px-4 font-black text-slate-500 text-xs uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {proAnalytics.coastDateAnalysis
                    .filter((_, i) => i % 5 === 0 || i === proAnalytics.coastDateAnalysis.length - 1)
                    .map((row, i) => (
                    <tr key={i} className={`border-b border-slate-100 ${row.surplus >= 0 ? 'bg-emerald-50/50' : ''}`}>
                      <td className="py-3 px-4 font-bold text-slate-800">{row.coastAge}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        {row.requiredMonthly <= 0 ? (
                          <span className="text-emerald-600">$0 (surplus)</span>
                        ) : (
                          formatCurrency(row.requiredMonthly)
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-600">
                        {formatCurrency(row.totalContributions)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-indigo-600">
                        {row.freedomYears} years
                      </td>
                      <td className="py-3 px-4 text-center">
                        {row.surplus >= 0 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-bold">
                            <CheckCircle2 size={12} /> On Track
                          </span>
                        ) : row.feasible ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-bold">
                            <Target size={12} /> Feasible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-1 rounded-full text-xs font-bold">
                            Stretch Goal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-indigo-900 text-white rounded-2xl">
              <p className="text-xs font-black text-indigo-300 mb-1">CORTEX INSIGHT</p>
              <p className="text-sm font-medium">
                {calculations.hasReachedCoast
                  ? "You've already reached Coast FIRE! Every dollar you save now accelerates your timeline or increases your retirement income."
                  : `To coast by age ${inputs.currentAge + 10}, you'd need to save ${formatCurrency(proAnalytics.coastDateAnalysis[9]?.requiredMonthly || 0)}/month. Consider if the ${proAnalytics.coastDateAnalysis[9]?.freedomYears || 0} years of freedom is worth the extra effort.`}
              </p>
            </div>
          </div>

          {/* Lifestyle Scenarios */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-purple-100 text-purple-600 p-3 rounded-2xl">
                <Flame size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 mb-1">FIRE Lifestyle Scenarios</h4>
                <p className="text-slate-600 font-medium">
                  See how different spending levels affect your coast timeline
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              {proAnalytics.lifestyleScenarios.map((scenario, i) => (
                <div key={i} className={`p-6 rounded-2xl border-2 ${
                  scenario.reached
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-black text-slate-800">{scenario.name}</h5>
                    {scenario.reached && <CheckCircle2 size={20} className="text-emerald-500" />}
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{scenario.description}</p>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Spending</span>
                      <span className="font-bold text-slate-800">{formatCurrency(scenario.annualSpending)}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">FIRE #</span>
                      <span className="font-bold text-slate-800">{formatCurrency(scenario.fireNumber)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Coast #</span>
                      <span className="font-bold text-slate-800">{formatCurrency(scenario.coastNumber)}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{scenario.progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${scenario.reached ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(100, scenario.progress)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Security Integration */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <ShieldCheck size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-black mb-2">Social Security Integration</h4>
                <p className="text-indigo-100 font-medium">
                  How Social Security changes your Coast FIRE calculation
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-indigo-200 text-xs font-bold mb-2">Expected SS Benefit</p>
                <p className="text-3xl font-black">{formatCurrency(proAnalytics.ssIntegration.monthlyBenefit)}/mo</p>
                <p className="text-indigo-200 text-xs mt-2">Starting at age {inputs.socialSecurityAge}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-indigo-200 text-xs font-bold mb-2">Reduced FIRE Target</p>
                <p className="text-3xl font-black">{formatCurrency(proAnalytics.ssIntegration.reducedFIRENumber)}</p>
                <p className="text-indigo-200 text-xs mt-2">After SS kicks in</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-indigo-200 text-xs font-bold mb-2">SS-Adjusted Coast #</p>
                <p className="text-3xl font-black">{formatCurrency(proAnalytics.ssIntegration.reducedCoastNumber)}</p>
                <p className="text-indigo-200 text-xs mt-2">
                  {proAnalytics.ssIntegration.ssAdjustedCoastReached
                    ? '✓ You\'ve reached this!'
                    : `${formatCurrency(proAnalytics.ssIntegration.reducedCoastNumber - inputs.currentInvested)} to go`}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <p className="text-xs font-black text-indigo-200 mb-1">CORTEX INSIGHT</p>
              <p className="text-sm font-medium">
                {proAnalytics.ssIntegration.ssAdjustedCoastReached
                  ? "When factoring in Social Security, you've already hit your adjusted Coast number! SS will cover part of your expenses, reducing what you need from investments."
                  : `Social Security will cover ${formatCurrency(proAnalytics.ssIntegration.annualBenefit)}/year of your expenses. This reduces your Coast FIRE target by ${formatCurrency(calculations.coastFIRENumber - proAnalytics.ssIntegration.reducedCoastNumber)}.`}
              </p>
            </div>
          </div>

          {/* Work Optional Timeline */}
          <div className="bg-white rounded-[3rem] p-10 border border-slate-200 shadow-sm">
            <div className="flex items-start gap-4 mb-8">
              <div className="bg-emerald-100 text-emerald-600 p-3 rounded-2xl">
                <Briefcase size={32} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-slate-900 mb-1">Work Optional Timeline</h4>
                <p className="text-slate-600 font-medium">
                  Track your journey from mandatory work to complete freedom
                </p>
              </div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={proAnalytics.workOptionalTimeline}>
                  <defs>
                    <linearGradient id="colorTimeline" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="age"
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="coastTarget"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name="Coast Target"
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTimeline)"
                    name="Your Balance"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Timeline milestones */}
            <div className="mt-8 flex flex-wrap gap-3">
              {proAnalytics.workOptionalTimeline
                .filter(point => point.isCoastReached)
                .slice(0, 1)
                .map((point, i) => (
                  <div key={i} className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    Work becomes optional at age {point.age}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
