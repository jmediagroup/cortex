'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Zap,
  RefreshCcw,
  ArrowRightLeft,
  TrendingUp,
  Info,
  Lock,
  BrainCircuit,
  Crown,
  Sparkles
} from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/client';
import { hasProAccess, type Tier } from '@/lib/access-control';
import { InlineAd } from '@/components/monetization';
import SaveScenarioButton from '@/components/apps/SaveScenarioButton';
import { trackToolVisit } from '@/lib/useRecentTools';
import { Breadcrumb, CalculatorSkeleton } from '@/components/ui';
import CalculatorSEOContent from '@/components/seo/CalculatorSEOContent';
import RelatedTools from '@/components/seo/RelatedTools';
import { CALCULATOR_CONTENT, getRelatedTools } from '@/lib/calculator-content';

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

// Display formatter — rounds to cents so unit conversions (annual entry / 12,
// optimizer output * 12) never leak long float tails into the input fields.
// Stored values keep full precision; only the rendered string is rounded.
const formatInputValue = (value: number) => String(Math.round(value * 100) / 100);

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
    <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4 flex items-center gap-2">
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
          displayValue = isAnnual ? formatInputValue(currentValue * 12) : formatInputValue(currentValue);
        }

        return (
          <div key={cat.id} className="group">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[var(--text-secondary)]">{cat.label}</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-muted)]">
                  {viewMode === 'annual' ? '/yr' : '/mo'}
                </span>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs">$</span>
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
                    className="w-28 pl-5 pr-2 py-1.5 text-right bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl text-sm font-mono focus:ring-2 focus:ring-[var(--emerald-200)] focus:border-[var(--emerald-border)] transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
  const [hasSession, setHasSession] = useState(false);
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

  // Check auth and tier (optional - no redirect)
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);

      if (session) {
        // Fetch user tier if logged in
        const { data: userData } = await supabase
          .from('users')
          .select('tier')
          .eq('id', session.user.id)
          .single() as { data: { tier: Tier } | null };

        if (userData?.tier) {
          setUserTier(userData.tier);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [router, supabase]);

  useEffect(() => { trackToolVisit('budget', 'Household Budgeting System', '/apps/budget'); }, []);

  // --- Calculations ---
  const taxRate = TAX_MODES[taxMode as keyof typeof TAX_MODES].rate;
  const grossIncomeNum = typeof grossIncome === 'string' ? parseFloat(grossIncome) || 0 : grossIncome;
  const taxDrag = grossIncomeNum * taxRate;
  const takeHomePay = grossIncomeNum - taxDrag;

  // Stored numbers are always monthly; in-flight strings (mid-typing) are in
  // the current view mode, so annual-mode input must be divided by 12 before
  // it joins the monthly totals.
  const toMonthly = useCallback((val: number | string) => {
    if (typeof val === 'string') {
      const parsed = parseFloat(val) || 0;
      return viewMode === 'annual' ? parsed / 12 : parsed;
    }
    return val;
  }, [viewMode]);

  const totalAllocated = useMemo(() =>
    Object.values(allocations).reduce((sum: number, val) => sum + toMonthly(val), 0)
  , [allocations, toMonthly]);

  const remaining = takeHomePay - totalAllocated;
  const multiplier = viewMode === 'annual' ? 12 : 1;

  // Analysis Metrics
  const fixedTotal = CATEGORIES.fixed.reduce((sum, cat) => sum + toMonthly(allocations[cat.id]), 0);
  const flexibleTotal = CATEGORIES.flexible.reduce((sum, cat) => sum + toMonthly(allocations[cat.id]), 0);
  const futureTotal = CATEGORIES.future.reduce((sum, cat) => sum + toMonthly(allocations[cat.id]), 0);

  const flexibilityIndex = takeHomePay > 0
    ? Math.max(0, Math.min(100, ((takeHomePay - fixedTotal) / takeHomePay) * 100))
    : 0;

  const tensionScore = useMemo(() => {
    let score = 0;
    if (fixedTotal / takeHomePay > 0.6) score += 40;
    if (remaining < 0) score += 60;
    if (remaining < takeHomePay * 0.05) score += 20;
    return Math.min(100, score);
  }, [fixedTotal, takeHomePay, remaining]);

  const getTensionLabel = (score: number) => {
    if (score < 30) return { label: 'Low Tension', color: 'text-[var(--emerald-500)]', bg: 'bg-[var(--emerald-50)]' };
    if (score < 70) return { label: 'Moderate', color: 'text-[var(--color-warning)]', bg: 'bg-[var(--color-warning-soft)]' };
    return { label: 'High Fragility', color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--bg-glass)]' };
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

      // Get numeric values for calculations (normalized to monthly)
      const getCurrentValue = (id: string) => toMonthly(allocations[id]);

      if (goal === 'Maximize Monthly Slack') {
        // Strategy: Minimize flexible spending, maximize unallocated funds.
        // Reduce dining, personal, and sinking funds — but never raise a
        // category above its current level: a floor should stop a cut,
        // not add spending.
        const reduceToFloor = (current: number, floor: number, factor: number) =>
          Math.min(current, Math.max(floor, current * factor));

        newAllocations.dining = reduceToFloor(getCurrentValue('dining'), 150, 0.6);
        newAllocations.personal = reduceToFloor(getCurrentValue('personal'), 100, 0.6);
        newAllocations.sinking = reduceToFloor(getCurrentValue('sinking'), 100, 0.5);
        newAllocations.groceries = reduceToFloor(getCurrentValue('groceries'), 400, 0.85);

        // Only claim reductions that actually happened — categories already
        // at or below their floors are left untouched
        const reducedLabels = [
          ['dining', 'dining'],
          ['personal', 'personal spending'],
          ['sinking', 'sinking funds'],
          ['groceries', 'groceries']
        ].filter(([id]) => (newAllocations[id] as number) < getCurrentValue(id))
          .map(([, label]) => label);

        reasoning = reducedLabels.length > 0
          ? `Reduced ${reducedLabels.join(', ')} to maximize available monthly cash flow. This creates breathing room for unexpected expenses.`
          : "All flexible categories are already at or below their recommended floors, so no reductions were available. Monthly cash flow is unchanged.";
      }
      else if (goal === 'Maximize Future Savings') {
        // Strategy: Aggressive future allocation — redirect exactly what the
        // cuts free up, so the optimization never allocates money that
        // doesn't exist.
        const newDining = Math.max(150, getCurrentValue('dining') * 0.7);
        const newPersonal = Math.max(80, getCurrentValue('personal') * 0.6);
        const newTransport = Math.max(150, getCurrentValue('transport') * 0.85);
        const freed = Math.max(0,
          (getCurrentValue('dining') - newDining) +
          (getCurrentValue('personal') - newPersonal) +
          (getCurrentValue('transport') - newTransport)
        );

        newAllocations.dining = newDining;
        newAllocations.personal = newPersonal;
        newAllocations.transport = newTransport;

        // Allocate to investing and emergency
        newAllocations.investing = getCurrentValue('investing') + (freed * 0.6);
        newAllocations.emergency = getCurrentValue('emergency') + (freed * 0.4);

        reasoning = "Reduced flexible spending and redirected the freed-up cash toward future goals. 60% allocated to investing for wealth building, 40% to emergency buffer for resilience. This prioritizes long-term financial security.";
      }
      else if (goal === 'Minimize Fragility') {
        // Strategy: Balance across all categories, boost emergency fund
        let targetEmergency = takeHomePay * 0.15; // 15% to emergency
        let targetInvesting = takeHomePay * 0.12; // 12% to investing
        let targetSinking = takeHomePay * 0.08; // 8% to sinking

        // Calculate total fixed (don't change these)
        const totalFixed = fixedTotal;

        // Calculate remaining after fixed and desired future allocations
        const remainingForFlexible = takeHomePay - totalFixed - targetEmergency - targetInvesting - targetSinking;

        // Distribute flexible proportionally (guard against an empty
        // flexible budget — 0/0 would write NaN into every category)
        const flexibleRatio = flexibleTotal > 0 ? Math.max(0, remainingForFlexible / flexibleTotal) : 0;

        let newGroceries = Math.max(400, getCurrentValue('groceries') * flexibleRatio);
        let newDining = Math.max(150, getCurrentValue('dining') * flexibleRatio);
        let newTransport = Math.max(150, getCurrentValue('transport') * flexibleRatio);
        let newPersonal = Math.max(100, getCurrentValue('personal') * flexibleRatio);

        const flexibleWithFloors = newGroceries + newDining + newTransport + newPersonal;
        const totalPlanned = totalFixed + flexibleWithFloors + targetEmergency + targetInvesting + targetSinking;

        if (totalPlanned <= takeHomePay) {
          reasoning = "Rebalanced to achieve systemic stability: 15% to emergency buffer, 12% to investing, 8% to sinking funds. Flexible spending proportionally adjusted to maintain livability while building resilience across all categories.";
        } else if (totalFixed >= takeHomePay) {
          // No amount of flexible reduction can rescue this system — say so
          // instead of claiming stability was achieved
          reasoning = "Budget is over-constrained by fixed costs: fixed commitments alone exceed take-home income, so no reduction in flexible spending can balance the system. Reduce fixed costs or increase income to restore stability.";
        } else {
          // The flexible floors pushed the plan past income — scale the
          // flexible categories below their floors to fit. If fixed costs
          // plus the future targets already exceed income on their own,
          // shrink the future targets to the remaining room as well.
          const flexibleScale = Math.max(0, remainingForFlexible) / flexibleWithFloors;
          newGroceries *= flexibleScale;
          newDining *= flexibleScale;
          newTransport *= flexibleScale;
          newPersonal *= flexibleScale;

          if (remainingForFlexible < 0) {
            const futureScale = (takeHomePay - totalFixed) / (targetEmergency + targetInvesting + targetSinking);
            targetEmergency *= futureScale;
            targetInvesting *= futureScale;
            targetSinking *= futureScale;
          }

          reasoning = "Income can't cover the recommended stability floors, so flexible spending was scaled below its usual floors (and future contributions trimmed where needed) to keep the budget within take-home pay. Reducing fixed costs would restore the full resilience targets.";
        }

        newAllocations.groceries = newGroceries;
        newAllocations.dining = newDining;
        newAllocations.transport = newTransport;
        newAllocations.personal = newPersonal;

        newAllocations.emergency = targetEmergency;
        newAllocations.investing = targetInvesting;
        newAllocations.sinking = targetSinking;
      }

      // Round all values to 2 decimal places (cleared fields may still hold
      // '' — parse with a 0 fallback so NaN never lands in state)
      Object.keys(newAllocations).forEach(key => {
        const val = newAllocations[key];
        const num = typeof val === 'string' ? (parseFloat(val) || 0) : val;
        newAllocations[key] = Math.round(num * 100) / 100;
      });

      setAllocations(newAllocations);
      setOptimizationLog(reasoning);
      setIsOptimizing(false);
      setShowOptimizer(false);
    }, 1500);
  };

  // The auth check only affects the signup banner and Pro gating, so the page
  // renders immediately — gating the whole page on it left crawlers (and
  // users) staring at a spinner, since effects never run during SSR.

  const hasProFeatures = hasProAccess('finance', userTier);

  return (
    <>
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <Breadcrumb toolName="Budget Planner" />
        {!loading && !hasSession && (
          <div className="bg-gradient-to-br from-[var(--emerald-500)] via-[var(--emerald-600)] to-[var(--emerald-600)] rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 grid-bg pointer-events-none" />
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={24} />
                  <h3 className="text-2xl font-bold">Unlock 7 More Financial Calculators</h3>
                </div>
                <p className="text-[var(--mist-100)] font-medium mb-4">
                  Create a free account to access our complete suite of financial tools: Net Worth Tracker, Debt Paydown Optimizer, S-Corp calculators, and more.
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => router.push('/signup')}
                    className="bg-[var(--bg-card)] text-[var(--emerald-500)] px-6 py-3 rounded-xl font-bold hover:bg-[var(--emerald-50)] transition-all shadow-md"
                  >
                    Create Free Account
                  </button>
                  <button
                    onClick={() => router.push('/pricing')}
                    className="text-white border-2 border-white px-6 py-3 rounded-xl font-bold hover:bg-[var(--bg-card)]/10 transition-all"
                  >
                    View All Tools
                  </button>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-[var(--mist-200)]" />
                      <span className="text-[var(--mist-50)] font-semibold">Net Worth Tracker</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-[var(--mist-200)]" />
                      <span className="text-[var(--mist-50)] font-semibold">Debt Paydown</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock size={14} className="text-[var(--mist-200)]" />
                      <span className="text-[var(--mist-50)] font-semibold">S-Corp Optimizer</span>
                    </div>
                    <div className="text-[var(--mist-200)] text-xs font-bold mt-3">+ 4 more tools</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Scenario */}
        {hasSession && (
          <div className="flex justify-end mb-4">
            <SaveScenarioButton
              toolId="budget"
              toolName="Budget System"
              getInputs={() => ({ grossIncome: typeof grossIncome === 'number' ? grossIncome : parseFloat(String(grossIncome)) || 0, taxMode, allocations, viewMode })}
              getKeyResult={() => `Take-home: $${Math.round(takeHomePay).toLocaleString()}/mo, Remaining: $${Math.round(remaining).toLocaleString()}`}
              isLoggedIn={hasSession}
            />
          </div>
        )}

        {/* Inline Ad - Full width above calculator */}
        <InlineAd context="budget" className="mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Sidebar / Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[var(--emerald-500)] rounded flex items-center justify-center">
                <BrainCircuit className="text-white" size={20} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--text-primary)] uppercase">Money Guy Mutants</h1>
            </div>
            <p className="text-sm text-[var(--text-tertiary)] italic">Resource allocation under constraints.</p>
          </header>

          {/* Income Section */}
          <section className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-subtle)]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">Income Entry</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-1">Gross Monthly Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
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
                    className="w-full pl-7 pr-4 py-2 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-xl focus:ring-2 focus:ring-[var(--emerald-500)] outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[var(--text-tertiary)] mb-1">Tax Reality Layer</label>
                <div className="grid grid-cols-3 gap-1 bg-[var(--bg-section)] p-1 rounded-lg">
                  {Object.entries(TAX_MODES).map(([key, mode]) => (
                    <button
                      key={key}
                      onClick={() => setTaxMode(key)}
                      className={`text-[10px] py-1.5 rounded transition-all ${
                        taxMode === key ? 'bg-[var(--bg-card)] shadow-sm font-bold text-[var(--emerald-500)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)]">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-[var(--text-tertiary)]">Take-Home (Monthly)</span>
                  <span className="text-2xl font-mono font-bold text-[var(--text-primary)]">
                    ${Math.round(takeHomePay).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* System Health */}
          <section className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-subtle)]">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)] mb-4">System Analysis</h2>
            <div className="space-y-6">

              {/* Tension Meter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
                    Budget Tension <Info size={12} className="text-[var(--text-muted)]" />
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getTensionLabel(tensionScore).bg} ${getTensionLabel(tensionScore).color}`}>
                    {getTensionLabel(tensionScore).label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-glass)] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${tensionScore > 70 ? 'bg-[var(--text-tertiary)]' : 'bg-[var(--emerald-400)]'}`}
                    style={{ width: `${tensionScore}%` }}
                  />
                </div>
              </div>

              {/* Flexibility Index */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-[var(--text-secondary)]">Flexibility Index</span>
                  <span className="text-xs font-mono font-bold">{Math.round(flexibilityIndex)}%</span>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-glass)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--emerald-500)] transition-all duration-700"
                    style={{ width: `${flexibilityIndex}%` }}
                  />
                </div>
              </div>

              {/* Tradeoff Lens */}
              <div className={`p-4 rounded-xl border ${remaining < 0 ? 'bg-[var(--color-warning-soft)] border-[var(--glass-border)]' : 'bg-[var(--bg-section)] border-[var(--border-subtle)]'}`}>
                <div className="flex items-start gap-3">
                  <ArrowRightLeft size={16} className={remaining < 0 ? 'text-[var(--color-warning)]' : 'text-[var(--text-muted)]'} />
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-secondary)] mb-1">Tradeoff Lens</h4>
                    {remaining < 0 ? (
                      <p className="text-[11px] text-[var(--color-warning)] leading-relaxed">
                        System is over-constrained by <span className="font-bold">${Math.round(Math.abs(remaining) * multiplier).toLocaleString()}{viewMode === 'annual' ? '/yr' : '/mo'}</span>.
                        Decrease flexible spending or sinking funds to restore slack.
                      </p>
                    ) : remaining > 0 ? (
                      <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                        You have <span className="font-bold">${Math.round(remaining * multiplier).toLocaleString()}{viewMode === 'annual' ? '/yr' : '/mo'}</span> of unassigned slack.
                        Assign this to &quot;Future You&quot; to decrease long-term fragility.
                      </p>
                    ) : (
                      <p className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                        Balanced. Every dollar has a job.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pro Feature: Auto-Optimize */}
          <div className={`relative overflow-hidden p-6 rounded-2xl shadow-xl ${hasProFeatures ? 'bg-[var(--obsidian-800)] shadow-[0_0_16px_var(--cta-glow-soft)]' : 'bg-[var(--bg-glass-strong)]'} text-white`}>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                {hasProFeatures ? (
                  <>
                    <Zap size={16} className="text-[var(--mist-200)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--mist-200)]">Financial Pro</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="text-[var(--text-tertiary)]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-tertiary)]">Pro Feature</span>
                  </>
                )}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${hasProFeatures ? 'text-white' : 'text-[var(--text-secondary)]'}`}>
                Auto-Optimize (Mutant Mode)
              </h3>
              <p className={`text-xs mb-4 leading-relaxed ${hasProFeatures ? 'text-[var(--mist-100)] opacity-80' : 'text-[var(--text-secondary)]'}`}>
                A constraint-aware engine that rebalances your system based on human priorities.
              </p>
              <button
                onClick={() => hasProFeatures ? setShowOptimizer(true) : setShowUpgradeModal(true)}
                className={`w-full py-2 transition-colors rounded-lg text-sm font-bold flex items-center justify-center gap-2 text-white ${
                  hasProFeatures
                    ? 'bg-[var(--orange)] hover:opacity-90'
                    : 'bg-[var(--color-warning)] hover:opacity-90'
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
            <Zap className={`absolute -right-4 -bottom-4 opacity-20 ${hasProFeatures ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`} size={120} />
          </div>

          {optimizationLog && (
            <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--emerald-border-soft)] shadow-sm">
              <h4 className="text-xs font-bold text-[var(--emerald-500)] mb-2 flex items-center gap-1">
                <BrainCircuit size={12} /> Optimization Applied
              </h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic">&quot;{optimizationLog}&quot;</p>
              <button
                onClick={() => setOptimizationLog(null)}
                className="mt-2 text-[10px] text-[var(--text-muted)] hover:text-[var(--emerald-500)] transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}
        </aside>

        {/* Main Canvas */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[var(--bg-card)] rounded-3xl shadow-sm border border-[var(--border-subtle)] p-8">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Budget Architecture</h2>
                <p className="text-sm text-[var(--text-muted)]">Define the jobs for each dollar.</p>
              </div>
              <div className="flex bg-[var(--bg-section)] p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('monthly')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'monthly' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--emerald-500)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setViewMode('annual')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'annual' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--emerald-500)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
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
                <div className="mt-12 p-6 bg-[var(--bg-section)] rounded-2xl border border-[var(--border-subtle)] space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Balance Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--text-tertiary)]">Decision Budget</span>
                      <span className="font-mono font-medium">${Math.round(takeHomePay * multiplier).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[var(--text-tertiary)]">Allocated</span>
                      <span className="font-mono font-medium text-[var(--text-primary)]">${Math.round(totalAllocated * multiplier).toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-[var(--border-default)] flex justify-between items-center">
                      <span className="text-xs font-bold uppercase text-[var(--text-secondary)]">Unallocated Slack</span>
                      <span className={`font-mono font-bold text-lg ${remaining < 0 ? 'text-[var(--color-warning)]' : 'text-[var(--emerald-500)]'}`}>
                        ${Math.round(remaining * multiplier).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>

      {/* Optimization Modal */}
      {showOptimizer && (
        <div className="fixed inset-0 bg-[var(--obsidian-900)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8">
              <div className="w-12 h-12 bg-[var(--emerald-100)] text-[var(--emerald-500)] rounded-2xl flex items-center justify-center mb-6">
                <BrainCircuit size={28} />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">Configure Mutant Mode</h2>
              <p className="text-sm text-[var(--text-tertiary)] mb-8">Select a priority goal. The engine will respect your fixed costs and suggest the most stable system.</p>

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
                    className="w-full p-4 rounded-2xl border border-[var(--border-subtle)] hover:border-[var(--emerald-border)] hover:bg-[var(--emerald-50)]/50 text-left transition-all group disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[var(--text-secondary)] group-hover:text-[var(--emerald-500)]">{goal.label}</span>
                      <ArrowRightLeft size={14} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)]">{goal.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowOptimizer(false)}
                className="mt-8 w-full py-3 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
              >
                Cancel
              </button>
            </div>

            {isOptimizing && (
              <div className="absolute inset-0 bg-[var(--bg-card)]/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <div className="relative">
                  <RefreshCcw className="text-[var(--emerald-500)] animate-spin" size={40} />
                  <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--emerald-400)]" size={16} />
                </div>
                <p className="mt-4 text-sm font-bold text-[var(--text-secondary)]">Rebalancing System...</p>
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest mt-1">Mutant Engine v2.5</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-[var(--obsidian-900)]/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-br from-[var(--emerald-500)] to-[var(--emerald-500)] p-8 text-white">
              <div className="w-16 h-16 bg-[var(--bg-card)]/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                <Crown size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Unlock Auto-Optimize</h2>
              <p className="text-[var(--mist-100)] text-sm font-medium">
                Advanced budget optimization requires Finance Pro or Elite tier.
              </p>
            </div>

            <div className="p-8">
              <div className="bg-[var(--emerald-50)] border border-[var(--emerald-border-soft)] rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-bold text-[var(--text-primary)] mb-3 flex items-center gap-2">
                  <Zap size={16} />
                  What You Get with Pro:
                </h3>
                <ul className="space-y-2 text-sm text-[var(--text-primary)]">
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--emerald-400)] mt-0.5">•</span>
                    <span><strong>Smart Optimization:</strong> 3 constraint-aware strategies that respect your fixed costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--emerald-400)] mt-0.5">•</span>
                    <span><strong>Instant Rebalancing:</strong> Maximize slack, future savings, or minimize fragility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--emerald-400)] mt-0.5">•</span>
                    <span><strong>Explainable Logic:</strong> Clear reasoning for every recommendation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[var(--emerald-400)] mt-0.5">•</span>
                    <span><strong>All Pro Finance Tools:</strong> Access advanced features across all finance apps</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="border-2 border-[var(--emerald-border)] rounded-2xl p-4 text-center">
                  <p className="text-xs text-[var(--text-tertiary)] mb-1">Finance Pro</p>
                  <p className="text-3xl font-bold text-[var(--emerald-500)]">$9</p>
                  <p className="text-xs text-[var(--text-tertiary)]">/month</p>
                </div>
                <div className="border-2 border-[var(--emerald-border)] rounded-2xl p-4 text-center bg-gradient-to-br from-[var(--emerald-50)] to-[var(--emerald-50)]">
                  <p className="text-xs text-[var(--emerald-500)] font-bold mb-1">Elite (Best Value)</p>
                  <p className="text-3xl font-bold text-[var(--emerald-500)]">$29</p>
                  <p className="text-xs text-[var(--text-tertiary)]">/month</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-[var(--border-default)] text-[var(--text-secondary)] font-bold hover:bg-[var(--bg-section)] transition-colors"
                >
                  Maybe Later
                </button>
                <button
                  onClick={() => router.push('/pricing')}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[var(--emerald-500)] to-[var(--emerald-500)] text-white font-bold hover:from-[var(--emerald-600)] hover:to-[var(--emerald-600)] transition-all shadow-lg flex items-center justify-center gap-2"
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

      {/* SEO & AEO Content */}
      <div className="max-w-7xl mx-auto px-6">
        <CalculatorSEOContent content={CALCULATOR_CONTENT['budget']} />
        <RelatedTools tools={getRelatedTools('budget')} />
      </div>

      <footer className="max-w-7xl mx-auto px-6 py-10 text-center border-t border-[var(--border-subtle)] mt-8">
        <p className="text-xs text-[var(--text-muted)] font-medium">&copy; {new Date().getFullYear()} Cortex Technologies. Tools for Long-Term Thinking.</p>
        <div className="flex items-center justify-center gap-3 mt-2">
          <a href="/articles" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs">Articles</a>
          <span className="text-[var(--text-muted)]">|</span>
          <a href="/pricing" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs">Pricing</a>
          <span className="text-[var(--text-muted)]">|</span>
          <a href="/terms" className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors text-xs">Terms & Privacy</a>
        </div>
      </footer>
    </>
  );
};

export default App;
