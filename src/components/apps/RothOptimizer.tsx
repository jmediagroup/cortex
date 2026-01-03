"use client";

import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend
} from 'recharts';
import { 
  TrendingDown, 
  ShieldCheck, 
  Calculator, 
  RefreshCw,
  Zap,
  Scale,
  TrendingUp,
  History,
  Lock,
  Wallet,
  PiggyBank,
  Coins
} from 'lucide-react';

/**
 * RESOLUTION FIX:
 * Switched from alias '@/' to relative path '../../' to ensure the 
 * bundler can find the AuthContext from the components/apps directory.
 */
import { useAuth } from '../../context/AuthContext';

// 2024 Federal Brackets for Single Filer (Simplified)
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

const calculateTaxes = (taxableIncome: number) => {
  if (taxableIncome <= 0) return 0;
  let income = Math.max(0, taxableIncome - STANDARD_DEDUCTION);
  let tax = 0;
  let prevCap = 0;
  for (const b of TAX_BRACKETS) {
    const chunk = Math.min(income, b.cap - prevCap);
    tax += chunk * b.rate;
    income -= chunk;
    prevCap = b.cap;
    if (income <= 0) break;
  }
  return tax;
};

export default function RothOptimizer() {
  const { profile } = useAuth();
  const isPro = profile?.tier === 'pro';

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
    manualConvAmount: 25000,
    sequenceRisk: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'isAutoOptimize' && !isPro && checked) return;

    const val = type === 'checkbox' ? checked : (isNaN(parseFloat(value)) ? value : parseFloat(value));
    
    if (name.includes('.')) {
      const [cat, field] = name.split('.');
      if (cat === 'balances') {
        setInputs(prev => ({ 
          ...prev, 
          balances: { ...prev.balances, [field]: val } 
        }));
      }
    } else {
      setInputs(prev => ({ ...prev, [name]: val }));
    }
  };

  const runSimulation = (simInputs: typeof inputs, useLadder: boolean) => {
    const data = [];
    let balances = { ...simInputs.balances };
    
    for (let year = 0; year <= (simInputs.endAge - simInputs.currentAge); year++) {
      const age = simInputs.currentAge + year;
      const isRetired = age >= simInputs.retirementAge;
      const inflationFactor = Math.pow(1 + simInputs.inflationRate / 100, year);
      
      const yr = {
        age,
        year: new Date().getFullYear() + year,
        spending: isRetired ? simInputs.annualSpending * inflationFactor : 0,
        ssIncome: age >= simInputs.ssStartAge ? simInputs.ssAmount * inflationFactor : 0,
        conversion: 0,
        withdrawals: { taxable: 0, traditional: 0, roth: 0 },
        taxes: 0,
        rmd: 0,
        totalBalance: 0
      };

      let taxableIncome = yr.ssIncome * 0.85; 
      let cashGap = Math.max(0, yr.spending - yr.ssIncome);

      if (age >= 73) {
        const divisor = 26.5 - (age - 73); 
        yr.rmd = Math.max(0, balances.traditional / Math.max(divisor, 6));
        const takeRmd = Math.min(balances.traditional, yr.rmd);
        balances.traditional -= takeRmd;
        yr.withdrawals.traditional += takeRmd;
        taxableIncome += takeRmd;
        cashGap = Math.max(0, cashGap - takeRmd);
      }

      if (useLadder && age < 73 && balances.traditional > 0) {
        let amountToConvert = 0;
        if (simInputs.isAutoOptimize && isPro) {
          const targetCap = TAX_BRACKETS[simInputs.targetBracketIndex].cap + STANDARD_DEDUCTION;
          amountToConvert = Math.max(0, targetCap - taxableIncome);
          amountToConvert = Math.min(balances.traditional, amountToConvert);
        } else {
          amountToConvert = Math.min(balances.traditional, simInputs.manualConvAmount);
        }
        
        balances.traditional -= amountToConvert;
        balances.roth += amountToConvert;
        yr.conversion = amountToConvert;
        taxableIncome += amountToConvert;
      }

      const order = ['taxable', 'traditional', 'roth'] as const;
      order.forEach(type => {
        if (cashGap > 0) {
          const take = Math.min(balances[type], cashGap);
          balances[type] -= take;
          yr.withdrawals[type] += take;
          cashGap -= take;
          if (type === 'traditional') taxableIncome += take;
        }
      });

      yr.taxes = calculateTaxes(taxableIncome);
      if (balances.taxable >= yr.taxes) {
        balances.taxable -= yr.taxes;
      } else {
        const diff = yr.taxes - balances.taxable;
        balances.taxable = 0;
        balances.roth = Math.max(0, balances.roth - diff);
      }

      let mktReturn = simInputs.avgReturn / 100;
      if (simInputs.sequenceRisk && age >= simInputs.retirementAge && age < simInputs.retirementAge + 3) {
        mktReturn = -0.12;
      }
      
      balances.taxable *= (1 + mktReturn);
      balances.traditional *= (1 + mktReturn);
      balances.roth *= (1 + mktReturn);

      yr.totalBalance = Math.max(0, balances.taxable + balances.traditional + balances.roth);
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
        activeTax,
        legacyDelta: activeLast.totalBalance - baseLast.totalBalance,
        taxDelta: baseTax - activeTax,
      }
    };
  }, [inputs, isPro]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Projected Legacy</p>
          <h4 className="text-2xl font-black text-slate-900">${Math.round(stats.activeLegacy).toLocaleString()}</h4>
          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-indigo-600">
            <TrendingUp size={12} /> +${Math.round(stats.legacyDelta).toLocaleString()} vs baseline
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Lifetime Taxes</p>
          <h4 className="text-2xl font-black text-slate-900">${Math.round(stats.activeTax).toLocaleString()}</h4>
          <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-600">
            <TrendingDown size={12} /> -${Math.round(stats.taxDelta).toLocaleString()} savings
          </div>
        </div>
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Current Strategy</p>
          <h4 className="text-xl font-black">{inputs.isAutoOptimize ? 'Auto-Optimized' : 'Manual Ladder'}</h4>
          <p className="text-xs text-indigo-100 mt-2 opacity-80 tracking-tight">Focus: Tax Bracket Efficiency</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <section className="bg-white p-7 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Wallet size={16} className="text-indigo-600" /> Initial Balances
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <Coins size={10} /> Taxable Brokerage
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" name="balances.taxable" value={inputs.balances.taxable} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <PiggyBank size={10} /> Traditional IRA/401(k)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" name="balances.traditional" value={inputs.balances.traditional} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                  <ShieldCheck size={10} /> Roth IRA
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-300 font-bold">$</span>
                  <input type="number" name="balances.roth" value={inputs.balances.roth} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Calculator size={16} className="text-indigo-600" /> Retirement Info
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Retire Age</label>
                  <input type="number" name="retirementAge" value={inputs.retirementAge} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Target Spend</label>
                  <input type="number" name="annualSpending" value={inputs.annualSpending} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold" />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-slate-900 text-white p-7 rounded-[2.5rem] shadow-xl">
             <h3 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
               <Scale size={16} /> Ladder Logic
             </h3>
             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-indigo-400 uppercase mb-2">Annual Conversion Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-2.5 text-indigo-400 font-bold">$</span>
                    <input type="number" name="manualConvAmount" value={inputs.manualConvAmount} onChange={handleInputChange} className="w-full pl-8 pr-4 py-2.5 bg-slate-800 border-none rounded-xl text-white font-black outline-none focus:ring-2 focus:ring-indigo-500" />
                  </div>
                </div>

                <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isPro ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'}`}>
                        {isPro ? <Zap size={16} fill="currentColor" /> : <Lock size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-black">Auto-Optimization</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Pro License Required</p>
                      </div>
                    </div>
                    <input 
                      type="checkbox" name="isAutoOptimize" checked={inputs.isAutoOptimize} 
                      onChange={handleInputChange} disabled={!isPro}
                      className="w-5 h-5 rounded-md accent-indigo-500 disabled:opacity-30" 
                    />
                  </div>
                </div>

                <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                  Update Simulation <RefreshCw size={14} />
                </button>
             </div>
          </section>
        </aside>

        {/* Chart Area */}
        <main className="lg:col-span-8 space-y-6">
          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <History className="text-indigo-600" /> 40-Year Portfolio Trajectory
              </h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                  <div className="w-3 h-3 rounded-full bg-indigo-600" /> Optimized Ladder
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                  <div className="w-3 h-3 rounded-full bg-slate-200" /> Baseline Plan
                </div>
              </div>
            </div>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeSim.map((d, i) => ({
                  age: d.age,
                  active: d.totalBalance,
                  base: baselineSim[i].totalBalance
                }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }}
                    formatter={(v: number | undefined) => [`$${Math.round(v ?? 0).toLocaleString()}`, 'Portfolio Value']}
                  />
                  <Area type="monotone" dataKey="active" stroke="#4f46e5" strokeWidth={4} fill="#818cf8" fillOpacity={0.08} />
                  <Area type="monotone" dataKey="base" stroke="#cbd5e1" strokeWidth={2} fill="#f1f5f9" fillOpacity={0.05} strokeDasharray="6 6" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm">
            <h3 className="text-lg font-black text-slate-800 mb-8">Annual Withdrawal & Conversion Activity</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeSim}>
                  <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => `$${Math.round(v).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="conversion" name="Roth Conversion" fill="#4f46e5" stackId="a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="withdrawals.traditional" name="IRA Withdrawal" fill="#fbbf24" stackId="a" />
                  <Bar dataKey="withdrawals.taxable" name="Brokerage Pull" fill="#94a3b8" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}