"use client";

import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, PiggyBank, Shield, AlertCircle, Lock } from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked :
                (type === 'select-one' || name === 'taxStrategy') ? value :
                parseFloat(value) || 0;
    setInputs(prev => ({ ...prev, [name]: val }));
  };

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
        color: '#06b6d4',
        isTaxDeductible: true
      },
      {
        name: `401(k) Employee (${inputs.taxStrategy === 'roth' ? 'Roth' : 'Traditional'})`,
        monthly: inputs.monthlyEmp401k,
        color: inputs.taxStrategy === 'roth' ? '#a855f7' : '#10b981',
        isTaxDeductible: inputs.taxStrategy === 'traditional'
      },
      {
        name: '401(k) Company Match',
        monthly: inputs.monthlyCo401k,
        color: '#065f46',
        isTaxDeductible: true
      },
      {
        name: `IRA (${inputs.taxStrategy === 'roth' ? 'Roth' : 'Traditional'})`,
        monthly: inputs.monthlyIra,
        color: inputs.taxStrategy === 'roth' ? '#6366f1' : '#047857',
        isTaxDeductible: inputs.taxStrategy === 'traditional'
      },
      {
        name: 'Brokerage',
        monthly: inputs.monthlyBrokerage,
        color: '#9ca3af',
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
        <div className="max-w-md text-center p-12 bg-amber-50 border-2 border-amber-200 rounded-[3rem]">
          <Lock className="mx-auto text-amber-600 mb-4" size={48} />
          <h3 className="text-2xl font-black text-amber-900 mb-3">Pro Feature</h3>
          <p className="text-amber-700 font-medium mb-6">
            The S-Corp Investment Optimizer is available exclusively to Pro subscribers. Upgrade to access advanced business tax optimization tools.
          </p>
          <button
            onClick={onUpgrade}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-8 rounded-2xl transition-colors"
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
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-[2.5rem] p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-100 rounded-2xl">
            <Shield className="text-emerald-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-emerald-900 mb-2">S-Corp Investment Strategy</h3>
            <p className="text-emerald-700 font-medium text-sm leading-relaxed">
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
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <DollarSign className="text-emerald-600" size={24} />
              Business & Tax Profile
            </h3>

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Annual W-2 Salary</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    name="annualSalary"
                    value={inputs.annualSalary}
                    onChange={handleInputChange}
                    step="1000"
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Your Age</label>
                  <input
                    type="number"
                    name="age"
                    value={inputs.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Est. Tax Rate %</label>
                  <input
                    type="number"
                    name="estTaxRate"
                    value={inputs.estTaxRate}
                    onChange={handleInputChange}
                    step="1"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">401(k) Mode</label>
                <select
                  name="taxStrategy"
                  value={inputs.taxStrategy}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                >
                  <option value="roth">Roth (Employee)</option>
                  <option value="traditional">Traditional (Pre-Tax)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Monthly Contributions */}
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-blue-200 border-t-4 shadow-sm">
            <h3 className="text-xl font-black text-blue-800 mb-6 flex items-center gap-3">
              <PiggyBank className="text-blue-600" size={24} />
              Monthly Contributions
            </h3>

            <div className="space-y-5">
              <div>
                <label className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  <span>Employee 401(k)</span>
                  <span className="text-[10px] text-blue-600">Max: ${Math.floor(LIMITS.emp401k.monthly).toLocaleString()}</span>
                </label>
                <input
                  type="number"
                  name="monthlyEmp401k"
                  value={inputs.monthlyEmp401k}
                  onChange={handleInputChange}
                  step="50"
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none transition-colors ${
                    inputs.monthlyEmp401k > LIMITS.emp401k.monthly ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  <span>Company 401(k) Match</span>
                  <span className="text-[10px] text-blue-600">Max: ${Math.floor(LIMITS.co401k.monthly).toLocaleString()}</span>
                </label>
                <input
                  type="number"
                  name="monthlyCo401k"
                  value={inputs.monthlyCo401k}
                  onChange={handleInputChange}
                  step="50"
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none transition-colors ${
                    inputs.monthlyCo401k > LIMITS.co401k.monthly ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  <span>IRA Contribution</span>
                  <span className="text-[10px] text-blue-600">Max: ${Math.floor(LIMITS.ira.monthly).toLocaleString()}</span>
                </label>
                <input
                  type="number"
                  name="monthlyIra"
                  value={inputs.monthlyIra}
                  onChange={handleInputChange}
                  step="50"
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none transition-colors ${
                    inputs.monthlyIra > LIMITS.ira.monthly ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  <span>HSA Contribution</span>
                  <span className="text-[10px] text-blue-600">Max: ${Math.floor(LIMITS.hsa.monthly).toLocaleString()}</span>
                </label>
                <input
                  type="number"
                  name="monthlyHsa"
                  value={inputs.monthlyHsa}
                  onChange={handleInputChange}
                  step="10"
                  className={`w-full px-4 py-3 border-2 rounded-2xl font-bold text-slate-900 focus:outline-none transition-colors ${
                    inputs.monthlyHsa > LIMITS.hsa.monthly ? 'border-red-400 bg-red-50' : 'border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Brokerage / Excess</label>
                <input
                  type="number"
                  name="monthlyBrokerage"
                  value={inputs.monthlyBrokerage}
                  onChange={handleInputChange}
                  step="100"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Projection Parameters */}
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Projection Parameters</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Return %</label>
                  <input
                    type="number"
                    name="growthRate"
                    value={inputs.growthRate}
                    onChange={handleInputChange}
                    step="0.5"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Inflation %</label>
                  <input
                    type="number"
                    name="inflationRate"
                    value={inputs.inflationRate}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
              <div>
                <select
                  name="adjustInflation"
                  value={inputs.adjustInflation ? 'true' : 'false'}
                  onChange={(e) => setInputs(prev => ({ ...prev, adjustInflation: e.target.value === 'true' }))}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-2xl font-medium text-sm text-slate-900 focus:border-emerald-500 focus:outline-none transition-colors"
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
            <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-[2.5rem] p-8 text-white shadow-xl">
              <p className="text-xs font-bold uppercase text-emerald-100 mb-2">Total Monthly Outlay</p>
              <div className="text-4xl font-black mb-1">${calculations.totalMonthly.toLocaleString()}</div>
              <p className="text-xs text-emerald-100">Gross investment</p>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-emerald-200 shadow-md">
              <p className="text-xs font-bold uppercase text-slate-500 mb-2">Monthly Tax Savings</p>
              <div className="text-4xl font-black text-emerald-600 mb-1">${Math.round(calculations.monthlyTaxSavings).toLocaleString()}</div>
              <p className="text-xs text-slate-500">Net cost: <span className="font-bold text-slate-700">${Math.round(calculations.netMonthlyCost).toLocaleString()}/mo</span></p>
            </div>

            <div className="bg-indigo-50 rounded-[2.5rem] p-8 border-2 border-indigo-200 shadow-md">
              <p className="text-xs font-bold uppercase text-indigo-500 mb-2">30-Year Wealth</p>
              <div className="text-4xl font-black text-indigo-700 mb-1">${Math.round(calculations.totalBalance).toLocaleString()}</div>
              <p className="text-xs text-indigo-500">Estimated balance</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Growth Chart */}
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">30-Year Growth</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={calculations.projectionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="year"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fontSize: 11 }}
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
                  <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Tax Breakdown Pie */}
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-200 shadow-sm">
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Tax & Cost Breakdown</h3>
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
                    <Cell fill="#3b82f6" />
                    <Cell fill="#10b981" />
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
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b-2 border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-700">Annual Allocation Summary</h3>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {calculations.allocations.map((allocation, idx) => {
                  if (allocation.monthly <= 0) return null;
                  const annualAmount = allocation.monthly * 12;
                  const annualSavings = allocation.isTaxDeductible ? annualAmount * calculations.taxRate : 0;

                  return (
                    <div key={idx} className="p-4 border-2 border-slate-100 rounded-2xl bg-white flex justify-between items-center hover:border-emerald-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-12 rounded-full" style={{ backgroundColor: allocation.color }}></div>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">{allocation.name}</h4>
                          <span className={`text-[10px] uppercase font-bold ${allocation.isTaxDeductible ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {allocation.isTaxDeductible ? '✓ Tax Deductible' : 'No Immediate Savings'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-slate-900 text-lg">${annualAmount.toLocaleString()}</div>
                        {annualSavings > 0 && (
                          <div className="text-[10px] text-emerald-600 font-bold">
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
      <div className="bg-slate-50 rounded-2xl p-6 border-2 border-slate-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-slate-400 mt-0.5" size={20} />
          <p className="text-xs text-slate-600 font-medium">
            Calculations use projected 2026 IRS limits. Total Solo 401(k) limit: $72,000 + catch-up contributions.
            Tax savings are estimates based on your provided tax rate. Consult a tax professional for personalized advice.
          </p>
        </div>
      </div>
    </div>
  );
}
