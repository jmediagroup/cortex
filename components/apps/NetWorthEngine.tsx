"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  Plus,
  Info,
  HelpCircle,
  Lock,
  Gauge,
  AlertTriangle
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';
import ProGatedPreview from '@/components/monetization/ProGatedPreview';

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
  value: number | string;
  confidence: number;
  liquid: boolean;
  note?: string;
  submitted?: boolean;
}

interface Liability {
  id: string;
  category: string;
  label: string;
  value: number | string;
  rate: number | string;
  term: number | string;
  submitted?: boolean;
}

// --- Components ---

const Tooltip = ({ content, children }: { content: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, showBelow: false });
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();

      // Tooltip height estimate (with padding and content)
      const tooltipHeight = 120;
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;

      // Show below if there's not enough space above
      const showBelow = spaceAbove < tooltipHeight && spaceBelow > spaceAbove;

      setPosition({
        top: rect.top,
        left: rect.left + rect.width / 2,
        showBelow
      });
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="cursor-help inline-flex items-center"
      >
        {children}
      </div>
      {isVisible && (
        <div
          className="fixed px-3 py-2 bg-[var(--bg-card)] text-[var(--text-primary)] text-xs rounded-lg shadow-2xl w-64 pointer-events-none border-2 border-[var(--border-default)] leading-relaxed"
          style={{
            top: position.showBelow ? `${position.top + 24}px` : `${position.top - 8}px`,
            left: `${position.left}px`,
            transform: position.showBelow ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
            zIndex: 9999
          }}
        >
          {content}
          <div
            className="absolute border-4 border-transparent"
            style={{
              top: position.showBelow ? '-8px' : '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              borderTopColor: position.showBelow ? 'transparent' : 'white',
              borderBottomColor: position.showBelow ? 'white' : 'transparent',
              marginTop: position.showBelow ? '0' : '-4px'
            }}
          />
        </div>
      )}
    </div>
  );
};

const InputField = ({ label, value, onChange, type = "text", prefix = "", disabled = false }: {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  type?: string;
  prefix?: string;
  disabled?: boolean;
}) => (
  <div className="flex flex-col space-y-1 w-full">
    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</label>
    <div className="relative group/input">
      {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-mono">{prefix}</span>}
      <input
        type={type}
        inputMode="decimal"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full ${prefix ? 'pl-7' : 'px-3'} pr-3 py-1.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-lg text-sm focus:ring-2 focus:ring-[var(--emerald-500)] focus:border-[var(--emerald-border)] transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none disabled:opacity-50 disabled:cursor-not-allowed`}
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
  <div className="absolute right-0 top-12 w-full z-50 bg-[var(--bg-card)] border border-[var(--border-default)] shadow-2xl rounded-xl p-2 animate-in fade-in zoom-in duration-150 origin-top-right">
    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase p-2 border-b border-[var(--border-subtle)]">{title}</p>
    <div className="max-h-72 overflow-y-auto scrollbar-hide py-1">
      {presets.map((preset: any) => (
        <button
          key={preset.label}
          onClick={() => onSelect(preset)}
          className={`w-full text-left text-xs p-2.5 rounded-lg transition-all flex justify-between items-center group ${type === 'asset' ? 'hover:bg-[var(--emerald-50)] hover:text-[var(--emerald-500)]' : 'hover:bg-[var(--crimson-50)] hover:text-[var(--crimson-500)]'}`}
        >
          <div>
            <span className="font-semibold">{preset.label}</span>
            {preset.note && <p className="text-[9px] text-[var(--text-muted)] group-hover:text-[var(--emerald-400)] italic font-medium">{preset.note}</p>}
          </div>
          {type === 'asset' ? (
            <span className={`text-[8px] px-1.5 py-0.5 rounded border font-bold ${(preset as typeof ASSET_PRESETS[0]).liquid ? 'border-[var(--emerald-border-soft)] bg-[var(--emerald-50)] text-[var(--emerald-500)]' : 'border-[var(--border-subtle)] bg-[var(--bg-section)] text-[var(--text-tertiary)]'}`}>
              {(preset as typeof ASSET_PRESETS[0]).liquid ? 'LIQUID' : 'ILLIQUID'}
            </span>
          ) : (
            <span className="text-[9px] text-[var(--text-muted)] bg-[var(--bg-section)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)] font-mono">
              {(preset as typeof LIABILITY_PRESETS[0]).rate}% / {(preset as typeof LIABILITY_PRESETS[0]).term}Y
            </span>
          )}
        </button>
      ))}
    </div>
  </div>
);

interface NetWorthEngineProps {
  isPro?: boolean;
  onUpgrade?: () => void;
  isLoggedIn?: boolean;
  initialValues?: Record<string, unknown>;
}

export default function NetWorthEngine({ isPro, onUpgrade, isLoggedIn = false, initialValues }: NetWorthEngineProps = {}) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [monthlySavings, setMonthlySavings] = useState(0);
  const [growthRate, setGrowthRate] = useState(5);
  const [view, setView] = useState('snapshot');

  const [showAssetMenu, setShowAssetMenu] = useState(false);
  const [showLibMenu, setShowLibMenu] = useState(false);

  const initialApplied = useRef(false);
  useEffect(() => {
    if (!initialValues || initialApplied.current) return;
    initialApplied.current = true;
    const v = initialValues as Record<string, any>;
    if (v.assets != null) setAssets(v.assets);
    if (v.liabilities != null) setLiabilities(v.liabilities);
    if (v.monthlySavings != null) setMonthlySavings(v.monthlySavings);
    if (v.growthRate != null) setGrowthRate(v.growthRate);
  }, [initialValues]);

  // --- State Handlers ---

  const addAsset = (preset: typeof ASSET_PRESETS[0]) => {
    const newAsset: Asset = {
      id: crypto.randomUUID(),
      category: preset.category,
      label: preset.label,
      value: '',
      confidence: 1,
      liquid: preset.liquid,
      note: preset.note || '',
      submitted: false
    };
    setAssets(prev => [...prev, newAsset]);
    setShowAssetMenu(false);
  };

  const addLiability = (preset: typeof LIABILITY_PRESETS[0]) => {
    const newLiability: Liability = {
      id: crypto.randomUUID(),
      category: preset.category,
      label: preset.label,
      value: '',
      rate: preset.rate.toString(),
      term: preset.term.toString(),
      submitted: false
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

  const submitNode = (type: 'asset' | 'liability', id: string) => {
    if (type === 'asset') {
      setAssets(prev => prev.map(a => {
        if (a.id === id) {
          const numValue = parseFloat(String(a.value));
          return {
            ...a,
            value: isNaN(numValue) ? 0 : numValue,
            submitted: true
          };
        }
        return a;
      }));
    } else {
      setLiabilities(prev => prev.map(l => {
        if (l.id === id) {
          const numValue = parseFloat(String(l.value));
          const numRate = parseFloat(String(l.rate));
          const numTerm = parseFloat(String(l.term));
          return {
            ...l,
            value: isNaN(numValue) ? 0 : numValue,
            rate: isNaN(numRate) ? 0 : numRate,
            term: isNaN(numTerm) ? 0 : numTerm,
            submitted: true
          };
        }
        return l;
      }));
    }
  };

  // --- Calculations ---

  const metrics = useMemo(() => {
    const submittedAssets = assets.filter(a => a.submitted);
    const submittedLiabilities = liabilities.filter(l => l.submitted);

    const totalAssets = submittedAssets.reduce((sum, a) => sum + (Number(a.value) || 0), 0);
    const totalLiabilities = submittedLiabilities.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
    const netWorth = totalAssets - totalLiabilities;

    const liquidAssets = submittedAssets.filter(a => a.liquid).reduce((sum, a) => sum + (Number(a.value) || 0), 0);
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

    const highInterestDebts = submittedLiabilities.filter(l => Number(l.rate) >= 7 && Number(l.value) > 0)
      .sort((a, b) => Number(b.rate) - Number(a.rate));

    const shortTermDebts = submittedLiabilities.filter(l => Number(l.term) <= 3 && Number(l.value) > 0)
      .sort((a, b) => Number(a.term) - Number(b.term));

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
      complexity: (submittedAssets.length + submittedLiabilities.length) > 12 ? 'High' : (submittedAssets.length + submittedLiabilities.length) > 6 ? 'Moderate' : 'Low'
    };
  }, [assets, liabilities, monthlySavings, growthRate]);

  // PRO FEATURE: Momentum Intelligence
  const momentumIntelligence = useMemo(() => {
    if (!isPro) {
      // Sample data for blurred preview
      return {
        assetGrowthContribution: 18500,
        savingsContribution: 24000,
        totalMomentum: 42500,
        growthPercentage: 43.5,
        savingsPercentage: 56.5,
        acceleratedSavings: 2400,
        accelerationGain: 4800,
        debtPayments: 1850,
        annualDebtDrag: 22200,
        debtDragPercentage: 34.3,
        tippingPointNetWorth: 342857,
        yearsToTippingPoint: 6.2,
        liquidityGap: 0.08,
        liquidityRisk: 'Moderate',
        _isPreview: true
      };
    }

    const submittedAssets = assets.filter(a => a.submitted);
    const submittedLiabilities = liabilities.filter(l => l.submitted);

    // 1. Velocity Breakdown - What drives momentum?
    const assetGrowthContribution = metrics.totalAssets * (growthRate / 100);
    const savingsContribution = monthlySavings * 12;
    const totalMomentum = assetGrowthContribution + savingsContribution;
    const growthPercentage = totalMomentum > 0 ? (assetGrowthContribution / totalMomentum) * 100 : 0;
    const savingsPercentage = totalMomentum > 0 ? (savingsContribution / totalMomentum) * 100 : 0;

    // 2. Trajectory Acceleration - What happens if you increase savings 20%?
    const acceleratedSavings = monthlySavings * 1.2;
    const acceleratedMomentum = assetGrowthContribution + (acceleratedSavings * 12);
    const accelerationGain = acceleratedMomentum - totalMomentum;

    // 3. Debt Drag Analysis - How much is debt slowing you down?
    const debtPayments = submittedLiabilities.reduce((sum, l) => {
      // Rough monthly payment estimation
      const rate = Number(l.rate) / 100 / 12;
      const term = Number(l.term) * 12;
      const balance = Number(l.value);
      // 0%-rate loans amortize linearly; the annuity formula is 0/0 there.
      const payment = balance > 0 && term > 0
        ? (rate === 0 ? balance / term : (balance * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1))
        : 0;
      return sum + (isFinite(payment) ? payment : 0);
    }, 0);
    const annualDebtDrag = debtPayments * 12;
    const momentumWithoutDebt = totalMomentum + annualDebtDrag;
    const debtDragPercentage = momentumWithoutDebt > 0 ? (annualDebtDrag / momentumWithoutDebt) * 100 : 0;

    // 4. Tipping Point Analysis - When does growth exceed savings?
    // Only meaningful with positive growth and savings; otherwise there is no
    // crossover point to report.
    const hasTippingPoint = growthRate > 0 && monthlySavings > 0;
    const tippingPointNetWorth = hasTippingPoint
      ? (monthlySavings * 12) / (growthRate / 100)
      : Infinity;
    const yearsToTippingPoint = !hasTippingPoint
      ? Infinity
      : metrics.totalAssets > 0
        ? Math.max(0, (tippingPointNetWorth - metrics.totalAssets) / (monthlySavings * 12))
        : tippingPointNetWorth / (monthlySavings * 12);

    // 5. Liquid vs Illiquid Allocation Risk
    const idealLiquidRatio = 0.25; // 25% liquid is generally safe
    const liquidityGap = idealLiquidRatio - metrics.liquidityRatio;
    const liquidityRisk = Math.abs(liquidityGap) > 0.1 ? 'High' : Math.abs(liquidityGap) > 0.05 ? 'Moderate' : 'Low';

    return {
      assetGrowthContribution,
      savingsContribution,
      totalMomentum,
      growthPercentage,
      savingsPercentage,
      acceleratedSavings,
      accelerationGain,
      debtPayments,
      annualDebtDrag,
      debtDragPercentage,
      tippingPointNetWorth,
      yearsToTippingPoint,
      liquidityGap,
      liquidityRisk
    };
  }, [isPro, assets, liabilities, metrics, monthlySavings, growthRate]);

  // 10-year trajectory: assets compound at the chosen growth rate with annual
  // savings added; liabilities are held flat (conservative — no amortization
  // schedule is collected). Replaces the previous hardcoded chart data.
  const trajectory = useMemo(() => {
    const project = (rate: number, savingsMultiplier: number) => {
      const r = rate / 100;
      let assetsFV = metrics.totalAssets;
      const points: number[] = [];
      for (let y = 1; y <= 10; y++) {
        assetsFV = assetsFV * (1 + r) + monthlySavings * 12 * savingsMultiplier;
        points.push(assetsFV - metrics.totalLiabilities);
      }
      return points;
    };
    const current = project(growthRate, 1);
    const conservative = project(growthRate - 3, 0.9);
    const optimistic = project(growthRate + 3, 1.4);
    const maxValue = Math.max(1, ...current, ...conservative);
    return { current, conservative, optimistic, maxValue };
  }, [metrics.totalAssets, metrics.totalLiabilities, monthlySavings, growthRate]);

  return (
    <div className="space-y-8">
      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="net-worth"
          toolName="Net Worth Engine"
          getInputs={() => ({ assets, liabilities, monthlySavings, growthRate })}
          getKeyResult={() => {
            const totalAssets = assets.reduce((s: number, a: any) => s + (typeof a.value === 'number' ? a.value : parseFloat(a.value) || 0), 0);
            const totalLiabilities = liabilities.reduce((s: number, l: any) => s + (typeof l.value === 'number' ? l.value : parseFloat(l.value) || 0), 0);
            return `Net worth: $${Math.round(totalAssets - totalLiabilities).toLocaleString()}`;
          }}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)] shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase tracking-widest">Current Position</span>
            <Tooltip content="Your net worth is the total value of everything you own (assets) minus everything you owe (liabilities). It's a snapshot of your financial health right now.">
              <Info size={14} className="text-[var(--text-muted)] hover:text-[var(--emerald-500)] transition-colors" />
            </Tooltip>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
            ${metrics.netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="flex flex-col space-y-2 border-t border-[var(--border-subtle)] pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-medium">Assets</span>
              <span className="font-bold text-[var(--text-secondary)]">${metrics.totalAssets.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[var(--text-muted)] font-medium">Liabilities</span>
              <span className="font-bold text-[var(--crimson-500)]">-${metrics.totalLiabilities.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)] shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={72} className="stroke-[1.5]" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase tracking-widest text-left">System Momentum</span>
            <Tooltip content="Momentum shows if your wealth is growing, stable, or declining. It combines your asset growth rate (from investments) and monthly savings. 'Improving' means strong growth, 'Stable' means modest growth, 'Fragile' means slow growth, 'Reversing' means declining.">
              <Info size={14} className="text-[var(--text-muted)] hover:text-[var(--emerald-500)] transition-colors" />
            </Tooltip>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
            {metrics.momentumStatus}
          </div>
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
              metrics.momentumStatus === 'Improving' ? 'bg-[var(--emerald-50)] text-[var(--emerald-500)] border-[var(--emerald-border-soft)]' :
              metrics.momentumStatus === 'Stable' ? 'bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info-soft)]' :
              'bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--glass-border)]'
            }`}>
              {metrics.momentumScore > 0 ? '+' : ''}{(metrics.momentumScore * 100).toFixed(1)}% Velocity
            </div>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-default)] shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[var(--text-muted)] text-[10px] font-semibold uppercase tracking-widest">Optionality</span>
            <Tooltip content="Optionality measures your financial flexibility and ability to handle emergencies. It's based on how much liquid cash you have relative to your debts. High = strong safety net, Moderate = decent buffer, Low = vulnerable to shocks.">
              <Info size={14} className="text-[var(--text-muted)] hover:text-[var(--emerald-500)] transition-colors" />
            </Tooltip>
          </div>
          <div className="text-3xl font-bold text-[var(--text-primary)] mb-6 tracking-tight">
            {metrics.optionality}
          </div>
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div className="w-full bg-[var(--bg-glass)] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ease-out ${
                  metrics.optionality === 'High' ? 'bg-[var(--emerald-400)] w-full' :
                  metrics.optionality === 'Moderate' ? 'bg-[var(--emerald-400)] w-2/3' : 'bg-[var(--crimson-400)] w-1/3'
                }`}
              />
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 font-bold uppercase tracking-tight">Resilience Level</p>
          </div>
        </div>
      </div>

      {/* View Selector */}
      <nav className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl shadow-sm border border-[var(--border-default)]">
        {['Snapshot', 'Trajectory', 'Strategy'].map((t) => (
          <button
            key={t}
            onClick={() => setView(t.toLowerCase())}
            className={`px-5 py-2 text-sm font-bold rounded-lg transition-all flex-1 ${
              view === t.toLowerCase()
                ? 'bg-[var(--obsidian-900)] text-white shadow-lg'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
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
          <section className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] shadow-sm relative">
            <div className="p-6 bg-[var(--bg-section)]/50 flex justify-between items-center border-b border-[var(--border-subtle)] rounded-t-3xl">
              <h2 className="font-bold text-[var(--text-primary)] flex items-center gap-2 tracking-tight">
                <Layers size={18} className="text-[var(--emerald-400)]" />
                System Nodes
                <Tooltip content="Add your financial accounts here. Assets are things you own (cash, investments, property). Liabilities are debts you owe (loans, credit cards). Only submitted items are included in calculations.">
                  <HelpCircle size={16} className="text-[var(--text-muted)] hover:text-[var(--emerald-500)] transition-colors" />
                </Tooltip>
              </h2>
            </div>

            <div className="p-6 space-y-10">
              {/* Assets Section */}
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Assets</h3>
                  <button
                    onClick={() => { setShowAssetMenu(!showAssetMenu); setShowLibMenu(false); }}
                    className={`bg-[var(--emerald-50)] text-[var(--emerald-500)] p-1.5 rounded-full hover:bg-[var(--emerald-500)] hover:text-white transition-all transform ${showAssetMenu ? 'rotate-45' : ''}`}
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
                    <div className="text-center py-10 border-2 border-dashed border-[var(--border-subtle)] rounded-3xl group">
                      <p className="text-xs text-[var(--text-muted)] font-medium mb-3">Blank slate: No assets tracked.</p>
                      <button
                        onClick={() => setShowAssetMenu(true)}
                        className="text-[10px] font-bold bg-[var(--obsidian-900)] text-white px-3 py-1.5 rounded-full hover:bg-[var(--emerald-500)] transition-colors uppercase tracking-widest"
                      >
                        Quick Start
                      </button>
                    </div>
                  )}
                  {assets.map((asset) => (
                    <div key={asset.id} className={`group relative p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
                      asset.submitted
                        ? 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--emerald-border)] hover:shadow-md'
                        : 'bg-[var(--emerald-50)]/30 border-[var(--emerald-border)] border-2'
                    }`}>
                      <button
                        onClick={() => removeNode('asset', asset.id)}
                        className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--crimson-500)] opacity-0 group-hover:opacity-100 transition-all p-1 z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                      {!asset.submitted && (
                        <div className="absolute top-2 right-2 text-[9px] font-bold text-[var(--emerald-500)] bg-[var(--emerald-100)] px-2 py-0.5 rounded-full border border-[var(--emerald-border)] uppercase tracking-widest">
                          Draft
                        </div>
                      )}
                      <div className="flex flex-col">
                        <input
                          type="text"
                          value={asset.label}
                          onChange={(e) => updateNode('asset', asset.id, 'label', e.target.value)}
                          className="w-full bg-transparent font-bold text-[var(--text-primary)] text-sm border-b border-transparent focus:border-[var(--emerald-border)] outline-none pb-1 transition-colors"
                          disabled={asset.submitted}
                        />
                        {asset.note && <span className="text-[10px] text-[var(--text-muted)] italic mt-0.5">{asset.note}</span>}
                      </div>
                      <div className="flex gap-4">
                        <InputField
                          label="Value"
                          prefix="$"
                          value={asset.value}
                          onChange={(val) => updateNode('asset', asset.id, 'value', val)}
                          disabled={asset.submitted}
                        />
                        <div className="flex flex-col space-y-1 min-w-[85px]">
                          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Type</label>
                          <select
                            value={asset.liquid ? "liquid" : "illiquid"}
                            onChange={(e) => updateNode('asset', asset.id, 'liquid', e.target.value === "liquid")}
                            className="w-full px-2 py-1.5 bg-[var(--bg-section)] border border-[var(--border-default)] rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--emerald-500)] focus:border-[var(--emerald-border)]"
                            disabled={asset.submitted}
                          >
                            <option value="liquid">Liquid</option>
                            <option value="illiquid">Illiquid</option>
                          </select>
                        </div>
                      </div>
                      {!asset.submitted && (
                        <button
                          onClick={() => submitNode('asset', asset.id)}
                          className="w-full bg-[var(--emerald-500)] hover:bg-[var(--emerald-500)] text-white font-bold text-xs py-2 px-4 rounded-lg transition-all uppercase tracking-widest shadow-sm hover:shadow-md"
                        >
                          Add to Analysis
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Liabilities Section */}
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">Liabilities</h3>
                  <button
                    onClick={() => { setShowLibMenu(!showLibMenu); setShowAssetMenu(false); }}
                    className={`bg-[var(--crimson-50)] text-[var(--crimson-500)] p-1.5 rounded-full hover:bg-[var(--crimson-500)] hover:text-white transition-all transform ${showLibMenu ? 'rotate-45' : ''}`}
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
                    <div className="text-center py-10 border-2 border-dashed border-[var(--border-subtle)] rounded-3xl">
                      <p className="text-xs text-[var(--text-muted)] font-medium mb-3">No system drag detected.</p>
                      <button
                        onClick={() => setShowLibMenu(true)}
                        className="text-[10px] font-bold bg-[var(--obsidian-900)] text-white px-3 py-1.5 rounded-full hover:bg-[var(--crimson-500)] transition-colors uppercase tracking-widest"
                      >
                        Add Debt
                      </button>
                    </div>
                  )}
                  {liabilities.map((lib) => (
                    <div key={lib.id} className={`group relative p-4 rounded-2xl border shadow-sm space-y-3 transition-all ${
                      lib.submitted
                        ? 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--crimson-border)] hover:shadow-md'
                        : 'bg-[var(--crimson-50)]/30 border-[var(--crimson-border)] border-2'
                    }`}>
                      <button
                        onClick={() => removeNode('liability', lib.id)}
                        className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--crimson-500)] opacity-0 group-hover:opacity-100 transition-all p-1 z-10"
                      >
                        <Trash2 size={16} />
                      </button>
                      {!lib.submitted && (
                        <div className="absolute top-2 right-2 text-[9px] font-bold text-[var(--crimson-500)] bg-[var(--crimson-100)] px-2 py-0.5 rounded-full border border-[var(--crimson-border)] uppercase tracking-widest">
                          Draft
                        </div>
                      )}
                      <input
                        type="text"
                        value={lib.label}
                        onChange={(e) => updateNode('liability', lib.id, 'label', e.target.value)}
                        className="w-full bg-transparent font-bold text-[var(--text-primary)] text-sm border-b border-transparent focus:border-[var(--crimson-border)] outline-none pb-1"
                        disabled={lib.submitted}
                      />
                      <div className="space-y-4">
                        <InputField
                          label="Balance"
                          prefix="$"
                          value={lib.value}
                          onChange={(val) => updateNode('liability', lib.id, 'value', val)}
                          disabled={lib.submitted}
                        />
                        <div className="flex gap-4">
                          <InputField
                            label="Rate"
                            prefix="%"
                            value={lib.rate}
                            onChange={(val) => updateNode('liability', lib.id, 'rate', val)}
                            disabled={lib.submitted}
                          />
                          <InputField
                            label="Term (Yrs)"
                            prefix="T"
                            value={lib.term}
                            onChange={(val) => updateNode('liability', lib.id, 'term', val)}
                            disabled={lib.submitted}
                          />
                        </div>
                      </div>
                      {!lib.submitted && (
                        <button
                          onClick={() => submitNode('liability', lib.id)}
                          className="w-full bg-[var(--crimson-500)] hover:bg-[var(--crimson-500)] text-white font-bold text-xs py-2 px-4 rounded-lg transition-all uppercase tracking-widest shadow-sm hover:shadow-md"
                        >
                          Add to Analysis
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Forces Selector */}
          <section data-theme="dark" className="bg-[var(--obsidian-900)] rounded-3xl p-8 text-white shadow-2xl shadow-[0_0_24px_var(--cta-glow-soft)] overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--emerald-400)]/10 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity opacity-0 group-hover:opacity-100"></div>
            <h3 className="font-bold mb-6 flex items-center gap-2 tracking-tight text-white">
              <Activity size={18} className="text-[var(--emerald-400)]" />
              Dynamic Forces
              <Tooltip content="These inputs affect your momentum and trajectory calculations. Monthly Savings is how much you add to assets each month. Asset Growth Velocity is the expected annual growth rate of your investments (e.g., 7% for stock market average).">
                <HelpCircle size={16} className="text-white/60 hover:text-[var(--emerald-400)] transition-colors" />
              </Tooltip>
            </h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  <span>Monthly Savings</span>
                  <span className="text-white text-xs font-mono tracking-tight">${monthlySavings.toLocaleString()}</span>
                </div>
                <input
                  type="range" min="0" max="25000" step="100"
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(Number(e.target.value))}
                  className="w-full h-2 bg-white/15 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                  <span>Asset Growth Velocity</span>
                  <span className="text-white text-xs font-mono tracking-tight">{growthRate}%</span>
                </div>
                <input
                  type="range" min="-10" max="25" step="0.5"
                  value={growthRate}
                  onChange={(e) => setGrowthRate(Number(e.target.value))}
                  className="w-full h-2 bg-white/15 rounded-full appearance-none cursor-pointer accent-white"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Dynamic Analysis */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-default)] shadow-sm min-h-[500px] overflow-hidden">
            {view === 'snapshot' && (
              <div className="p-10">
                <div className="flex justify-between items-center mb-12">
                  <h3 className="text-2xl font-bold tracking-tight">Fragility Analysis</h3>
                  <div className="flex items-center gap-6 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--emerald-400)] shadow-sm shadow-[0_0_16px_var(--cta-glow-soft)]" /> Liquid</span>
                    <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[var(--bg-glass)] border border-[var(--border-default)]" /> Illiquid</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                  <div className="space-y-10 flex flex-col items-center md:items-start">
                    <div className="relative h-56 flex items-center justify-center">
                      <svg viewBox="0 0 36 36" className="w-48 h-48 transform -rotate-90">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1C1C1E" strokeWidth="3.5"></circle>
                        <circle
                          cx="18" cy="18" r="15.915" fill="none"
                          stroke="#00F0A0" strokeWidth="3.5"
                          strokeDasharray={`${metrics.liquidityRatio * 100} ${100 - (metrics.liquidityRatio * 100)}`}
                          strokeLinecap="round"
                          className="transition-all duration-1000 delay-300 ease-in-out"
                        ></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold tracking-tighter">{(metrics.liquidityRatio * 100).toFixed(0)}%</span>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Liquidity Index</span>
                          <Tooltip content="The percentage of your total assets that are liquid (easily accessible cash). Higher is better - it means you can access your wealth without selling long-term investments. Aim for at least 25%.">
                            <Info size={12} className="text-[var(--text-muted)] hover:text-[var(--emerald-500)] transition-colors" />
                          </Tooltip>
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-[var(--bg-section)] p-8 rounded-3xl space-y-4 border border-[var(--border-subtle)] relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[var(--emerald-400)]/20"></div>
                      <h4 className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Contextual Narrative</h4>
                      {metrics.totalAssets === 0 ? (
                        <p className="text-sm text-[var(--text-muted)] italic">Generate system nodes to enable analysis.</p>
                      ) : (
                        <div className="space-y-4">
                          {metrics.liquidityRatio < 0.25 ? (
                            <div className="flex gap-4 text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                              <ShieldAlert className="text-[var(--color-warning)] shrink-0 mt-0.5" size={20} />
                              <p>Your system is brittle. High asset value is offset by low accessibility. An income shock could force the liquidation of illiquid nodes at a loss.</p>
                            </div>
                          ) : (
                            <div className="flex gap-4 text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
                              <Target className="text-[var(--emerald-500)] shrink-0 mt-0.5" size={20} />
                              <p>Your system shows high structural optionality. You can navigate volatility without destabilizing your growth engines.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h4 className="text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-widest">
                      <Zap size={18} className="text-[var(--emerald-400)] stroke-[3]" />
                      High-Leverage Points
                    </h4>
                    <div className="space-y-4">
                      {liabilities.length === 0 && assets.length === 0 && (
                        <p className="text-sm text-[var(--text-muted)] italic border border-dashed border-[var(--border-subtle)] p-12 text-center rounded-3xl">
                          Inputs required to map leverage points.
                        </p>
                      )}

                      {metrics.highInterestDebts.length > 0 && (
                        <div className="p-6 rounded-2xl border border-[var(--crimson-border)] bg-[var(--crimson-50)]/30 flex gap-5">
                          <div className="bg-[var(--crimson-500)] text-white p-3 rounded-xl h-fit shadow-lg shadow-[0_0_24px_var(--crimson-100)]">
                            <TrendingUp size={20} className="stroke-[3]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-[var(--crimson-500)]">Mathematical Leak: {metrics.highInterestDebts[0].label}</p>
                            <p className="text-xs text-[var(--crimson-500)]/80 leading-relaxed font-medium">
                              Tackling this {metrics.highInterestDebts[0].rate}% drag is your highest mathematical leverage point. Every dollar applied here stops a compounding loss.
                            </p>
                          </div>
                        </div>
                      )}

                      {metrics.shortTermDebts.length > 0 && (
                        <div className="p-6 rounded-2xl border border-[var(--emerald-border-soft)] bg-[var(--emerald-50)]/30 flex gap-5">
                          <div className="bg-[var(--emerald-500)] text-white p-3 rounded-xl h-fit shadow-lg shadow-[0_0_24px_var(--cta-glow-soft)]">
                            <ArrowRightLeft size={20} className="stroke-[3]" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm font-bold text-[var(--text-primary)]">Cash Flow Drain: {metrics.shortTermDebts[0].label}</p>
                            <p className="text-xs text-[var(--emerald-500)]/80 leading-relaxed font-medium">
                              With only {metrics.shortTermDebts[0].term} years remaining, eliminating this debt immediately reclaims monthly savings capacity.
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-section)] flex gap-5 transition-all hover:bg-[var(--bg-card)] hover:shadow-sm">
                        <div className="bg-[var(--text-tertiary)] text-white p-3 rounded-xl h-fit">
                          <Layers size={20} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-tight">Complexity Index: {metrics.complexity}</p>
                          <p className="text-xs text-[var(--text-tertiary)] font-medium">Managing {assets.length + liabilities.length} accounts adds cognitive drag. System consolidation improves focus.</p>
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
                  <h3 className="text-2xl font-bold tracking-tight mb-2">Long-Term Trajectory</h3>
                  <p className="text-sm text-[var(--text-tertiary)] font-medium">Visualizing the system state over a 10-year horizon.</p>
                </div>

                <div className="h-72 w-full relative mb-16 flex items-end justify-between border-b border-l border-[var(--border-subtle)] px-8">
                  {trajectory.current.map((val, i) => (
                    <div key={i} className="flex flex-col items-center w-full group">
                      <div className="flex flex-col-reverse w-16 gap-2 items-center h-60" title={`Year ${i + 1}: $${Math.round(val).toLocaleString()}`}>
                        <div className="w-3 bg-[var(--emerald-400)] rounded-t transition-all group-hover:bg-[var(--emerald-500)] group-hover:w-4" style={{ height: `${Math.max(0, (val / trajectory.maxValue) * 90)}%` }} />
                        <div className="w-3 bg-[var(--emerald-100)] rounded-t" style={{ height: `${Math.max(0, (trajectory.conservative[i] / trajectory.maxValue) * 40)}%` }} />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)] mt-5 font-semibold uppercase tracking-widest">Y{i+1}</span>
                    </div>
                  ))}
                  <div className="absolute top-0 right-4 p-5 bg-[var(--bg-card)]/70 backdrop-blur-md rounded-2xl border border-[var(--border-subtle)] shadow-xl shadow-[var(--shadow-card-hover)] space-y-3">
                    <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase">
                      <div className="w-4 h-1.5 bg-[var(--emerald-400)] rounded-full" /> System Velocity
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-bold text-[var(--text-tertiary)] uppercase">
                      <div className="w-4 h-1.5 bg-[var(--emerald-100)] rounded-full" /> Conservative
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-8 border border-[var(--border-subtle)] rounded-3xl bg-[var(--bg-card)] shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">Cautious Outlook ({growthRate - 3}%)</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter">${Math.round(trajectory.conservative[9]).toLocaleString()}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold mt-2 italic">Low velocity + steady savings</p>
                  </div>
                  <div className="p-8 border-4 border-[var(--emerald-border)] bg-[var(--emerald-50)]/30 rounded-3xl shadow-2xl shadow-[0_0_16px_var(--cta-glow-soft)]/50 relative transform hover:-translate-y-1 transition-all">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--emerald-400)] text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest uppercase">Target Momentum</div>
                    <p className="text-[10px] font-bold text-[var(--emerald-400)] uppercase tracking-[0.2em] mb-3">Current Path ({growthRate}%)</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)] tracking-tighter">${Math.round(trajectory.current[9]).toLocaleString()}</p>
                  </div>
                  <div className="p-8 border border-[var(--border-subtle)] rounded-3xl bg-[var(--bg-card)] shadow-sm hover:shadow-md transition-all">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] mb-3">Optimistic Pivot ({growthRate + 3}%)</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tighter">${Math.round(trajectory.optimistic[9]).toLocaleString()}</p>
                    <p className="text-[10px] text-[var(--text-muted)] font-bold mt-2 italic">High alpha + aggressive savings</p>
                  </div>
                </div>
              </div>
            )}

            {view === 'strategy' && (
              <div className="p-10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h3 className="text-3xl font-bold tracking-tight mb-4">Leverage Strategies</h3>
                  <p className="text-base text-[var(--text-tertiary)] font-medium leading-relaxed">
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
                    <div key={i} className="group p-8 rounded-3xl border border-[var(--border-default)] bg-[var(--bg-card)] hover:border-[var(--emerald-border)] hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--emerald-50)]/50 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150"></div>
                      <div className="flex justify-between items-start mb-6 relative">
                        <div className="p-4 bg-[var(--obsidian-900)] text-white rounded-2xl group-hover:bg-[var(--emerald-500)] transition-all shadow-lg group-hover:shadow-[0_0_24px_var(--cta-glow-soft)]">
                          {strat.icon}
                        </div>
                        <span className="text-[9px] font-bold text-[var(--emerald-400)] uppercase tracking-widest bg-[var(--emerald-50)] px-3 py-1 rounded-full border border-[var(--emerald-border-soft)]">
                          {strat.impact}
                        </span>
                      </div>
                      <h4 className="font-bold text-[var(--text-primary)] text-xl mb-3 tracking-tight">{strat.title}</h4>
                      <p className="text-sm text-[var(--text-tertiary)] font-medium leading-relaxed mb-6">{strat.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PRO FEATURES SECTION */}
      {!isPro && (
        <div data-theme="dark" className="bg-gradient-to-br from-[var(--emerald-700)] to-[var(--emerald-500)] rounded-3xl p-8 shadow-2xl shadow-[0_0_32px_var(--cta-glow-ring)] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--bg-card)]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[var(--bg-card)]/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Gauge size={24} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Momentum Intelligence</h3>
                </div>
                <p className="text-white/90 text-base font-medium mb-6 leading-relaxed">
                  Understand the hidden drivers of your net worth trajectory. Decompose velocity into growth vs savings, quantify debt drag,
                  calculate acceleration opportunities, and discover your tipping point where compound growth overtakes active savings.
                </p>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-[var(--bg-card)]/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
                    Velocity Decomposition
                  </div>
                  <div className="bg-[var(--bg-card)]/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
                    Debt Drag Analysis
                  </div>
                  <div className="bg-[var(--bg-card)]/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
                    Tipping Point Calculator
                  </div>
                </div>
                <button
                  onClick={onUpgrade}
                  className="bg-white text-[var(--emerald-700)] px-8 py-4 rounded-2xl font-bold hover:bg-[var(--emerald-50)] transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {momentumIntelligence && (
        <ProGatedPreview isLocked={!isPro} toolId="net-worth">
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-[var(--emerald-50)] to-[var(--emerald-50)] border-2 border-[var(--emerald-border-soft)] rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--emerald-500)] rounded-xl flex items-center justify-center">
                <Gauge size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Velocity Decomposition</h3>
            </div>
            <p className="text-[var(--emerald-500)] font-medium mb-6 leading-relaxed">
              Your net worth momentum comes from two sources: asset growth (investments compounding) and active savings (cash you add).
              Understanding this split reveals whether you're in the "accumulation phase" or the "compound phase."
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--emerald-border-soft)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">Asset Growth</p>
                  <p className="text-sm font-bold text-[var(--emerald-500)]">{momentumIntelligence.growthPercentage.toFixed(0)}%</p>
                </div>
                <p className="text-3xl font-bold text-[var(--emerald-500)] mb-2">${Math.round(momentumIntelligence.assetGrowthContribution).toLocaleString()}</p>
                <div className="w-full bg-[var(--bg-glass)] h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--emerald-400)]" style={{ width: `${momentumIntelligence.growthPercentage}%` }}></div>
                </div>
              </div>
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--emerald-border-soft)]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">Active Savings</p>
                  <p className="text-sm font-bold text-[var(--emerald-500)]">{momentumIntelligence.savingsPercentage.toFixed(0)}%</p>
                </div>
                <p className="text-3xl font-bold text-[var(--emerald-500)] mb-2">${Math.round(momentumIntelligence.savingsContribution).toLocaleString()}</p>
                <div className="w-full bg-[var(--bg-glass)] h-2 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--emerald-500)]" style={{ width: `${momentumIntelligence.savingsPercentage}%` }}></div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--emerald-500)] rounded-2xl p-5 text-white">
              <div className="flex items-start gap-3">
                <Zap size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">CORTEX INSIGHT</p>
                  <p className="text-[var(--mist-100)] text-sm font-medium leading-relaxed">
                    {momentumIntelligence.growthPercentage > 50
                      ? `You've entered the compound phase: ${momentumIntelligence.growthPercentage.toFixed(0)}% of momentum comes from asset growth. Your money works harder than you do.`
                      : `You're in accumulation phase: ${momentumIntelligence.savingsPercentage.toFixed(0)}% of momentum comes from active savings. Focus on increasing income and savings rate.`}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[var(--emerald-50)] to-[var(--color-info-soft)] border-2 border-[var(--emerald-border-soft)] rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[var(--emerald-500)] rounded-xl flex items-center justify-center">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--emerald-500)]">Trajectory Acceleration</h3>
              </div>
              <p className="text-[var(--emerald-500)] font-medium mb-6 leading-relaxed">
                What if you increased your monthly savings by 20%? This shows the compounding impact of marginal improvements
                to your savings rate.
              </p>
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--emerald-border-soft)] mb-5">
                <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-2">Additional Annual Momentum</p>
                <p className="text-4xl font-bold text-[var(--emerald-500)] mb-3">+${Math.round(momentumIntelligence.accelerationGain).toLocaleString()}</p>
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  By increasing savings from ${monthlySavings.toLocaleString()}/mo to ${Math.round(momentumIntelligence.acceleratedSavings).toLocaleString()}/mo
                </p>
              </div>
              <div className="bg-[var(--emerald-500)] rounded-2xl p-5 text-white">
                <div className="flex items-start gap-3">
                  <Zap size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">CORTEX INSIGHT</p>
                    <p className="text-white/85 text-sm font-medium leading-relaxed">
                      Over 10 years, this acceleration compounds to approximately ${Math.round(momentumIntelligence.accelerationGain * 12.5).toLocaleString()} in extra wealth.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[var(--crimson-50)] to-[var(--color-warning-soft)] border-2 border-[var(--crimson-border)] rounded-3xl p-8 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[var(--crimson-500)] rounded-xl flex items-center justify-center">
                  <AlertTriangle size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-[var(--crimson-500)]">Debt Drag Analysis</h3>
              </div>
              <p className="text-[var(--crimson-500)] font-medium mb-6 leading-relaxed">
                Your debt payments create a "drag coefficient" on momentum. This quantifies how much faster you'd accelerate
                if those obligations disappeared.
              </p>
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--crimson-border)] mb-5">
                <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-2">Annual Debt Drag</p>
                <p className="text-4xl font-bold text-[var(--crimson-500)] mb-3">${Math.round(momentumIntelligence.annualDebtDrag).toLocaleString()}</p>
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  Represents {momentumIntelligence.debtDragPercentage.toFixed(1)}% of potential momentum
                </p>
              </div>
              <div className="bg-[var(--crimson-500)] rounded-2xl p-5 text-white">
                <div className="flex items-start gap-3">
                  <Zap size={18} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">CORTEX INSIGHT</p>
                    <p className="text-white/85 text-sm font-medium leading-relaxed">
                      {momentumIntelligence.debtDragPercentage > 30
                        ? `Debt is creating significant drag (${momentumIntelligence.debtDragPercentage.toFixed(0)}%). Aggressive paydown could unlock substantial acceleration.`
                        : `Debt drag is manageable (${momentumIntelligence.debtDragPercentage.toFixed(0)}%). Focus on increasing income and savings rate.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[var(--emerald-50)] to-[var(--emerald-50)] border-2 border-[var(--emerald-border-soft)] rounded-3xl p-8 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[var(--emerald-500)] rounded-xl flex items-center justify-center">
                <Target size={20} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Tipping Point Analysis</h3>
            </div>
            <p className="text-[var(--emerald-500)] font-medium mb-6 leading-relaxed">
              The "tipping point" is the net worth level where your asset growth equals your annual savings. Beyond this threshold,
              compound growth does the heavy lifting while you focus on other life priorities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--emerald-border-soft)]">
                <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-2">Tipping Point Net Worth</p>
                <p className="text-4xl font-bold text-[var(--emerald-500)] mb-2">
                  {isFinite(momentumIntelligence.tippingPointNetWorth)
                    ? `$${Math.round(momentumIntelligence.tippingPointNetWorth).toLocaleString()}`
                    : '—'}
                </p>
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  Where {growthRate}% growth = ${(monthlySavings * 12).toLocaleString()}/year savings
                </p>
              </div>
              <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--emerald-border-soft)]">
                <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-2">Years to Tipping Point</p>
                <p className="text-4xl font-bold text-[var(--emerald-500)] mb-2">
                  {momentumIntelligence.yearsToTippingPoint < 100
                    ? `${momentumIntelligence.yearsToTippingPoint.toFixed(1)} years`
                    : '—'}
                </p>
                <p className="text-sm text-[var(--text-secondary)] font-medium">
                  At current savings rate of ${monthlySavings.toLocaleString()}/mo
                </p>
              </div>
            </div>
            <div className="bg-[var(--emerald-500)] rounded-2xl p-5 text-white">
              <div className="flex items-start gap-3">
                <Zap size={18} className="flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">CORTEX INSIGHT</p>
                  <p className="text-[var(--mist-100)] text-sm font-medium leading-relaxed">
                    {!isFinite(momentumIntelligence.tippingPointNetWorth)
                      ? `Set a positive growth rate and monthly savings to see your tipping point — the net worth where asset growth outpaces what you save.`
                      : metrics.totalAssets >= momentumIntelligence.tippingPointNetWorth
                      ? `Congratulations: You've crossed the tipping point. Asset growth now exceeds your annual savings. Your wealth compounds faster than you can manually add to it.`
                      : `You need ${((momentumIntelligence.tippingPointNetWorth - metrics.totalAssets) / (monthlySavings * 12)).toFixed(1)} more years of disciplined saving to reach the tipping point. After that, compound growth takes over.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </ProGatedPreview>
      )}
      {!isPro && <ProUpsellCard toolId="net-worth" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
