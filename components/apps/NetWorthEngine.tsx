"use client";

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  Zap,
  Layers,
  Target,
  ArrowRightLeft,
  Activity,
  Maximize2,
  Trash2,
  Plus
} from 'lucide-react';

/**
 * CORTEX: NET WORTH ENGINE
 * A decision-support tool optimized for clarity and long-term agency.
 */

const ASSET_PRESETS = [
  { label: 'Checking Account', liquid: true, category: 'Cash' },
  { label: 'Savings Account', liquid: true, category: 'Cash' },
  { label: '401k (Traditional)', liquid: false, category: 'Retirement' },
  { label: '401k (Roth)', liquid: false, category: 'Retirement' },
  { label: 'IRA (Traditional)', liquid: false, category: 'Retirement' },
  { label: 'IRA (Roth)', liquid: false, category: 'Retirement' },
  { label: 'HSA', liquid: false, category: 'Health' },
  { label: 'Home Equity (Cost Basis)', liquid: false, category: 'Property', note: 'Price + Improvements' },
  { label: 'Vehicle (Est. Value)', liquid: false, category: 'Vehicle' },
  { label: 'Brokerage Account', liquid: true, category: 'Investments' },
  { label: 'Crypto', liquid: true, category: 'Investments' },
  { label: 'Other Asset', liquid: true, category: 'Other' },
];

const LIABILITY_PRESETS = [
  { label: 'Mortgage', rate: 4.5, term: 30, category: 'Housing' },
  { label: 'Vehicle Loan', rate: 6.0, term: 5, category: 'Vehicle' },
  { label: 'Student Loan', rate: 5.0, term: 10, category: 'Education' },
  { label: 'Personal Loan', rate: 10.0, term: 3, category: 'Personal' },
  { label: 'Credit Card', rate: 22.0, term: 1, category: 'Credit' },
  { label: 'Other Liability', rate: 0, term: 1, category: 'Other' },
];

interface Asset {
  id: string;
  category: string;
  label: string;
  value: number;
  confidence: number;
  liquid: boolean;
  note?: string;
}

interface Liability {
  id: string;
  category: string;
  label: string;
  value: number;
  rate: number;
  term: number;
}

export default function NetWorthEngine() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [growthRate, setGrowthRate] = useState(5);
  const [view, setView] = useState('snapshot');

  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showLibMenu, setShowLibMenu] = useState(false);

  // --- State Handlers ---

  const addAsset = (preset: typeof ASSET_PRESETS[0]) => {
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      category: preset.category,
      label: preset.label,
      value: 0,
      confidence: 1,
      liquid: preset.liquid,
      note: preset.note || ''
    };
    setAssets(prev => [...prev, newAsset]);
    setShowAssetMenu(false);
  };

  const addLiability = (preset: typeof LIABILITY_PRESETS[0]) => {
    const newLiability: Liability = {
      id: crypto.randomUUID(),
      category: preset.category,
      label: preset.label,
      value: 0,
      rate: preset.rate,
      term: preset.term,
    };
    setLiabilities(prev => [...prev, newLiability]);
    setShowLibMenu(false);
  };

  const removeNode = (type: 'asset' | 'liability', id: string) => {
    if (type === 'asset') setAssets(prev => prev.filter(a => a.id !== id));
    else setLiabilities(prev => prev.filter(l => l.id !== id));
  };

  const updateNode = (type: 'asset' | 'liability', id: string, field: string, val: any) => {
    if (type === 'asset') {
      setAssets(prev => prev.map(a => a.id === id ? { ...a, [field]: val } : a));
    } else {
      setLiabilities(prev => prev.map(l => l.id === id ? { ...l, [field]: val } : l));
    }
  };

  // --- Calculations ---

  const metrics = useMemo(() => {
    const totalAssets = assets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const liquidAssets = assets.filter(a => a.liquid).reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const liquidityRatio = totalAssets > 0 ? liquidAssets / totalAssets : 0;

    const annualAssetGrowth = totalAssets * (growthRate / 100);
    const annualSavings = monthlySavings * 12;
    const momentumScore = totalAssets > 0 ? (annualAssetGrowth + annualSavings) / totalAssets : 0;

    let momentumStatus = 'Stable';
    if (momentumScore > 0.15) momentumStatus = 'Improving';
    if (momentumScore < 0.05 && momentumScore > 0) momentumStatus = 'Fragile';
    if (momentumScore <= 0 && (totalAssets > 0 || totalLiabilities > 0)) momentumStatus = 'Reversing';

    const monthsOfRunway = totalLiabilities > 0 ? liquidAssets / (totalLiabilities * 0.05) : 100;
    let optionality = 'Moderate';
    if (monthsOfRunway > 24) optionality = 'High';
    if (monthsOfRunway < 6) optionality = 'Low';

    const highInterestDebts = liabilities.filter(l => Number(l.rate) >= 7 && Number(l.value) > 0)
      .sort((a, b) => b.rate - a.rate);

    const shortTermDebts = liabilities.filter(l => Number(l.term) <= 3 && Number(l.value) > 0)
      .sort((a, b) => a.term - b.term);

    return {
      totalAssets,
      totalLiabilities,
      netWorth,
      liquidAssets,
      liquidityRatio,
      momentumStatus,
      optionality,
      momentumScore,
      highInterestDebts,
      shortTermDebts,
      complexity: (assets.length + liabilities.length) > 12 ? 'High' : (assets.length + liabilities.length) > 6 ? 'Moderate' : 'Low'
    };
  }, [assets, liabilities, monthlySavings, growthRate]);

  // --- Components ---

  const InputField = ({ label, value, onChange, type = "number", prefix = "" }: {
    label: string;
    value: number | string;
    onChange: (value: string) => void;
    type?: string;
    prefix?: string;
  }) => (
    <div className="flex flex-col space-y-1 w-full">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</label>
      <div className="relative group/input">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${prefix ? 'pl-7' : 'px-3'} pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none`}
        />
      </div>
    </div>
  );

  const DropdownMenu = ({ presets, onSelect, type, title }: {
    presets: typeof ASSET_PRESETS | typeof LIABILITY_PRESETS;
    onSelect: (preset: any) => void;
    type: 'asset' | 'liability';
    title: string;
  }) => (
    <div className="absolute right-0 top-12 w-full z-50 bg-white border border-slate-200 shadow-2xl rounded-xl p-2 animate-in fade-in zoom-in duration-150 origin-top-right">
      <p className="text-[10px] font-bold text-slate-400 uppercase p-2 border-b border-slate-50">{title}</p>
      <div className="max-h-72 overflow-y-auto scrollbar-hide py-1">
        {presets.map((preset: any) => (
          <button
            key={preset.label}
            onClick={() => onSelect(preset)}
            className={`w-full text-left text-xs p-2.5 rounded-lg transition-all flex justify-between items-center group ${type === 'asset' ? 'hover:bg-indigo-50 hover:text-indigo-700' : 'hover:bg-rose-50 hover:text-rose-700'}`}
          >
            <div>
              <span className="font-semibold">{preset.label}</span>
              {preset.note && <p className="text-[9px] text-slate-400 group-hover:text-indigo-400 italic font-medium">{preset.note}</p>}
            </div>
            {type === 'asset' ? (
              <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold ${(preset as typeof ASSET_PRESETS[0]).liquid ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-500'}`}>
                {(preset as typeof ASSET_PRESETS[0]).liquid ? 'LIQUID' : 'ILLIQUID'}
              </span>
            ) : (
              <span className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 font-mono">
                {(preset as typeof LIABILITY_PRESETS[0]).rate}% / {(preset as typeof LIABILITY_PRESETS[0]).term}Y
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Current Position</span>
          <div className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
            ${metrics.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="flex flex-col space-y-2 border-t border-slate-50 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Assets</span>
              <span className="font-bold text-slate-700">${metrics.totalAssets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-medium">Liabilities</span>
              <span className="font-bold text-rose-500">-${metrics.totalLiabilities.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={72} className="stroke-[1.5]" />
          </div>
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2 text-left">System Momentum</span>
          <div className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
            {metrics.momentumStatus}
          </div>
          <div className="pt-4 border-t border-slate-50">
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${
              metrics.momentumStatus === 'Improving' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
              metrics.momentumStatus === 'Stable' ? 'bg-blue-50 text-blue-700 border-blue-100' :
              'bg-amber-50 text-amber-700 border-amber-100'
            }`}>
              {metrics.momentumScore > 0 ? '+' : ''}{(metrics.momentumScore * 100).toFixed(1)}% Velocity
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest block mb-2">Optionality</span>
          <div className="text-3xl font-black text-slate-900 mb-6 tracking-tight">
            {metrics.optionality}
          </div>
          <div className="pt-4 border-t border-slate-50">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  metrics.optionality === 'High' ? 'bg-indigo-500 w-full' :
                  metrics.optionality === 'Moderate' ? 'bg-indigo-300 w-2/3' : 'bg-rose-400 w-1/3'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tight">Resilience Level</p>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <nav className="flex items-center bg-white p-1 rounded-xl shadow-sm border border-slate-200">
        {['Snapshot', 'Trajectory', 'Strategy'].map((t) => (
          <button
            key={t}
            onClick={() => setView(t.toLowerCase())}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex-1 ${
              view === t.toLowerCase()
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-900'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar: System Inputs */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white rounded-3xl border border-slate-200 shadow-sm relative">
            <div className="p-6 bg-slate-50/50 flex justify-between items-center border-b border-slate-100 rounded-t-3xl">
              <h2 className="font-bold text-slate-800 flex items-center gap-2 tracking-tight">
                <Layers size={18} className="text-indigo-500" />
                System Nodes
              </h2>
            </div>

            <div className="p-6 space-y-10">
              {/* Assets Section */}
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assets</h3>
                  <button
                    onClick={() => { setShowAssetMenu(!showAssetMenu); setShowLibMenu(false); }}
                    className={`bg-indigo-50 text-indigo-600 p-1.5 rounded-full hover:bg-indigo-600 hover:text-white transition-all transform ${showAssetMenu ? 'rotate-45' : ''}`}
                  >
                    <Plus size={20} className="stroke-[3]" />
                  </button>
                </div>

                {showAssetMenu && (
                  <DropdownMenu
                    title="Select Asset Template"
                    presets={ASSET_PRESETS}
                    type="asset"
                    onSelect={addAsset}
                  />
                )}

                <div className="space-y-4">
                  {assets.length === 0 && !showAssetMenu && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl group">
                      <p className="text-xs text-slate-400 font-medium mb-3">Blank slate: No assets tracked.</p>
                      <button
                        onClick={() => setShowAssetMenu(true)}
                        className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-indigo-600 transition-colors uppercase tracking-widest"
                      >
                        Quick Start
                      </button>
                    </div>
                  )}
                  {assets.map((asset) => (
                    <div key={asset.id} className="group relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 transition-all hover:border-indigo-300 hover:shadow-md">
                      <button
                        onClick={() => removeNode('asset', asset.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="flex flex-col">
                        <input
                          type="text"
                          value={asset.label}
                          onChange={(e) => updateNode('asset', asset.id, 'label', e.target.value)}
                          className="w-full bg-transparent font-bold text-slate-800 text-sm border-b border-transparent focus:border-indigo-300 outline-none pb-1 transition-colors"
                        />
                        {asset.note && <span className="text-[10px] text-slate-400 italic mt-0.5">{asset.note}</span>}
                      </div>
                      <div className="flex gap-4">
                        <InputField label="Value" prefix="$" value={asset.value} onChange={(val) => updateNode('asset', asset.id, 'value', val)} />
                        <div className="flex flex-col space-y-1 min-w-[85px]">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
                          <select
                            value={asset.liquid ? "liquid" : "illiquid"}
                            onChange={(e) => updateNode('asset', asset.id, 'liquid', e.target.value === "liquid")}
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          >
                            <option value="liquid">Liquid</option>
                            <option value="illiquid">Illiquid</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Liabilities</h3>
                  <button
                    onClick={() => { setShowLibMenu(!showLibMenu); setShowAssetMenu(false); }}
                    className={`bg-rose-50 text-rose-600 p-1.5 rounded-full hover:bg-rose-600 hover:text-white transition-all transform ${showLibMenu ? 'rotate-45' : ''}`}
                  >
                    <Plus size={20} className="stroke-[3]" />
                  </button>
                </div>

                {showLibMenu && (
                  <DropdownMenu
                    title="Select Liability Template"
                    presets={LIABILITY_PRESETS}
                    type="liability"
                    onSelect={addLiability}
                  />
                )}

                <div className="space-y-4">
                  {liabilities.length === 0 && !showLibMenu && (
                    <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-3xl">
                      <p className="text-xs text-slate-400 font-medium mb-3">No system drag detected.</p>
                      <button
                        onClick={() => setShowLibMenu(true)}
                        className="text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-full hover:bg-rose-600 transition-colors uppercase tracking-widest"
                      >
                        Add Debt
                      </button>
                    </div>
                  )}
                  {liabilities.map((lib) => (
                    <div key={lib.id} className="group relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3 transition-all hover:border-rose-300 hover:shadow-md">
                      <button
                        onClick={() => removeNode('liability', lib.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                      <input
                        type="text"
                        value={lib.label}
                        onChange={(e) => updateNode('liability', lib.id, 'label', e.target.value)}
                        className="w-full bg-transparent font-bold text-slate-800 text-sm border-b border-transparent focus:border-rose-300 outline-none pb-1"
                      />
                      <div className="space-y-4">
                        <InputField label="Balance" prefix="$" value={lib.value} onChange={(val) => updateNode('liability', lib.id, 'value', val)} />
                        <div className="flex gap-4">
                          <InputField label="Rate" prefix="%" value={lib.rate} onChange={(val) => updateNode('liability', lib.id, 'rate', val)} />
                          <InputField label="Term (Yrs)" prefix="T" value={lib.term} onChange={(val) => updateNode('liability', lib.id, 'term', val)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Forces Selector */}
          <section className="bg-slate-900 rounded-3xl p-8 text-slate-100 shadow-2xl shadow-indigo-900/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
            <h3 className="font-bold mb-6 flex items-center gap-2 tracking-tight">
              <Activity size={18} className="text-indigo-400" />
              Dynamic Forces
            </h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <span>Monthly Savings</span>
                  <span className="text-slate-100 text-xs font-mono tracking-tight">${monthlySavings.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="0" max="25000" step="100"
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <span>Asset Growth Velocity</span>
                  <span className="text-slate-100 text-xs font-mono tracking-tight">{growthRate}%</span>
                </div>
                <input
                  type="range" min="-10" max="25" step="0.5"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Dynamic Analysis */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm min-h-[500px] overflow-hidden">
            {view === 'snapshot' && (
              <div className="p-10">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-black tracking-tight">Fragility Analysis</h3>
                  <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm shadow-indigo-100" /> Liquid</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200" /> Illiquid</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-10 flex flex-col items-center md:items-start">
                    <div className="relative h-56 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f8fafc" strokeWidth="3.5"></circle>
                        <circle
                          cx="18" cy="18" r="15.915" fill="none"
                          stroke="#6366f1" strokeWidth="3.5"
                          strokeDasharray={`${metrics.liquidityRatio * 100} ${100 - (metrics.liquidityRatio * 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 delay-300 ease-in-out"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black tracking-tighter">{(metrics.liquidityRatio * 100).toFixed(0)}%</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Liquidity Index</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-50 p-8 rounded-3xl space-y-4 border border-slate-100 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/20"></div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Contextual Narrative</h4>
                      {metrics.totalAssets === 0 ? (
                        <p className="text-sm text-slate-400 italic">Generate system nodes to enable analysis.</p>
                      ) : (
                        <div className="space-y-4">
                          {metrics.liquidityRatio < 0.25 ? (
                            <div className="flex gap-4 text-sm text-slate-600 leading-relaxed font-medium">
                              <ShieldAlert className="text-amber-500 shrink-0 mt-0.5" size={20} />
                              <p>Your system is brittle. High asset value is offset by low accessibility. An income shock could force the liquidation of illiquid nodes at a loss.</p>
                            </div>
                          ) : (
                            <div className="flex gap-4 text-sm text-slate-600 leading-relaxed font-medium">
                              <Target className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                              <p>Your system shows high structural optionality. You can navigate volatility without destabilizing your growth engines.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-widest">
                      <Zap size={18} className="text-indigo-500 stroke-[3]" />
                      High-Leverage Points
                    </h4>
                    <div className="space-y-4">
                      {liabilities.length === 0 && assets.length === 0 && (
                        <p className="text-sm text-slate-400 italic border border-dashed border-slate-100 p-12 text-center rounded-3xl">
                          Inputs required to map leverage points.
                        </p>
                      )}

                      {metrics.highInterestDebts.length > 0 && (
                        <div className="p-6 rounded-2xl border border-rose-100 bg-rose-50/30 flex gap-5">
                          <div className="bg-rose-500 text-white p-3 rounded-xl h-fit shadow-lg shadow-rose-200">
                            <TrendingUp size={20} className="stroke-[3]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-rose-900">Mathematical Leak: {metrics.highInterestDebts[0].label}</p>
                            <p className="text-xs text-rose-700/80 leading-relaxed font-medium">
                              Tackling this {metrics.highInterestDebts[0].rate}% drag is your highest mathematical leverage point. Every dollar applied here stops a compounding loss.
                            </p>
                          </div>
                        </div>
                      )}

                      {metrics.shortTermDebts.length > 0 && (
                        <div className="p-6 rounded-2xl border border-indigo-100 bg-indigo-50/30 flex gap-5">
                          <div className="bg-indigo-600 text-white p-3 rounded-xl h-fit shadow-lg shadow-indigo-200">
                            <ArrowRightLeft size={20} className="stroke-[3]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-black text-indigo-900">Cash Flow Drain: {metrics.shortTermDebts[0].label}</p>
                            <p className="text-xs text-indigo-700/80 leading-relaxed font-medium">
                              With only {metrics.shortTermDebts[0].term} years remaining, eliminating this debt immediately reclaims monthly savings capacity.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-6 rounded-2xl border border-slate-100 bg-slate-50 flex gap-5 transition-all hover:bg-white hover:shadow-sm">
                        <div className="bg-slate-500 text-white p-3 rounded-xl h-fit">
                          <Layers size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Complexity Index: {metrics.complexity}</p>
                          <p className="text-xs text-slate-500 font-medium">Managing {assets.length + liabilities.length} accounts adds cognitive drag. System consolidation improves focus.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {view === 'trajectory' && (
              <div className="p-10">
                <div className="mb-12">
                  <h3 className="text-2xl font-black tracking-tight mb-2">Long-Term Trajectory</h3>
                  <p className="text-sm text-slate-500 font-medium">Visualizing the system state over a 10-year horizon.</p>
                </div>

                <div className="h-72 w-full relative mb-16 flex items-end justify-between border-b border-l border-slate-100 px-8">
                  {[0.15, 0.22, 0.30, 0.42, 0.55, 0.72, 0.90, 1.15, 1.45, 1.80].map((val, i) => (
                    <div key={i} className="flex flex-col items-center w-full group">
                      <div className="flex flex-col-reverse w-16 gap-2 items-center h-60">
                        <div className="w-3 bg-indigo-500 rounded-t transition-all group-hover:bg-indigo-700 group-hover:w-4" style={{ height: `${val * 90}%` }} />
                        <div className="w-3 bg-indigo-100 rounded-t" style={{ height: `${val * 40}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-5 font-black uppercase tracking-widest">Y{i+1}</span>
                    </div>
                  ))}
                  <div className="absolute top-0 right-4 p-5 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-50 shadow-xl shadow-slate-200/50 space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase">
                      <div className="w-4 h-1.5 bg-indigo-500 rounded-full" /> System Velocity
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase">
                      <div className="w-4 h-1.5 bg-indigo-100 rounded-full" /> Conservative
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Cautious Outlook</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">${(metrics.netWorth * 1.3 + (monthlySavings * 120 * 0.9)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 italic">Low velocity + steady savings</p>
                  </div>
                  <div className="p-8 border-4 border-indigo-500 bg-indigo-50/30 rounded-3xl shadow-2xl shadow-indigo-100/50 relative transform hover:-translate-y-1 transition-all">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase">Target Momentum</div>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3">Current Path ({growthRate}%)</p>
                    <p className="text-3xl font-black text-indigo-950 tracking-tighter">${(metrics.netWorth * Math.pow(1 + (growthRate/100), 10) + (monthlySavings * 120)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="p-8 border border-slate-100 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Optimistic Pivot</p>
                    <p className="text-2xl font-black text-slate-900 tracking-tighter">${(metrics.netWorth * 2.8 + (monthlySavings * 120 * 1.4)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 italic">High alpha + aggressive savings</p>
                  </div>
                </div>
              </div>
            )}

            {view === 'strategy' && (
              <div className="p-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h3 className="text-3xl font-black tracking-tight mb-4">Leverage Strategies</h3>
                  <p className="text-base text-slate-500 font-medium leading-relaxed">
                    Financial agency is about choosing where to focus your energy. These modules identify structural pivots for your specific system.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[
                    {
                      title: "The Velocity Reset",
                      detail: "Focus on the highest interest drag. This stops the compounding leakage and reclaims long-term velocity.",
                      impact: "Efficiency",
                      icon: <Zap size={20} className="stroke-[2.5]" />
                    },
                    {
                      title: "Rigidity Reduction",
                      detail: "Aggressively closing short-term liabilities to lower your monthly overhead and increase tactical resilience.",
                      impact: "Agility",
                      icon: <ArrowRightLeft size={20} className="stroke-[2.5]" />
                    },
                    {
                      title: "Resilience Buffering",
                      detail: "Allocating 25% of illiquid growth towards high-yield accessible reserves to lower fragility.",
                      impact: "Safety",
                      icon: <ShieldAlert size={20} className="stroke-[2.5]" />
                    },
                    {
                      title: "Node Consolidation",
                      detail: "Merging fragmented accounts to reduce the cognitive drag and administrative overhead of the system.",
                      impact: "Focus",
                      icon: <Maximize2 size={20} className="stroke-[2.5]" />
                    }
                  ].map((strat, i) => (
                    <div key={i} className="group p-8 rounded-3xl border border-slate-200 bg-white hover:border-indigo-500 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
                      <div className="flex justify-between items-start mb-6 relative">
                        <div className="p-4 bg-slate-900 text-white rounded-2xl group-hover:bg-indigo-600 transition-all shadow-lg group-hover:shadow-indigo-200">
                          {strat.icon}
                        </div>
                        <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                          {strat.impact}
                        </span>
                      </div>
                      <h4 className="font-black text-slate-800 text-xl mb-3 tracking-tight">{strat.title}</h4>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">{strat.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
