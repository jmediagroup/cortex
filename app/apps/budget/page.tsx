'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  ShieldCheck,
  Zap,
  RefreshCcw,
  ArrowRightLeft,
  TrendingUp,
  Info,
  ChevronDown,
  ChevronUp,
  Lock,
  BrainCircuit,
  Settings2,
  AlertCircle
} from 'lucide-react';

// --- Constants & Defaults ---
const CATEGORIES = {
  fixed: [
    { id: 'housing', label: 'Housing', initial: 1500 },
    { id: 'insurance', label: 'Insurance', initial: 200 },
    { id: 'debt', label: 'Debt Payments', initial: 400 },
    { id: 'utilities', label: 'Utilities', initial: 300 },
  ],
  flexible: [
    { id: 'groceries', label: 'Groceries', initial: 600 },
    { id: 'dining', label: 'Dining', initial: 300 },
    { id: 'transport', label: 'Transportation', initial: 250 },
    { id: 'personal', label: 'Personal/Misc', initial: 200 },
  ],
  future: [
    { id: 'emergency', label: 'Emergency Buffer', initial: 500 },
    { id: 'investing', label: 'Investing', initial: 500 },
    { id: 'sinking', label: 'Sinking Funds', initial: 200 },
  ]
};

const TAX_MODES = {
  conservative: { label: 'Conservative', rate: 0.32 },
  baseline: { label: 'Baseline', rate: 0.26 },
  optimistic: { label: 'Optimistic', rate: 0.22 }
};

const App = () => {
  // --- State ---
  const [grossIncome, setGrossIncome] = useState(8000);
  const [taxMode, setTaxMode] = useState('baseline');
  const [allocations, setAllocations] = useState(() => {
    const initial: Record<string, number> = {};
    Object.values(CATEGORIES).flat().forEach(cat => {
      initial[cat.id] = cat.initial;
    });
    return initial;
  });
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationLog, setOptimizationLog] = useState<string | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);

  // --- Calculations ---
  const taxRate = TAX_MODES[taxMode as keyof typeof TAX_MODES].rate;
  const taxDrag = grossIncome * taxRate;
  const takeHomePay = grossIncome - taxDrag;

  const totalAllocated = useMemo(() =>
    Object.values(allocations).reduce((sum, val) => sum + val, 0)
  , [allocations]);

  const remaining = takeHomePay - totalAllocated;
  const multiplier = viewMode === 'annual' ? 12 : 1;

  // Analysis Metrics
  const fixedTotal = CATEGORIES.fixed.reduce((sum, cat) => sum + allocations[cat.id], 0);
  const flexibleTotal = CATEGORIES.flexible.reduce((sum, cat) => sum + allocations[cat.id], 0);
  const futureTotal = CATEGORIES.future.reduce((sum, cat) => sum + allocations[cat.id], 0);

  const flexibilityIndex = Math.max(0, Math.min(100, ((takeHomePay - fixedTotal) / takeHomePay) * 100));

  const tensionScore = useMemo(() => {
    let score = 0;
    if (fixedTotal / takeHomePay > 0.6) score += 40;
    if (remaining < 0) score += 60;
    if (remaining < takeHomePay * 0.05) score += 20;
    return Math.min(100, score);
  }, [fixedTotal, takeHomePay, remaining]);

  const getTensionLabel = (score: number) => {
    if (score < 30) return { label: 'Low Tension', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (score < 70) return { label: 'Moderate', color: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'High Fragility', color: 'text-slate-600', bg: 'bg-slate-100' };
  };

  // --- Handlers ---
  const handleAllocationChange = (id: string, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    setAllocations(prev => ({ ...prev, [id]: numValue }));
  };

  const autoOptimize = async (goal: string) => {
    setIsOptimizing(true);

    // Check for API key in environment variables
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

    if (!apiKey) {
      alert("Please configure NEXT_PUBLIC_GEMINI_API_KEY in your environment variables to use auto-optimization.");
      setIsOptimizing(false);
      setShowOptimizer(false);
      return;
    }

    const systemPrompt = `You are the Cortex Budgeting Engine AI.
    Analyze the user's budget and suggest a rebalance based on the goal: ${goal}.
    Return a JSON object with:
    1. "allocations": mapping of category IDs to new values.
    2. "reasoning": a short explanation of why changes were made.

    Rules:
    - Never touch 'fixed' costs (housing, insurance, debt, utilities).
    - Respect the total Take-Home Pay: ${takeHomePay}.
    - The sum of all new allocations + slack must equal Take-Home Pay.
    - Be logical and emotionally neutral.`;

    const userQuery = JSON.stringify({
      current_allocations: allocations,
      take_home: takeHomePay,
      categories: CATEGORIES
    });

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userQuery }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      const result = await response.json();
      const suggestion = JSON.parse(result.candidates[0].content.parts[0].text);

      setAllocations(prev => ({ ...prev, ...suggestion.allocations }));
      setOptimizationLog(suggestion.reasoning);
    } catch (error) {
      console.error("Optimization failed", error);
      alert("Optimization failed. Please check the console for details.");
    } finally {
      setIsOptimizing(false);
      setShowOptimizer(false);
    }
  };

  // --- Sub-Components ---
  const CategoryGroup = ({ title, cats, type }: {
    title: string;
    cats: Array<{ id: string; label: string; initial: number }>;
    type: 'fixed' | 'flexible' | 'future'
  }) => (
    <div className="mb-8">
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
        {type === 'fixed' && <Lock size={14} />}
        {type === 'flexible' && <RefreshCcw size={14} />}
        {type === 'future' && <TrendingUp size={14} />}
        {title}
      </h3>
      <div className="space-y-4">
        {cats.map(cat => (
          <div key={cat.id} className="group">
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-slate-700">{cat.label}</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {viewMode === 'annual' ? '/yr' : '/mo'}
                </span>
                <input
                  type="number"
                  value={allocations[cat.id] * multiplier}
                  onChange={(e) => handleAllocationChange(cat.id, String(Number(e.target.value) / multiplier))}
                  className="w-24 text-right bg-transparent border-b border-transparent group-hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-all text-sm font-mono"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={takeHomePay}
              step="10"
              value={allocations[cat.id]}
              onChange={(e) => handleAllocationChange(cat.id, e.target.value)}
              className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar / Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center">
                <BrainCircuit className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 uppercase">Cortex</h1>
            </div>
            <p className="text-sm text-slate-500 italic">Resource allocation under constraints.</p>
          </header>

          {/* Income Section */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Income Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Gross Monthly Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    type="number"
                    value={grossIncome}
                    onChange={(e) => setGrossIncome(Number(e.target.value))}
                    className="w-full pl-7 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Tax Reality Layer</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-lg">
                  {Object.entries(TAX_MODES).map(([key, mode]) => (
                    <button
                      key={key}
                      onClick={() => setTaxMode(key)}
                      className={`text-[10px] py-1.5 rounded transition-all ${
                        taxMode === key ? 'bg-white shadow-sm font-bold text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-500">Take-Home (Monthly)</span>
                  <span className="text-2xl font-mono font-bold text-slate-800">
                    ${Math.round(takeHomePay).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* System Health */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">System Analysis</h2>
            <div className="space-y-6">

              {/* Tension Meter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                    Budget Tension <Info size={12} className="text-slate-300" />
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getTensionLabel(tensionScore).bg} ${getTensionLabel(tensionScore).color}`}>
                    {getTensionLabel(tensionScore).label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${tensionScore > 70 ? 'bg-slate-500' : 'bg-indigo-500'}`}
                    style={{ width: `${tensionScore}%` }}
                  />
                </div>
              </div>

              {/* Flexibility Index */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-slate-600">Flexibility Index</span>
                  <span className="text-xs font-mono font-bold">{Math.round(flexibilityIndex)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${flexibilityIndex}%` }}
                  />
                </div>
              </div>

              {/* Tradeoff Lens */}
              <div className={`p-4 rounded-xl border ${remaining < 0 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-start gap-3">
                  <ArrowRightLeft size={16} className={remaining < 0 ? 'text-amber-500' : 'text-slate-400'} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 mb-1">Tradeoff Lens</h4>
                    {remaining < 0 ? (
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        System is over-constrained by <span className="font-bold">${Math.abs(remaining)}</span>.
                        Decrease flexible spending or sinking funds to restore slack.
                      </p>
                    ) : remaining > 0 ? (
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        You have <span className="font-bold">${Math.round(remaining)}</span> of unassigned slack.
                        Assign this to &quot;Future You&quot; to decrease long-term fragility.
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Balanced. Every dollar has a job.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pro Feature: Auto-Optimize */}
          <div className="relative overflow-hidden p-6 rounded-2xl bg-indigo-900 text-white shadow-xl shadow-indigo-100">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-indigo-300" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Financial Pro</span>
              </div>
              <h3 className="text-lg font-bold mb-2">Auto-Optimize (Cortex Mode)</h3>
              <p className="text-xs text-indigo-100 mb-4 leading-relaxed opacity-80">
                A constraint-aware engine that rebalances your system based on human priorities.
              </p>
              <button
                onClick={() => setShowOptimizer(true)}
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 transition-colors rounded-lg text-sm font-bold flex items-center justify-center gap-2"
              >
                Launch Optimizer
              </button>
            </div>
            <Zap className="absolute -right-4 -bottom-4 text-indigo-800 opacity-20" size={120} />
          </div>

          {optimizationLog && (
            <div className="p-4 bg-white rounded-xl border border-indigo-100 shadow-sm">
              <h4 className="text-xs font-bold text-indigo-600 mb-2 flex items-center gap-1">
                <BrainCircuit size={12} /> Optimization Applied
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed italic">&quot;{optimizationLog}&quot;</p>
              <button
                onClick={() => setOptimizationLog(null)}
                className="mt-2 text-[10px] text-slate-400 hover:text-indigo-600 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </aside>

        {/* Main Canvas */}
        <main className="lg:col-span-8">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Budget Architecture</h2>
                <p className="text-sm text-slate-400">Define the jobs for each dollar.</p>
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewMode('annual')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'annual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Annualized
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12">
              <div>
                <CategoryGroup title="Fixed Commitments" cats={CATEGORIES.fixed} type="fixed" />
                <CategoryGroup title="Flexible Living" cats={CATEGORIES.flexible} type="flexible" />
              </div>
              <div>
                <CategoryGroup title="Future Commitments" cats={CATEGORIES.future} type="future" />

                {/* Summary View */}
                <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Balance Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Decision Budget</span>
                      <span className="font-mono font-medium">${Math.round(takeHomePay * multiplier).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Allocated</span>
                      <span className="font-mono font-medium text-slate-800">${Math.round(totalAllocated * multiplier).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-slate-600">Unallocated Slack</span>
                      <span className={`font-mono font-bold text-lg ${remaining < 0 ? 'text-slate-400' : 'text-emerald-600'}`}>
                        ${Math.round(remaining * multiplier).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Optimization Modal */}
      {showOptimizer && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit size={28} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Configure Cortex Mode</h2>
              <p className="text-sm text-slate-500 mb-8">Select a priority goal. The engine will respect your fixed costs and suggest the most stable system.</p>

              <div className="space-y-3">
                {[
                  { id: 'slack', label: 'Maximize Monthly Slack', desc: 'Prioritizes breathing room and emergency funds.' },
                  { id: 'savings', label: 'Maximize Future Savings', desc: 'Aggressively allocates to investments.' },
                  { id: 'fragility', label: 'Minimize Fragility', desc: 'Balances all categories to reduce systemic risk.' }
                ].map(goal => (
                  <button
                    key={goal.id}
                    onClick={() => autoOptimize(goal.label)}
                    disabled={isOptimizing}
                    className="w-full p-4 rounded-2xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 text-left transition-all group disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-700 group-hover:text-indigo-600">{goal.label}</span>
                      <ArrowRightLeft size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-slate-500">{goal.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowOptimizer(false)}
                className="mt-8 w-full py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>

            {isOptimizing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative">
                  <RefreshCcw className="text-indigo-600 animate-spin" size={40} />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400" size={16} />
                </div>
                <p className="mt-4 text-sm font-bold text-slate-700">Rebalancing System...</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Cortex Engine v2.5</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
