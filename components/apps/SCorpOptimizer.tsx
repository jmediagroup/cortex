"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import {
  Zap, Scale, Info
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';

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
    // Self-Employment Tax (15.3% on 92.35% of profit)
    const seTaxBase = profit * 0.9235;
    const seTax = seTaxBase * 0.153;

    // S-Corp Calculation
    // Salary is subject to FICA (15.3% total employer/employee)
    const ficaTax = salary * 0.153;
    const distributions = Math.max(0, profit - salary);
    // Distributions are NOT subject to FICA

    const sCorpSavings = Math.max(0, seTax - ficaTax);

    return {
      solePropTax: seTax,
      sCorpTax: ficaTax,
      savings: sCorpSavings,
      distributions,
      efficiency: (sCorpSavings / seTax) * 100
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Est. Payroll Tax Savings</p>
          <h4 className="text-3xl font-black text-emerald-600">${Math.round(stats.savings).toLocaleString()}</h4>
          <p className="text-xs font-bold text-slate-500 mt-1">vs. Sole Proprietorship</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Max Distribution</p>
          <h4 className="text-3xl font-black text-indigo-600">${Math.round(stats.distributions).toLocaleString()}</h4>
          <p className="text-xs font-bold text-slate-500 mt-1">FICA-exempt income</p>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Tax Efficiency</p>
          <h4 className="text-3xl font-black text-white">{Math.round(stats.efficiency)}%</h4>
          <p className="text-xs font-bold text-indigo-100 mt-1">Reduction in SE Taxes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Scale size={16} className="text-amber-500" /> Business Data
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Annual Net Profit</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" value={profit} onChange={(e) => setProfit(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Proposed Reasonable Salary</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" value={salary} onChange={(e) => setSalary(parseFloat(e.target.value) || 0)} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
              <Info className="text-amber-600 shrink-0" size={16} />
              <p className="text-[10px] font-medium leading-relaxed text-amber-800">
                IRS requires a "reasonable salary" based on your industry. Setting this too low may trigger an audit.
              </p>
            </div>
          </div>
        </aside>

        {/* Comparison Chart */}
        <main className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-2">
            <Zap className="text-amber-500" fill="currentColor" /> Tax Structure Comparison
          </h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Sole Prop', tax: stats.solePropTax, color: '#94a3b8' },
                { name: 'S-Corp (Target)', tax: stats.sCorpTax, color: '#4f46e5' }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip cursor={{fill: '#f8fafc'}} formatter={(v) => `$${Math.round(Number(v) || 0).toLocaleString()}`} />
                <Bar dataKey="tax" radius={[12, 12, 0, 0]} barSize={80}>
                  {[0, 1].map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#94a3b8' : '#4f46e5'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
