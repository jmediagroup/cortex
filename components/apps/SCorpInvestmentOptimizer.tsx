"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, PiggyBank, Shield, AlertCircle, Lock } from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import NumberInput from '@/components/ui/NumberInput';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';

/**
 * S-Corp Investment Optimizer (2026 Limits)
 *
 * Helps S-Corp owners maximize retirement contributions across:
 * - Employee 401(k) deferrals (Traditional or Roth)
 * - Company 401(k) matching
 * - IRA contributions (Traditional or Roth)
 * - HSA contributions
 * - Taxable brokerage
 */

interface SCorpInvestmentOptimizerProps {
  isPro: boolean;
  onUpgrade: () => void;
  isLoggedIn?: boolean;
  initialValues?: Record<string, unknown>;
}

export default function SCorpInvestmentOptimizer({ isPro, onUpgrade, isLoggedIn = false, initialValues }: SCorpInvestmentOptimizerProps) {
  const [inputs, setInputs] = useState({
    annualSalary: 60000,
    age: 35,
    estTaxRate: 25,
    taxStrategy: 'traditional', // 'traditional' or 'roth'
    monthlyEmp401k: 1000,
    monthlyCo401k: 500,
    monthlyIra: 625,
    monthlyHsa: 366,
    monthlyBrokerage: 0,
    growthRate: 7.0,
    inflationRate: 3.0,
    adjustInflation: false,
    ...(initialValues || {}),
  });

  // 2026 IRS Limits
  const LIMITS = useMemo(() => {
    const isCatchup = inputs.age >= 50;
    const isSuperCatchup = inputs.age >= 60 && inputs.age <= 63;
    const isHSACatchup = inputs.age >= 55;

    let emp401kLimit = 24500; // Base 2026 limit
    if (isSuperCatchup) emp401kLimit += 11250;
    else if (isCatchup) emp401kLimit += 8000;

    let iraLimit = 7500;
    if (isCatchup) iraLimit += 1100;

    let hsaLimit = 4400; // Single filer
    if (isHSACatchup) hsaLimit += 1000;

    const maxEmpMonthly = Math.min(inputs.annualSalary, emp401kLimit) / 12;
    const maxCoMonthly = (inputs.annualSalary * 0.25) / 12; // 25% of compensation
    const maxIraMonthly = iraLimit / 12;
    const maxHsaMonthly = hsaLimit / 12;

    // §415(c) combined limit on employee + employer 401(k) additions:
    // $72,000 for 2026 (capped at 100% of compensation); catch-up
    // deferrals sit on top of that limit.
    let catchupAllowance = 0;
    if (isSuperCatchup) catchupAllowance = 11250;
    else if (isCatchup) catchupAllowance = 8000;
    const combined401kLimit = Math.min(72000, inputs.annualSalary) + catchupAllowance;

    return {
      emp401k: { annual: emp401kLimit, monthly: maxEmpMonthly },
      co401k: { annual: inputs.annualSalary * 0.25, monthly: maxCoMonthly },
      ira: { annual: iraLimit, monthly: maxIraMonthly },
      hsa: { annual: hsaLimit, monthly: maxHsaMonthly },
      combined401k: { annual: combined401kLimit }
    };
  }, [inputs.age, inputs.annualSalary]);

  // Calculate allocations and projections
  const calculations = useMemo(() => {
    // §219(g): the traditional IRA deduction phases out for active
    // employer-plan participants — 2026 single filer: $81k–$91k MAGI
    // (W-2 salary is used as the MAGI proxy here).
    const activeParticipant = inputs.monthlyEmp401k > 0 || inputs.monthlyCo401k > 0;
    let iraDeductibleFraction = 1;
    if (activeParticipant) {
      const PHASE_START = 81000;
      const PHASE_END = 91000;
      if (inputs.annualSalary >= PHASE_END) iraDeductibleFraction = 0;
      else if (inputs.annualSalary > PHASE_START) {
        iraDeductibleFraction = (PHASE_END - inputs.annualSalary) / (PHASE_END - PHASE_START);
      }
    }

    const allocations = [
      {
        name: 'HSA',
        monthly: inputs.monthlyHsa,
        color: '#4EC9F5',
        isTaxDeductible: true,
        deductibleFraction: 1
      },
      {
        name: `401(k) Employee (${inputs.taxStrategy === 'roth' ? 'Roth' : 'Traditional'})`,
        monthly: inputs.monthlyEmp401k,
        color: inputs.taxStrategy === 'roth' ? '#054C7D' : '#1D8072',
        isTaxDeductible: inputs.taxStrategy === 'traditional',
        deductibleFraction: 1
      },
      {
        name: '401(k) Company Match',
        monthly: inputs.monthlyCo401k,
        color: '#0A6FD1',
        isTaxDeductible: true,
        deductibleFraction: 1
      },
      {
        name: `IRA (${inputs.taxStrategy === 'roth' ? 'Roth' : 'Traditional'})`,
        monthly: inputs.monthlyIra,
        color: inputs.taxStrategy === 'roth' ? '#F26531' : '#2E9E8D',
        isTaxDeductible: inputs.taxStrategy === 'traditional' && iraDeductibleFraction > 0,
        deductibleFraction: iraDeductibleFraction
      },
      {
        name: 'Brokerage',
        monthly: inputs.monthlyBrokerage,
        color: '#767676',
        isTaxDeductible: false,
        deductibleFraction: 0
      }
    ];

    const totalMonthly = allocations.reduce((sum, a) => sum + a.monthly, 0);
    const taxRate = inputs.estTaxRate / 100;
    const monthlyTaxDeduction = allocations
      .filter(a => a.isTaxDeductible)
      .reduce((sum, a) => sum + a.monthly * a.deductibleFraction, 0);
    const monthlyTaxSavings = monthlyTaxDeduction * taxRate;
    const netMonthlyCost = totalMonthly - monthlyTaxSavings;

    // Calculate 30-year projections
    const monthlyRate = inputs.growthRate / 100 / 12;
    const inflationRate = inputs.inflationRate / 100;

    let projectionData = [];
    let totalBalance = 0;

    for (let year = 0; year <= 30; year++) {
      let yearBalance = 0;

      allocations.forEach(allocation => {
        if (allocation.monthly > 0) {
          let balance = 0;
          for (let y = 0; y < year; y++) {
            for (let m = 0; m < 12; m++) {
              balance = (balance + allocation.monthly) * (1 + monthlyRate);
            }
          }

          // Adjust for inflation if enabled
          if (inputs.adjustInflation && year > 0) {
            balance = balance / Math.pow(1 + inflationRate, year);
          }

          yearBalance += balance;
        }
      });

      projectionData.push({
        year: year,
        balance: Math.round(yearBalance)
      });

      if (year === 30) totalBalance = yearBalance;
    }

    return {
      allocations,
      totalMonthly,
      monthlyTaxSavings,
      netMonthlyCost,
      totalBalance,
      projectionData,
      taxRate,
      iraDeductibleFraction
    };
  }, [inputs]);

  // Pro feature gate
  if (!isPro) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="max-w-md text-center p-12 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-card)]">
          <Lock className="mx-auto text-[var(--orange)] mb-4" size={48} />
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Pro Feature</h3>
          <p className="text-[var(--text-secondary)] font-medium mb-6">
            The S-Corp Investment Optimizer is available exclusively to Pro subscribers. Upgrade to access advanced business tax optimization tools.
          </p>
          <button
            onClick={onUpgrade}
            className="mgm-btn mgm-btn--primary mgm-btn--md"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="s-corp-investment"
          toolName="S-Corp Investment Optimizer"
          getInputs={() => inputs}
          getKeyResult={() => `Salary: $${inputs.annualSalary.toLocaleString()}, Age: ${inputs.age}`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* EXPLANATION BANNER */}
      <div className="bg-[var(--emerald-50)] border border-[var(--emerald-border)] rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--emerald-100)] rounded-lg">
            <Shield className="text-[var(--emerald-500)]" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--emerald-500)] mb-2">S-Corp Investment Strategy</h3>
            <p className="text-[var(--emerald-500)] font-medium text-sm leading-relaxed">
              As an S-Corp owner, you can maximize retirement savings through strategic allocation across employee deferrals,
              company matching, IRA contributions, and HSA. This optimizer uses 2026 IRS limits and shows your 30-year wealth projection
              with tax savings factored in.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - INPUTS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Business & Tax Profile */}
          <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
              <DollarSign className="text-[var(--navy)]" size={24} />
              Business & Tax Profile
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Annual W-2 Salary</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold z-10">$</span>
                  <NumberInput
                    name="annualSalary"
                    value={inputs.annualSalary}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, annualSalary: n }))}
                    min={0}
                    step="1000"
                    className="w-full pl-7 pr-4 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Your Age</label>
                  <NumberInput
                    name="age"
                    value={inputs.age}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, age: n }))}
                    min={1}
                    className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Est. Tax Rate %</label>
                  <NumberInput
                    name="estTaxRate"
                    value={inputs.estTaxRate}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, estTaxRate: n }))}
                    step="1"
                    className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">401(k) Mode</label>
                <select
                  name="taxStrategy"
                  value={inputs.taxStrategy}
                  onChange={(e) => setInputs(prev => ({ ...prev, taxStrategy: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                >
                  <option value="roth">Roth (Employee)</option>
                  <option value="traditional">Traditional (Pre-Tax)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monthly Contributions */}
          <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-default)] border-t-4 border-t-[var(--color-info)] shadow-[var(--shadow-card)]">
            <h3 className="text-xl font-bold text-[var(--color-info)] mb-6 flex items-center gap-3">
              <PiggyBank className="text-[var(--color-info)]" size={24} />
              Monthly Contributions
            </h3>

            <div className="space-y-5">
              <div>
                <label className="flex justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  <span>Employee 401(k)</span>
                  <span className="text-[10px] text-[var(--color-info)]">Max: ${Math.floor(LIMITS.emp401k.monthly).toLocaleString()}</span>
                </label>
                <NumberInput
                  name="monthlyEmp401k"
                  value={inputs.monthlyEmp401k}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, monthlyEmp401k: n }))}
                  min={0}
                  step="50"
                  className={`w-full px-3 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)] border ${
                    inputs.monthlyEmp401k > LIMITS.emp401k.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] bg-[var(--bg-section)]'
                  }`}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  <span>Company 401(k) Match</span>
                  <span className="text-[10px] text-[var(--color-info)]">Max: ${Math.floor(LIMITS.co401k.monthly).toLocaleString()}</span>
                </label>
                <NumberInput
                  name="monthlyCo401k"
                  value={inputs.monthlyCo401k}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, monthlyCo401k: n }))}
                  min={0}
                  step="50"
                  className={`w-full px-3 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)] border ${
                    inputs.monthlyCo401k > LIMITS.co401k.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] bg-[var(--bg-section)]'
                  }`}
                />
                {(inputs.monthlyEmp401k + inputs.monthlyCo401k) * 12 > LIMITS.combined401k.annual && (
                  <p className="mt-2 text-[10px] font-bold text-[var(--crimson-500)]">
                    Employee + company contributions of ${((inputs.monthlyEmp401k + inputs.monthlyCo401k) * 12).toLocaleString()}/yr exceed the ${LIMITS.combined401k.annual.toLocaleString()} combined §415(c) limit for your age and salary.
                  </p>
                )}
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  <span>IRA Contribution</span>
                  <span className="text-[10px] text-[var(--color-info)]">Max: ${Math.floor(LIMITS.ira.monthly).toLocaleString()}</span>
                </label>
                <NumberInput
                  name="monthlyIra"
                  value={inputs.monthlyIra}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, monthlyIra: n }))}
                  min={0}
                  step="50"
                  className={`w-full px-3 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)] border ${
                    inputs.monthlyIra > LIMITS.ira.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] bg-[var(--bg-section)]'
                  }`}
                />
                {inputs.taxStrategy === 'traditional' && inputs.monthlyIra > 0 && calculations.iraDeductibleFraction < 1 && (
                  <p className="mt-2 text-[10px] font-bold text-[var(--color-warning)]">
                    {calculations.iraDeductibleFraction === 0
                      ? 'As an active 401(k) participant with salary above $91k, your traditional IRA contribution is not deductible (2026, single filer) — no immediate tax savings are counted for it.'
                      : 'Your traditional IRA deduction is partially phased out ($81k–$91k salary, active 401(k) participant, 2026 single filer) — only the deductible portion is counted in tax savings.'}
                  </p>
                )}
                {inputs.taxStrategy === 'roth' && inputs.monthlyIra > 0 && inputs.annualSalary > 153000 && (
                  <p className="mt-2 text-[10px] font-bold text-[var(--color-warning)]">
                    Roth IRA eligibility phases out between roughly $153k and $168k MAGI (2026, single filer) — direct contributions may be limited or unavailable at this income.
                  </p>
                )}
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
                  <span>HSA Contribution</span>
                  <span className="text-[10px] text-[var(--color-info)]">Max: ${Math.floor(LIMITS.hsa.monthly).toLocaleString()}</span>
                </label>
                <NumberInput
                  name="monthlyHsa"
                  value={inputs.monthlyHsa}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, monthlyHsa: n }))}
                  min={0}
                  step="10"
                  className={`w-full px-3 py-2.5 rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)] border ${
                    inputs.monthlyHsa > LIMITS.hsa.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] bg-[var(--bg-section)]'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Brokerage / Excess</label>
                <NumberInput
                  name="monthlyBrokerage"
                  value={inputs.monthlyBrokerage}
                  onValueChange={(n) => setInputs(prev => ({ ...prev, monthlyBrokerage: n }))}
                  min={0}
                  step="100"
                  className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                />
              </div>
            </div>
          </div>

          {/* Projection Parameters */}
          <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
            <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Projection Parameters</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Return %</label>
                  <NumberInput
                    name="growthRate"
                    value={inputs.growthRate}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, growthRate: n }))}
                    step="0.5"
                    className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Inflation %</label>
                  <NumberInput
                    name="inflationRate"
                    value={inputs.inflationRate}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, inflationRate: n }))}
                    step="0.1"
                    className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                  />
                </div>
              </div>
              <div>
                <select
                  name="adjustInflation"
                  value={inputs.adjustInflation ? 'true' : 'false'}
                  onChange={(e) => setInputs(prev => ({ ...prev, adjustInflation: e.target.value === 'true' }))}
                  className="w-full px-3 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--emerald-500)]"
                >
                  <option value="false">Show Future Nominal Dollars</option>
                  <option value="true">Show Adjusted "Today" Dollars</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - RESULTS */}
        <div className="lg:col-span-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="mgm-band rounded-xl p-8 text-white shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase text-white/85 mb-2">Total Monthly Outlay</p>
              <div className="text-4xl font-bold mb-1">${calculations.totalMonthly.toLocaleString()}</div>
              <p className="text-xs text-white/85">Gross investment</p>
            </div>

            <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--emerald-border)] shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase text-[var(--text-tertiary)] mb-2">Monthly Tax Savings</p>
              <div className="text-4xl font-bold text-[var(--emerald-500)] mb-1">${Math.round(calculations.monthlyTaxSavings).toLocaleString()}</div>
              <p className="text-xs text-[var(--text-tertiary)]">Net cost: <span className="font-bold text-[var(--text-secondary)]">${Math.round(calculations.netMonthlyCost).toLocaleString()}/mo</span></p>
            </div>

            <div className="bg-[var(--emerald-50)] rounded-xl p-8 border border-[var(--emerald-border)] shadow-[var(--shadow-card)]">
              <p className="text-xs font-bold uppercase text-[var(--emerald-400)] mb-2">30-Year Wealth</p>
              <div className="text-4xl font-bold text-[var(--emerald-500)] mb-1">${Math.round(calculations.totalBalance).toLocaleString()}</div>
              <p className="text-xs text-[var(--emerald-400)]">Estimated balance — pre-tax dollars are still taxed at withdrawal</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
              <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">30-Year Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={calculations.projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E0DBDB" />
                  <XAxis
                    dataKey="year"
                    stroke="#767676"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#767676"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => `$${Number(v).toLocaleString()}`}
                    contentStyle={{ borderRadius: '8px', border: '1px solid #E0DBDB' }}
                  />
                  <Line type="monotone" dataKey="balance" stroke="#1D8072" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tax Breakdown Pie */}
            <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
              <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">Tax & Cost Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Net Cost', value: Math.round(calculations.netMonthlyCost) },
                      { name: 'Tax Savings', value: Math.round(calculations.monthlyTaxSavings) }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    <Cell fill="#4EC9F5" />
                    <Cell fill="#1D8072" />
                  </Pie>
                  <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs font-bold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Annual Allocation Summary */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-section)]">
              <h3 className="font-bold text-[var(--text-secondary)]">Annual Allocation Summary</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculations.allocations.map((allocation, idx) => {
                  if (allocation.monthly <= 0) return null;
                  const annualAmount = allocation.monthly * 12;
                  const annualSavings = allocation.isTaxDeductible ? annualAmount * allocation.deductibleFraction * calculations.taxRate : 0;

                  return (
                    <div key={idx} className="p-4 border border-[var(--border-subtle)] rounded-lg bg-[var(--bg-card)] flex justify-between items-center hover:border-[var(--emerald-border)] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-12 rounded-full" style={{ backgroundColor: allocation.color }}></div>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--text-primary)]">{allocation.name}</h4>
                          <span className={`text-[10px] uppercase font-bold ${allocation.isTaxDeductible ? 'text-[var(--emerald-500)]' : 'text-[var(--text-muted)]'}`}>
                            {allocation.isTaxDeductible ? '✓ Tax Deductible' : 'No Immediate Savings'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[var(--text-primary)] text-lg">${annualAmount.toLocaleString()}</div>
                        {annualSavings > 0 && (
                          <div className="text-[10px] text-[var(--emerald-500)] font-bold">
                            Est. ${Math.round(annualSavings).toLocaleString()} Savings
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-[var(--bg-section)] rounded-lg p-6 border border-[var(--border-default)]">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-[var(--text-muted)] mt-0.5" size={20} />
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Calculations use 2026 IRS limits and assume a single filer. Total Solo 401(k) limit: $72,000 + catch-up contributions.
            Tax savings are estimates based on your provided tax rate. The 30-year wealth figure combines pre-tax, Roth, and taxable
            balances without modeling withdrawal taxes, so it does not by itself favor Roth vs. Traditional — that choice depends on
            your tax rate now vs. in retirement. Consult a tax professional for personalized advice.
          </p>
        </div>
      </div>
      {!isPro && <ProUpsellCard toolId="s-corp-investment" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
