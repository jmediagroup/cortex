"use client";

import React, { useState, useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Calculator, TrendingUp, Info, ArrowUpRight
} from 'lucide-react';

export default function CompoundInterest() {
  const [inputs, setInputs] = useState({
    principal: 25000,
    monthlyContribution: 500,
    annualReturn: 8,
    years: 30,
    compoundingFrequency: 12
  });

  const simulationData = useMemo(() => {
    let data = [];
    let balance = inputs.principal;
    let totalContributions = inputs.principal;

    for (let year = 0; year <= inputs.years; year++) {
      data.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions)
      });

      // Simple yearly calculation for performance
      const yearlyContribution = inputs.monthlyContribution * 12;
      const rate = inputs.annualReturn / 100;
      balance = (balance + yearlyContribution) * (1 + rate);
      totalContributions += yearlyContribution;
    }
    return data;
  }, [inputs]);

  const finalStats = simulationData[simulationData.length - 1];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Future Value</p>
          <h4 className="text-2xl font-black text-slate-900">${finalStats.balance.toLocaleString()}</h4>
          <p className="text-xs font-bold text-indigo-600 mt-1 flex items-center gap-1">
            <ArrowUpRight size={12} /> After {inputs.years} years
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Contributions</p>
          <h4 className="text-2xl font-black text-slate-800">${finalStats.contributions.toLocaleString()}</h4>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Total Interest Earned</p>
          <h4 className="text-2xl font-black text-white">${finalStats.interest.toLocaleString()}</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Input Sidebar */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Calculator size={16} className="text-indigo-600" /> Variables
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Initial Principal</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" name="principal" value={inputs.principal} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Monthly Contribution</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" name="monthlyContribution" value={inputs.monthlyContribution} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Avg. Return Rate (%)</label>
                <input type="number" name="annualReturn" value={inputs.annualReturn} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Investment Horizon (Years)</label>
                <input type="number" name="years" value={inputs.years} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
              <Info size={16} className="text-indigo-400" /> The Rule of 72
            </h4>
            <p className="text-xs font-medium leading-relaxed opacity-80">
              At {inputs.annualReturn}% return, your initial principal of ${inputs.principal.toLocaleString()} will double approximately every {Math.round(72 / (inputs.annualReturn || 1))} years.
            </p>
          </div>
        </aside>

        {/* Chart View */}
        <main className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" /> Growth Trajectory
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="w-3 h-3 rounded-full bg-indigo-600" /> Total Balance
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <div className="w-3 h-3 rounded-full bg-slate-200" /> Basis
              </div>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  formatter={(v) => `$${(v || 0).toLocaleString()}`}
                />
                <Area type="monotone" dataKey="balance" stroke="#4f46e5" strokeWidth={4} fill="#818cf8" fillOpacity={0.1} />
                <Area type="monotone" dataKey="contributions" stroke="#cbd5e1" strokeWidth={2} fill="#f1f5f9" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </main>
      </div>
    </div>
  );
}
