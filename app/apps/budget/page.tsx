'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  AlertCircle,
  Crown
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';

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

// Category Group Component (moved outside to prevent recreation on each render)
const CategoryGroup = ({
  title,
  cats,
  type,
  viewMode,
  allocations,
  handleAllocationChange,
  handleAllocationBlur
}: {
  title: string;
  cats: Array<{ id: string; label: string; initial: number }>;
  type: 'fixed' | 'flexible' | 'future';
  viewMode: 'monthly' | 'annual';
  allocations: Record<string, number | string>;
  handleAllocationChange: (id: string, value: string) => void;
  handleAllocationBlur: (id: string, isAnnualMode: boolean) => void;
}) => (
  <div className="mb-8">
    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
      {type === 'fixed' && <Lock size={14} />}
      {type === 'flexible' && <RefreshCcw size={14} />}
      {type === 'future' && <TrendingUp size={14} />}
      {title}
    </h3>
    <div className="space-y-4">
      {cats.map(cat => {
        const currentValue = allocations[cat.id];
        const isAnnual = viewMode === 'annual';

        // Calculate display value
        let displayValue: string;
        if (typeof currentValue === 'string') {
          // User is currently typing - show the raw value they're entering
          displayValue = currentValue;
        } else {
          // Stored number - convert monthly to annual if needed for display
          displayValue = isAnnual ? String(currentValue * 12) : String(currentValue);
        }

        return (
          <div key={cat.id} className="group">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-700">{cat.label}</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  {viewMode === 'annual' ? '/yr' : '/mo'}
                </span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={displayValue}
                    onChange={(e) => {
                      const inputValue = e.target.value.replace(/[^0-9.]/g, '');
                      // Store the value as the user types (don't convert yet)
                      handleAllocationChange(cat.id, inputValue);
                    }}
                    onBlur={() => handleAllocationBlur(cat.id, isAnnual)}
                    className="w-28 pl-5 pr-2 py-1.5 text-right bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const App = () => {
  const router = useRouter();
  const supabase = createBrowserClient();

  // --- State ---
  const [loading, setLoading] = useState(true);
  const [userTier, setUserTier] = useState<Tier>('free');
  const [grossIncome, setGrossIncome] = useState<number | string>(8000);
  const [taxMode, setTaxMode] = useState('baseline');
  const [allocations, setAllocations] = useState(() => {
    const initial: Record<string, number | string> = {};
    Object.values(CATEGORIES).flat().forEach(cat => {
      initial[cat.id] = cat.initial;
    });
    return initial;
  });
  const [viewMode, setViewMode] = useState<'monthly' | 'annual'>('monthly');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationLog, setOptimizationLog] = useState<string | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Check auth and tier
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      // Fetch user tier
      const { data: userData } = await supabase
        .from('users')
        .select('tier')
        .eq('id', session.user.id)
        .single() as { data: { tier: Tier } | null };

      if (userData?.tier) {
        setUserTier(userData.tier);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  // --- Calculations ---
  const taxRate = TAX_MODES[taxMode as keyof typeof TAX_MODES].rate;
  const grossIncomeNum = typeof grossIncome === 'string' ? parseFloat(grossIncome) || 0 : grossIncome;
  const taxDrag = grossIncomeNum * taxRate;
  const takeHomePay = grossIncomeNum - taxDrag;

  const totalAllocated = useMemo(() =>
    Object.values(allocations).reduce((sum: number, val) => {
      const numVal = typeof val === 'string' ? (parseFloat(val) || 0) : (val as number);
      return sum + numVal;
    }, 0)
  , [allocations]);

  const remaining = takeHomePay - totalAllocated;
  const multiplier = viewMode === 'annual' ? 12 : 1;

  // Analysis Metrics
  const fixedTotal = CATEGORIES.fixed.reduce((sum, cat) => {
    const val = allocations[cat.id];
    return sum + (typeof val === 'string' ? parseFloat(val) || 0 : val);
  }, 0);
  const flexibleTotal = CATEGORIES.flexible.reduce((sum, cat) => {
    const val = allocations[cat.id];
    return sum + (typeof val === 'string' ? parseFloat(val) || 0 : val);
  }, 0);
  const futureTotal = CATEGORIES.future.reduce((sum, cat) => {
    const val = allocations[cat.id];
    return sum + (typeof val === 'string' ? parseFloat(val) || 0 : val);
  }, 0);

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
    // Allow empty string or partial input during typing
    if (value === '') {
      setAllocations(prev => ({ ...prev, [id]: '' as any }));
      return;
    }

    // Store as-is to allow typing, validation happens on blur
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setAllocations(prev => ({ ...prev, [id]: value as any }));
    }
  };

  const handleAllocationBlur = (id: string, isAnnualMode: boolean) => {
    // Convert to number on blur, defaulting to 0 if invalid
    const currentValue = allocations[id];
    let numValue: number;
    if (typeof currentValue === 'string') {
      const parsed = parseFloat(currentValue) || 0;
      // If we're in annual mode, the user typed an annual value, so convert to monthly for storage
      numValue = isAnnualMode ? Math.max(0, parsed / 12) : Math.max(0, parsed);
    } else {
      numValue = Math.max(0, currentValue);
    }
    setAllocations(prev => ({ ...prev, [id]: numValue }));
  };

  const autoOptimize = (goal: string) => {
    // Check if user has pro access
    if (!hasProAccess('finance', userTier)) {
      setShowUpgradeModal(true);
      setShowOptimizer(false);
      return;
    }

    setIsOptimizing(true);

    // Simulate processing delay for better UX
    setTimeout(() => {
      const newAllocations = { ...allocations };
      let reasoning = '';

      // Get numeric values for calculations
      const getCurrentValue = (id: string) => {
        const val = allocations[id];
        return typeof val === 'string' ? parseFloat(val) || 0 : val;
      };

      if (goal === 'Maximize Monthly Slack') {
        // Strategy: Minimize flexible spending, maximize unallocated funds
        // Reduce dining, personal, and sinking funds
        newAllocations.dining = Math.max(150, getCurrentValue('dining') * 0.6);
        newAllocations.personal = Math.max(100, getCurrentValue('personal') * 0.6);
        newAllocations.sinking = Math.max(100, getCurrentValue('sinking') * 0.5);
        newAllocations.groceries = Math.max(400, getCurrentValue('groceries') * 0.85);

        reasoning = "Reduced discretionary spending (dining, personal) by 40% and sinking funds by 50% to maximize available monthly cash flow. This creates breathing room for unexpected expenses.";
      }
      else if (goal === 'Maximize Future Savings') {
        // Strategy: Aggressive future allocation
        const currentFlexible = getCurrentValue('groceries') + getCurrentValue('dining') +
                                getCurrentValue('transport') + getCurrentValue('personal');
        const savings = currentFlexible * 0.25; // Take 25% from flexible

        newAllocations.dining = Math.max(150, getCurrentValue('dining') * 0.7);
        newAllocations.personal = Math.max(80, getCurrentValue('personal') * 0.6);
        newAllocations.transport = Math.max(150, getCurrentValue('transport') * 0.85);

        // Allocate to investing and emergency
        newAllocations.investing = getCurrentValue('investing') + (savings * 0.6);
        newAllocations.emergency = getCurrentValue('emergency') + (savings * 0.4);

        reasoning = "Reduced flexible spending to redirect 25% toward future goals. 60% allocated to investing for wealth building, 40% to emergency buffer for resilience. This prioritizes long-term financial security.";
      }
      else if (goal === 'Minimize Fragility') {
        // Strategy: Balance across all categories, boost emergency fund
        const targetEmergency = takeHomePay * 0.15; // 15% to emergency
        const targetInvesting = takeHomePay * 0.12; // 12% to investing
        const targetSinking = takeHomePay * 0.08; // 8% to sinking

        // Calculate total fixed (don't change these)
        const totalFixed = fixedTotal;

        // Calculate remaining after fixed and desired future allocations
        const remainingForFlexible = takeHomePay - totalFixed - targetEmergency - targetInvesting - targetSinking;

        // Distribute flexible proportionally
        const flexibleRatio = remainingForFlexible / flexibleTotal;

        newAllocations.groceries = Math.max(400, getCurrentValue('groceries') * flexibleRatio);
        newAllocations.dining = Math.max(150, getCurrentValue('dining') * flexibleRatio);
        newAllocations.transport = Math.max(150, getCurrentValue('transport') * flexibleRatio);
        newAllocations.personal = Math.max(100, getCurrentValue('personal') * flexibleRatio);

        newAllocations.emergency = targetEmergency;
        newAllocations.investing = targetInvesting;
        newAllocations.sinking = targetSinking;

        reasoning = "Rebalanced to achieve systemic stability: 15% to emergency buffer, 12% to investing, 8% to sinking funds. Flexible spending proportionally adjusted to maintain livability while building resilience across all categories.";
      }

      // Round all values to 2 decimal places
      Object.keys(newAllocations).forEach(key => {
        const val = newAllocations[key];
        newAllocations[key] = typeof val === 'string' ? parseFloat(val) : Math.round(val * 100) / 100;
      });

      setAllocations(newAllocations);
      setOptimizationLog(reasoning);
      setIsOptimizing(false);
      setShowOptimizer(false);
    }, 1500);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading Budget System...</p>
        </div>
      </div>
    );
  }

  const hasProFeatures = hasProAccess('finance', userTier);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* TOP NAVIGATION */}
      <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors font-bold"
          >
            <ArrowRightLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-indigo-600" size={20} />
            <span className="font-black text-xl tracking-tight">Budget System</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-black uppercase tracking-widest">Verified Session</span>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

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
                    type="text"
                    inputMode="decimal"
                    value={grossIncome}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '');
                      setGrossIncome(value);
                    }}
                    onBlur={() => {
                      const numValue = typeof grossIncome === 'string'
                        ? Math.max(0, parseFloat(grossIncome) || 0)
                        : Math.max(0, grossIncome);
                      setGrossIncome(numValue);
                    }}
                    className="w-full pl-7 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
          <div className={`relative overflow-hidden p-6 rounded-2xl shadow-xl ${hasProFeatures ? 'bg-indigo-900 shadow-indigo-100' : 'bg-slate-200'} text-white`}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                {hasProFeatures ? (
                  <>
                    <Zap size={16} className="text-indigo-300" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300">Financial Pro</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="text-slate-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Pro Feature</span>
                  </>
                )}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${hasProFeatures ? 'text-white' : 'text-slate-700'}`}>
                Auto-Optimize (Cortex Mode)
              </h3>
              <p className={`text-xs mb-4 leading-relaxed ${hasProFeatures ? 'text-indigo-100 opacity-80' : 'text-slate-600'}`}>
                A constraint-aware engine that rebalances your system based on human priorities.
              </p>
              <button
                onClick={() => hasProFeatures ? setShowOptimizer(true) : setShowUpgradeModal(true)}
                className={`w-full py-2 transition-colors rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${
                  hasProFeatures
                    ? 'bg-indigo-500 hover:bg-indigo-400'
                    : 'bg-amber-500 hover:bg-amber-400 text-white'
                }`}
              >
                {hasProFeatures ? (
                  <>Launch Optimizer</>
                ) : (
                  <>
                    <Crown size={16} />
                    Upgrade to Access
                  </>
                )}
              </button>
            </div>
            <Zap className={`absolute -right-4 -bottom-4 opacity-20 ${hasProFeatures ? 'text-indigo-800' : 'text-slate-400'}`} size={120} />
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
                <CategoryGroup
                  title="Fixed Commitments"
                  cats={CATEGORIES.fixed}
                  type="fixed"
                  viewMode={viewMode}
                  allocations={allocations}
                  handleAllocationChange={handleAllocationChange}
                  handleAllocationBlur={handleAllocationBlur}
                />
                <CategoryGroup
                  title="Flexible Living"
                  cats={CATEGORIES.flexible}
                  type="flexible"
                  viewMode={viewMode}
                  allocations={allocations}
                  handleAllocationChange={handleAllocationChange}
                  handleAllocationBlur={handleAllocationBlur}
                />
              </div>
              <div>
                <CategoryGroup
                  title="Future Commitments"
                  cats={CATEGORIES.future}
                  type="future"
                  viewMode={viewMode}
                  allocations={allocations}
                  handleAllocationChange={handleAllocationChange}
                  handleAllocationBlur={handleAllocationBlur}
                />

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

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Crown size={32} />
              </div>
              <h2 className="text-2xl font-black mb-2">Unlock Auto-Optimize</h2>
              <p className="text-indigo-100 text-sm font-medium">
                Advanced budget optimization requires Finance Pro or Elite tier.
              </p>
            </div>

            <div className="p-8">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Zap size={16} />
                  What You Get with Pro:
                </h3>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>Smart Optimization:</strong> 3 constraint-aware strategies that respect your fixed costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>Instant Rebalancing:</strong> Maximize slack, future savings, or minimize fragility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>Explainable Logic:</strong> Clear reasoning for every recommendation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 mt-0.5">•</span>
                    <span><strong>All Pro Finance Tools:</strong> Access advanced features across all finance apps</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-indigo-200 rounded-2xl p-4 text-center">
                  <p className="text-xs text-slate-500 mb-1">Finance Pro</p>
                  <p className="text-3xl font-black text-indigo-600">$9</p>
                  <p className="text-xs text-slate-500">/month</p>
                </div>
                <div className="border-2 border-purple-200 rounded-2xl p-4 text-center bg-gradient-to-br from-purple-50 to-indigo-50">
                  <p className="text-xs text-purple-600 font-bold mb-1">Elite (Best Value)</p>
                  <p className="text-3xl font-black text-purple-600">$29</p>
                  <p className="text-xs text-slate-500">/month</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Crown size={18} />
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default App;
