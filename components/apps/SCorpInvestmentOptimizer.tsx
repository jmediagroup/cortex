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

    return {
      emp401k: { annual: emp401kLimit, monthly: maxEmpMonthly },
      co401k: { annual: inputs.annualSalary * 0.25, monthly: maxCoMonthly },
      ira: { annual: iraLimit, monthly: maxIraMonthly },
      hsa: { annual: hsaLimit, monthly: maxHsaMonthly }
    };
  }, [inputs.age, inputs.annualSalary]);

  // Calculate allocations and projections
  const calculations = useMemo(() => {
    const allocations = [
      {
        name: 'HSA',
        monthly: inputs.monthlyHsa,
        color: '#5AC8FA',
        isTaxDeductible: true
      },
      {
        name: `401(k) Employee (${inputs.taxStrategy === 'roth' ? 'Roth' : 'Traditional'})`,
        monthly: inputs.monthlyEmp401k,
        color: inputs.taxStrategy === 'roth' ? '#BF5AF2' : '#00F0A0',
        isTaxDeductible: inputs.taxStrategy === 'traditional'
      },
      {
        name: '401(k) Company Match',
        monthly: inputs.monthlyCo401k,
        color: '#006945',
        isTaxDeductible: true
      },
      {
        name: `IRA (${inputs.taxStrategy === 'roth' ? 'Roth' : 'Traditional'})`,
        monthly: inputs.monthlyIra,
        color: inputs.taxStrategy === 'roth' ? '#00F0A0' : '#009466',
        isTaxDeductible: inputs.taxStrategy === 'traditional'
      },
      {
        name: 'Brokerage',
        monthly: inputs.monthlyBrokerage,
        color: '#8E8E93',
        isTaxDeductible: false
      }
    ];

    const totalMonthly = allocations.reduce((sum, a) => sum + a.monthly, 0);
    const taxRate = inputs.estTaxRate / 100;
    const monthlyTaxDeduction = allocations
      .filter(a => a.isTaxDeductible)
      .reduce((sum, a) => sum + a.monthly, 0);
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
      taxRate
    };
  }, [inputs]);

  // Pro feature gate
  if (!isPro) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="max-w-md text-center p-12 bg-[var(--color-warning-soft)] border-2 border-[var(--glass-border-strong)] rounded-[3rem]">
          <Lock className="mx-auto text-[var(--color-warning)] mb-4" size={48} />
          <h3 className="text-2xl font-bold text-[var(--color-warning)] mb-3">Pro Feature</h3>
          <p className="text-[var(--color-warning)] font-medium mb-6">
            The S-Corp Investment Optimizer is available exclusively to Pro subscribers. Upgrade to access advanced business tax optimization tools.
          </p>
          <button
            onClick={onUpgrade}
            className="bg-[var(--emerald-500)] hover:bg-[var(--emerald-500)] text-white font-bold py-3 px-8 rounded-2xl transition-colors"
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
      <div className="bg-[var(--emerald-50)] border-2 border-[var(--emerald-border)] rounded-[2.5rem] p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--emerald-100)] rounded-2xl">
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
          <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border-2 border-[var(--border-default)] shadow-sm">
            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
              <DollarSign className="text-[var(--emerald-500)]" size={24} />
              Business & Tax Profile
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Annual W-2 Salary</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">$</span>
                  <NumberInput
                    name="annualSalary"
                    value={inputs.annualSalary}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, annualSalary: n }))}
                    min={0}
                    step="1000"
                    className="w-full pl-8 pr-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-bold text-[var(--text-primary)] focus:border-[var(--emerald-border)] focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-bold text-[var(--text-primary)] focus:border-[var(--emerald-border)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Est. Tax Rate %</label>
                  <NumberInput
                    name="estTaxRate"
                    value={inputs.estTaxRate}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, estTaxRate: n }))}
                    step="1"
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-bold text-[var(--text-primary)] focus:border-[var(--emerald-border)] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">401(k) Mode</label>
                <select
                  name="taxStrategy"
                  value={inputs.taxStrategy}
                  onChange={(e) => setInputs(prev => ({ ...prev, taxStrategy: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-bold text-[var(--text-primary)] focus:border-[var(--emerald-border)] focus:outline-none transition-colors"
                >
                  <option value="roth">Roth (Employee)</option>
                  <option value="traditional">Traditional (Pre-Tax)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monthly Contributions */}
          <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border-2 border-[var(--color-info-soft)] border-t-4 shadow-sm">
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
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-[var(--text-primary)] focus:outline-none transition-colors ${
                    inputs.monthlyEmp401k > LIMITS.emp401k.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] focus:border-[var(--color-info)]'
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
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-[var(--text-primary)] focus:outline-none transition-colors ${
                    inputs.monthlyCo401k > LIMITS.co401k.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] focus:border-[var(--color-info)]'
                  }`}
                />
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
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-[var(--text-primary)] focus:outline-none transition-colors ${
                    inputs.monthlyIra > LIMITS.ira.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] focus:border-[var(--color-info)]'
                  }`}
                />
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
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-[var(--text-primary)] focus:outline-none transition-colors ${
                    inputs.monthlyHsa > LIMITS.hsa.monthly ? 'border-[var(--crimson-border)] bg-[var(--crimson-50)]' : 'border-[var(--border-default)] focus:border-[var(--color-info)]'
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
                  className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-bold text-[var(--text-primary)] focus:border-[var(--color-info)] focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Projection Parameters */}
          <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border-2 border-[var(--border-default)] shadow-sm">
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
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-bold text-[var(--text-primary)] focus:border-[var(--emerald-border)] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">Inflation %</label>
                  <NumberInput
                    name="inflationRate"
                    value={inputs.inflationRate}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, inflationRate: n }))}
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-bold text-[var(--text-primary)] focus:border-[var(--emerald-border)] focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <select
                  name="adjustInflation"
                  value={inputs.adjustInflation ? 'true' : 'false'}
                  onChange={(e) => setInputs(prev => ({ ...prev, adjustInflation: e.target.value === 'true' }))}
                  className="w-full px-4 py-3 border-2 border-[var(--border-default)] rounded-2xl font-medium text-sm text-[var(--text-primary)] focus:border-[var(--emerald-border)] focus:outline-none transition-colors"
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
            <div className="bg-gradient-to-br from-[var(--emerald-600)] to-[var(--emerald-700)] rounded-[2.5rem] p-8 text-white shadow-xl">
              <p className="text-xs font-bold uppercase text-white/85 mb-2">Total Monthly Outlay</p>
              <div className="text-4xl font-bold mb-1">${calculations.totalMonthly.toLocaleString()}</div>
              <p className="text-xs text-white/85">Gross investment</p>
            </div>

            <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border-2 border-[var(--emerald-border)] shadow-md">
              <p className="text-xs font-bold uppercase text-[var(--text-tertiary)] mb-2">Monthly Tax Savings</p>
              <div className="text-4xl font-bold text-[var(--emerald-500)] mb-1">${Math.round(calculations.monthlyTaxSavings).toLocaleString()}</div>
              <p className="text-xs text-[var(--text-tertiary)]">Net cost: <span className="font-bold text-[var(--text-secondary)]">${Math.round(calculations.netMonthlyCost).toLocaleString()}/mo</span></p>
            </div>

            <div className="bg-[var(--emerald-50)] rounded-[2.5rem] p-8 border-2 border-[var(--emerald-border)] shadow-md">
              <p className="text-xs font-bold uppercase text-[var(--emerald-400)] mb-2">30-Year Wealth</p>
              <div className="text-4xl font-bold text-[var(--emerald-500)] mb-1">${Math.round(calculations.totalBalance).toLocaleString()}</div>
              <p className="text-xs text-[var(--emerald-400)]">Estimated balance</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border-2 border-[var(--border-default)] shadow-sm">
              <h3 className="text-sm font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-4">30-Year Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={calculations.projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#48484A" />
                  <XAxis
                    dataKey="year"
                    stroke="#8E8E93"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#8E8E93"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => `$${Number(v).toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', border: '2px solid #48484A' }}
                  />
                  <Line type="monotone" dataKey="balance" stroke="#00F0A0" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tax Breakdown Pie */}
            <div className="bg-[var(--bg-card)] rounded-[2.5rem] p-8 border-2 border-[var(--border-default)] shadow-sm">
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
                    <Cell fill="#5AC8FA" />
                    <Cell fill="#00F0A0" />
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
          <div className="bg-[var(--bg-card)] rounded-[2.5rem] border-2 border-[var(--border-default)] shadow-sm overflow-hidden">
            <div className="p-6 border-b-2 border-[var(--border-subtle)] bg-[var(--bg-section)]">
              <h3 className="font-bold text-[var(--text-secondary)]">Annual Allocation Summary</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculations.allocations.map((allocation, idx) => {
                  if (allocation.monthly <= 0) return null;
                  const annualAmount = allocation.monthly * 12;
                  const annualSavings = allocation.isTaxDeductible ? annualAmount * calculations.taxRate : 0;

                  return (
                    <div key={idx} className="p-4 border-2 border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-card)] flex justify-between items-center hover:border-[var(--emerald-border)] transition-colors">
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
      <div className="bg-[var(--bg-section)] rounded-2xl p-6 border-2 border-[var(--border-default)]">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-[var(--text-muted)] mt-0.5" size={20} />
          <p className="text-xs text-[var(--text-secondary)] font-medium">
            Calculations use projected 2026 IRS limits. Total Solo 401(k) limit: $72,000 + catch-up contributions.
            Tax savings are estimates based on your provided tax rate. Consult a tax professional for personalized advice.
          </p>
        </div>
      </div>
      {!isPro && <ProUpsellCard toolId="s-corp-investment" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
