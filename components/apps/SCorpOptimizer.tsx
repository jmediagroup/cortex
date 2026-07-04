"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Zap, Scale, Info
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import Tooltip from '@/components/ui/Tooltip';
import NumberInput from '@/components/ui/NumberInput';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';

interface SCorpOptimizerProps {
  isPro?: boolean;
  onUpgrade?: () => void;
  isLoggedIn?: boolean;
  initialValues?: Record<string, unknown>;
}

export default function SCorpOptimizer({ isPro = false, onUpgrade, isLoggedIn = false, initialValues }: SCorpOptimizerProps) {
  const [profit, setProfit] = useState(150000);
  const [salary, setSalary] = useState(60000);

  const initialApplied = useRef(false);
  useEffect(() => {
    if (!initialValues || initialApplied.current) return;
    initialApplied.current = true;
    const v = initialValues as Record<string, number>;
    if (v.profit != null) setProfit(v.profit);
    if (v.salary != null) setSalary(v.salary);
  }, [initialValues]);

  const stats = useMemo(() => {
    // The 12.4% Social Security portion only applies up to the wage base;
    // the 2.9% Medicare portion is uncapped. Applying the full 15.3% to
    // unlimited income overstates both sides (and the savings) badly at
    // high incomes.
    const SS_WAGE_BASE = 184500; // 2026 Social Security wage base
    // 0.9% Additional Medicare Tax above $200k (single-filer threshold,
    // not inflation-indexed). Employee-side only, but an owner-employee
    // bears it either way.
    const ADDL_MEDICARE_THRESHOLD = 200000;

    // Self-Employment Tax on 92.35% of profit
    const seTaxBase = profit * 0.9235;
    const seTax =
      Math.min(seTaxBase, SS_WAGE_BASE) * 0.124 +
      seTaxBase * 0.029 +
      Math.max(0, seTaxBase - ADDL_MEDICARE_THRESHOLD) * 0.009;

    // S-Corp Calculation
    // Salary is subject to FICA (employer + employee)
    const ficaTax =
      Math.min(salary, SS_WAGE_BASE) * 0.124 +
      salary * 0.029 +
      Math.max(0, salary - ADDL_MEDICARE_THRESHOLD) * 0.009;
    const distributions = Math.max(0, profit - salary);
    // Distributions are NOT subject to FICA

    // Negative when the chosen salary makes the S-corp structure cost
    // more in payroll tax than the sole proprietorship (e.g. salary > profit).
    const sCorpSavings = seTax - ficaTax;

    return {
      solePropTax: seTax,
      sCorpTax: ficaTax,
      savings: sCorpSavings,
      distributions,
      efficiency: seTax > 0 ? (sCorpSavings / seTax) * 100 : 0
    };
  }, [profit, salary]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="s-corp-optimizer"
          toolName="S-Corp Optimizer"
          getInputs={() => ({ profit, salary })}
          getKeyResult={() => `Profit: $${profit.toLocaleString()}, Salary: $${salary.toLocaleString()}`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Est. Payroll Tax Savings</p>
          <h4 className={`text-3xl font-bold ${stats.savings >= 0 ? 'text-[var(--emerald-500)]' : 'text-[var(--crimson-500)]'}`}>
            {stats.savings < 0 ? '-' : ''}${Math.abs(Math.round(stats.savings)).toLocaleString()}
          </h4>
          <p className="text-xs font-bold text-[var(--text-tertiary)] mt-1">
            {stats.savings >= 0 ? 'vs. Sole Proprietorship' : 'S-Corp costs more at this salary'}
          </p>
        </div>
        <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mb-1">Max Distribution</p>
          <h4 className="text-3xl font-bold text-[var(--emerald-500)]">${Math.round(stats.distributions).toLocaleString()}</h4>
          <p className="text-xs font-bold text-[var(--text-tertiary)] mt-1">FICA-exempt income</p>
        </div>
        <div className="mgm-band p-6 rounded-xl shadow-[var(--shadow-card)] text-white">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">Tax Efficiency</p>
          <h4 className="text-3xl font-bold text-white">{Math.round(stats.efficiency)}%</h4>
          <p className="text-xs font-bold text-white/80 mt-1">Reduction in SE Taxes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-6">
            <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Scale size={16} className="text-[var(--navy)]" /> Business Data
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Annual Net Profit</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold z-10">$</span>
                  <NumberInput value={profit} onValueChange={(n) => setProfit(n)} min={0} className="w-full pl-7 pr-4 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[var(--text-muted)] uppercase mb-1">Proposed Reasonable Salary<Tooltip content="The IRS requires S-Corp owners to pay themselves a reasonable salary. This is typically 40-60% of net profit." /></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold z-10">$</span>
                  <NumberInput value={salary} onValueChange={(n) => setSalary(n)} min={0} className="w-full pl-7 pr-4 py-2.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)]" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-[var(--color-warning-soft)] rounded-lg border border-[var(--border-default)] flex items-start gap-3">
              <Info className="text-[var(--color-warning)] shrink-0" size={16} />
              <p className="text-[10px] font-medium leading-relaxed text-[var(--color-warning)]">
                IRS requires a "reasonable salary" based on your industry. Setting this too low may trigger an audit.
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-section)] rounded-lg border border-[var(--border-default)] flex items-start gap-3">
              <Info className="text-[var(--text-muted)] shrink-0" size={16} />
              <p className="text-[10px] font-medium leading-relaxed text-[var(--text-secondary)]">
                This compares payroll (FICA / self-employment) taxes only, for tax year 2026. A higher salary also shrinks the 20% qualified business income (§199A) deduction on pass-through profit, so your all-in tax savings can be smaller than shown — or negative. It also excludes state payroll taxes, unemployment tax, and payroll-service costs. Run the numbers with a CPA before electing.
              </p>
            </div>
          </div>
        </aside>

        {/* Comparison Chart */}
        <main className="lg:col-span-8 bg-[var(--bg-card)] p-8 rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)]">
          <h3 className="text-xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-2">
            <Zap className="text-[var(--navy)]" fill="currentColor" /> Tax Structure Comparison
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Sole Prop', tax: stats.solePropTax, color: '#767676' },
                { name: 'S-Corp (Target)', tax: stats.sCorpTax, color: '#1D8072' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0DBDB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#767676', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#767676', fontSize: 12, fontWeight: 'bold'}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <ChartTooltip cursor={{fill: 'rgba(5,76,125,0.06)'}} formatter={(v) => `$${Math.round(Number(v) || 0).toLocaleString()}`} />
                <Bar dataKey="tax" radius={[12, 12, 0, 0]} barSize={80}>
                  {[0, 1].map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#767676' : '#1D8072'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
      {!isPro && <ProUpsellCard toolId="s-corp-optimizer" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
