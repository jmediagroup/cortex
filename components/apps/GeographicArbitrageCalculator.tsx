'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer
} from 'recharts';
import {
  MapPin,
  TrendingUp,
  Home,
  Coffee,
  ArrowRightLeft,
  ChevronRight,
  Info,
  DollarSign,
  Briefcase,
  Wallet,
  Lock,
  Zap,
  TrendingDown,
  Plane
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import Tooltip from '@/components/ui/Tooltip';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';
import ProGatedPreview from '@/components/monetization/ProGatedPreview';
import { bracketTax, C } from '@/lib/tax/taxEngine2026';

interface LocationData {
  taxRate: number;
  colIndex: number;
  housingBase: number;
  note: string;
}

interface GeographicArbitrageCalculatorProps {
  isPro?: boolean;
  onUpgrade?: () => void;
  isLoggedIn?: boolean;
  initialValues?: Record<string, unknown>;
}

// Comprehensive Data for all 50 State Capitals + Major Hubs + DC + Custom Cities
const LOCATION_PRESETS: Record<string, LocationData> = {
  "Montgomery, AL": { taxRate: 0.05, colIndex: 0.85, housingBase: 1250, note: "Alabama Capital. High affordability in the Deep South." },
  "Juneau, AK": { taxRate: 0.0, colIndex: 1.3, housingBase: 2100, note: "Alaska Capital. 0% income tax but high cost of goods/services." },
  "Phoenix, AZ": { taxRate: 0.025, colIndex: 1.05, housingBase: 1950, note: "Arizona Capital. Low flat tax. Major destination for West Coast exits." },
  "Little Rock, AR": { taxRate: 0.039, colIndex: 0.85, housingBase: 1300, note: "Arkansas Capital. Low cost of living and declining tax rates." },
  "Sacramento, CA": { taxRate: 0.093, colIndex: 1.3, housingBase: 2200, note: "California Capital. High state tax but ~30% cheaper than SF/LA." },
  "San Francisco, CA": { taxRate: 0.093, colIndex: 1.8, housingBase: 3500, note: "Benchmark Hub. Peak geographic arbitrage origin point." },
  "Los Angeles, CA": { taxRate: 0.093, colIndex: 1.6, housingBase: 2900, note: "Benchmark Hub. High CA tax. Significant utility/gas burden." },
  "Denver, CO": { taxRate: 0.044, colIndex: 1.1, housingBase: 2200, note: "Colorado Capital. Flat tax rate. Popular destination with rising costs." },
  "Hartford, CT": { taxRate: 0.055, colIndex: 1.15, housingBase: 1800, note: "Connecticut Capital. Moderate costs but high local property taxes." },
  "Dover, DE": { taxRate: 0.05, colIndex: 1.0, housingBase: 1600, note: "Delaware Capital. Moderate tax and no sales tax." },
  "Washington, D.C.": { taxRate: 0.085, colIndex: 1.7, housingBase: 2800, note: "U.S. Capital. High income tax brackets and extreme housing costs. Major outflow hub." },
  "Tallahassee, FL": { taxRate: 0.0, colIndex: 1.0, housingBase: 1750, note: "Florida Capital. 0% state income tax. Lower costs than Miami." },
  "Miami, FL": { taxRate: 0.0, colIndex: 1.2, housingBase: 2400, note: "Major Metro Hub. 0% state income tax. Significant housing demand and international appeal." },
  "Atlanta, GA": { taxRate: 0.0519, colIndex: 1.0, housingBase: 1900, note: "Georgia Capital. Major Inflow Hub. Corporate center with moderate housing." },
  "Honolulu, HI": { taxRate: 0.0825, colIndex: 1.8, housingBase: 3100, note: "Hawaii Capital. Extremely high COL and housing burden." },
  "Boise, ID": { taxRate: 0.058, colIndex: 1.05, housingBase: 2000, note: "Idaho Capital. High recent Inflow from West Coast. Rising housing." },
  "Springfield, IL": { taxRate: 0.0495, colIndex: 0.85, housingBase: 1300, note: "Illinois Capital. Flat tax and high housing affordability." },
  "Indianapolis, IN": { taxRate: 0.03, colIndex: 0.9, housingBase: 1500, note: "Indiana Capital. Low flat state tax and stable housing costs." },
  "Des Moines, IA": { taxRate: 0.038, colIndex: 0.85, housingBase: 1300, note: "Iowa Capital. Flat 3.8% tax. Strong insurance/finance hub. High affordability." },
  "Topeka, KS": { taxRate: 0.057, colIndex: 0.82, housingBase: 1250, note: "Kansas Capital. Highly affordable housing with moderate state tax." },
  "Frankfort, KY": { taxRate: 0.035, colIndex: 0.85, housingBase: 1200, note: "Kentucky Capital. Very affordable living and flat tax rate." },
  "Baton Rouge, LA": { taxRate: 0.03, colIndex: 0.9, housingBase: 1350, note: "Louisiana Capital. Low housing costs and low flat state tax." },
  "Augusta, ME": { taxRate: 0.0715, colIndex: 0.95, housingBase: 1400, note: "Maine Capital. Higher state tax but low housing costs." },
  "Annapolis, MD": { taxRate: 0.0475, colIndex: 1.25, housingBase: 2400, note: "Maryland Capital. High local COL due to DC proximity." },
  "Boston, MA": { taxRate: 0.05, colIndex: 1.65, housingBase: 3200, note: "Massachusetts Capital. High Outflow due to housing burden." },
  "Lansing, MI": { taxRate: 0.0425, colIndex: 0.88, housingBase: 1350, note: "Michigan Capital. Low housing costs and flat tax rate." },
  "St. Paul, MN": { taxRate: 0.07, colIndex: 1.05, housingBase: 1700, note: "Minnesota Capital. Higher tax but high social service index." },
  "Jackson, MS": { taxRate: 0.044, colIndex: 0.8, housingBase: 1150, note: "Mississippi Capital. Lowest housing baseline in the dataset." },
  "Jefferson City, MO": { taxRate: 0.0495, colIndex: 0.82, housingBase: 1200, note: "Missouri Capital. High affordability and moderate state tax." },
  "Helena, MT": { taxRate: 0.059, colIndex: 1.0, housingBase: 1700, note: "Montana Capital. Increasing Inflow. No sales tax." },
  "Lincoln, NE": { taxRate: 0.058, colIndex: 0.92, housingBase: 1450, note: "Nebraska Capital. High stability and low discretionary costs." },
  "Carson City, NV": { taxRate: 0.0, colIndex: 1.05, housingBase: 1850, note: "Nevada Capital. 0% state income tax. High West Coast migration." },
  "Concord, NH": { taxRate: 0.0, colIndex: 1.1, housingBase: 1900, note: "New Hampshire Capital. 0% tax on earned income." },
  "Trenton, NJ": { taxRate: 0.0637, colIndex: 1.2, housingBase: 1900, note: "New Jersey Capital. High property taxes and progressive income tax." },
  "Santa Fe, NM": { taxRate: 0.059, colIndex: 1.1, housingBase: 2000, note: "New Mexico Capital. High cultural value with moderate tax burden." },
  "Albany, NY": { taxRate: 0.065, colIndex: 1.05, housingBase: 1600, note: "NY State Capital. Progressive tax system. Moderate COL." },
  "New York, NY": { taxRate: 0.10, colIndex: 1.9, housingBase: 3800, note: "Benchmark Hub. Highest tax drag (City + State). Max Outflow risk." },
  "Raleigh, NC": { taxRate: 0.0399, colIndex: 0.95, housingBase: 1750, note: "North Carolina Capital. Flat tax and Research Triangle growth." },
  "Wilmington, NC": { taxRate: 0.0399, colIndex: 0.95, housingBase: 1650, note: "Coastal Destination. Favorable flat tax (3.99%) and high appeal for remote workers/retirees." },
  "Bismarck, ND": { taxRate: 0.025, colIndex: 0.9, housingBase: 1300, note: "North Dakota Capital. Very low state tax and stable economy." },
  "Columbus, OH": { taxRate: 0.035, colIndex: 0.95, housingBase: 1650, note: "Ohio Capital. Rapidly growing tech/corporate hub." },
  "Oklahoma City, OK": { taxRate: 0.0475, colIndex: 0.88, housingBase: 1400, note: "Oklahoma Capital. Rapidly growing with low cost of operations." },
  "Salem, OR": { taxRate: 0.0875, colIndex: 1.1, housingBase: 1850, note: "Oregon Capital. High income tax but no sales tax." },
  "Harrisburg, PA": { taxRate: 0.0307, colIndex: 0.95, housingBase: 1400, note: "Pennsylvania Capital. Low flat tax rate and moderate COL." },
  "Providence, RI": { taxRate: 0.0475, colIndex: 1.15, housingBase: 1900, note: "Rhode Island Capital. Moderate costs with proximity to Boston." },
  "Columbia, SC": { taxRate: 0.062, colIndex: 0.9, housingBase: 1450, note: "South Carolina Capital. Low COL offset by tax brackets." },
  "Pierre, SD": { taxRate: 0.0, colIndex: 0.9, housingBase: 1400, note: "South Dakota Capital. 0% state income tax. Favorable for savings." },
  "Nashville, TN": { taxRate: 0.0, colIndex: 0.95, housingBase: 1800, note: "Tennessee Capital. 0% state income tax. Massive cultural Inflow Hub." },
  "Austin, TX": { taxRate: 0.0, colIndex: 1.1, housingBase: 2100, note: "Texas Capital. 0% state income tax. Major tech Inflow Hub." },
  "Salt Lake City, UT": { taxRate: 0.045, colIndex: 1.1, housingBase: 2100, note: "Utah Capital. Flat tax and high Inflow (Silicon Slopes)." },
  "Montpelier, VT": { taxRate: 0.068, colIndex: 1.1, housingBase: 1750, note: "Vermont Capital. High tax burden but high social safety net." },
  "Richmond, VA": { taxRate: 0.0575, colIndex: 1.0, housingBase: 1850, note: "Virginia Capital. Moderate progressive tax and historical stability." },
  "Alexandria, VA": { taxRate: 0.0575, colIndex: 1.5, housingBase: 2600, note: "D.C. Outflow Hub. High COL and housing demand with proximity to the federal core." },
  "Arlington, VA": { taxRate: 0.0575, colIndex: 1.6, housingBase: 2800, note: "Tech/Defense Hub. High housing pressure and urban amenities next to D.C." },
  "Olympia, WA": { taxRate: 0.0, colIndex: 1.15, housingBase: 2000, note: "Washington Capital. 0% state income tax. Moderate housing pressure." },
  "Seattle, WA": { taxRate: 0.0, colIndex: 1.5, housingBase: 2700, note: "Washington Benchmark. 0% tax, high cost of living index." },
  "Charleston, WV": { taxRate: 0.051, colIndex: 0.8, housingBase: 1100, note: "West Virginia Capital. Extremely low housing costs. High arbitrage." },
  "Madison, WI": { taxRate: 0.053, colIndex: 1.05, housingBase: 1850, note: "Wisconsin Capital. High quality of life with moderate state tax." },
  "Cheyenne, WY": { taxRate: 0.0, colIndex: 0.95, housingBase: 1550, note: "Wyoming Capital. 0% state income tax. Low regulation." },
  "Remote / LCOL": { taxRate: 0.03, colIndex: 0.8, housingBase: 1200, note: "The 'Ideal Arbitrage' scenario. Assumes rural or mid-west living while keeping city salary." },
};

interface SliderFieldProps {
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  tooltip?: string;
}

// Defined at module scope: defining these inside the calculator created a
// new component type on every render, remounting the inputs and dropping
// keyboard focus after each keystroke.
const SliderField = ({ label, icon: Icon, value, onChange, min = 0, max = 100, suffix = "", tooltip }: SliderFieldProps) => {
  // Determine step size based on the range
  const getStep = () => {
    const range = max - min;
    if (range > 100000) return 5000;
    if (range > 10000) return 1000;
    if (range > 1000) return 100;
    if (range > 100) return 10;
    return 1;
  };

  const step = getStep();

  const handleIncrement = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value.replace(/,/g, '')) || min;
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="mb-6 group">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2">
          {Icon && <Icon size={16} className="text-[var(--emerald-400)]" />}
          {label}
          {tooltip && <Tooltip content={tooltip} />}
        </label>
      </div>
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          className="flex-shrink-0 w-10 h-10 rounded-lg border-2 border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-section)] hover:border-[var(--emerald-border)] active:bg-[var(--bg-glass)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center font-bold text-[var(--text-secondary)] hover:text-[var(--emerald-500)]"
        >
          −
        </button>
        <div className="flex-1 relative">
          <input
            type="text"
            value={value.toLocaleString()}
            onChange={handleInputChange}
            className="w-full px-4 py-2.5 text-center font-bold text-lg rounded-lg border-2 border-[var(--border-default)] bg-[var(--bg-section)] hover:bg-[var(--bg-card)] hover:border-[var(--emerald-border)] focus:outline-none focus:ring-2 focus:ring-[var(--emerald-500)] focus:border-[var(--emerald-border)] transition-all tabular-nums"
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--text-muted)] pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          className="flex-shrink-0 w-10 h-10 rounded-lg border-2 border-[var(--border-default)] bg-[var(--bg-card)] hover:bg-[var(--bg-section)] hover:border-[var(--emerald-border)] active:bg-[var(--bg-glass)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center font-bold text-[var(--text-secondary)] hover:text-[var(--emerald-500)]"
        >
          +
        </button>
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-[var(--text-muted)] font-medium">
        <span>Min: {min.toLocaleString()}</span>
        <span>Max: {max.toLocaleString()}</span>
      </div>
    </div>
  );
};

interface LocationSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const LocationSelector = ({ label, value, onChange }: LocationSelectorProps) => (
  <div className="mb-6 relative group">
    <div className="flex justify-between items-center mb-2">
      <label className="text-sm font-semibold text-[var(--text-secondary)] block">{label}</label>
      <div className="relative">
        <Info size={14} className="text-[var(--text-muted)] hover:text-[var(--emerald-500)] cursor-help transition-colors" />
        <div className="absolute right-0 bottom-full mb-2 w-72 bg-[var(--obsidian-900)] text-white text-[11px] p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none leading-relaxed border border-[var(--border-strong)]">
          <p className="font-bold text-[var(--emerald-400)] border-b border-[var(--border-strong)] pb-2 mb-2 uppercase tracking-wider">{value} Regional Profile</p>
          {LOCATION_PRESETS[value].note}
        </div>
      </div>
    </div>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3.5 rounded-xl border-2 border-[var(--border-subtle)] bg-[var(--bg-section)] hover:bg-[var(--bg-card)] hover:border-[var(--emerald-border-soft)] focus:ring-4 focus:ring-[var(--emerald-500)] focus:border-[var(--emerald-border)] outline-none appearance-none cursor-pointer transition-all font-medium text-[var(--text-primary)]"
      >
        {sortedLocationKeys.map(loc => <option key={loc} value={loc}>{loc}</option>)}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
        <ChevronRight size={18} className="rotate-90" />
      </div>
    </div>
  </div>
);

// 2026 Social Security wage base for employee-side FICA
const SS_WAGE_BASE_2026 = 184500;

// Currency formatter that keeps the sign readable for deficits (e.g. -$1,200)
const fmtUSD = (value: number) => `${value < 0 ? '-' : ''}$${Math.abs(Math.round(value)).toLocaleString()}`;

// Sort keys by State (suffix) then City (prefix)
const sortedLocationKeys = Object.keys(LOCATION_PRESETS).sort((a, b) => {
  if (a === "Remote / LCOL") return 1;
  if (b === "Remote / LCOL") return -1;
  const partsA = a.split(', ');
  const partsB = b.split(', ');
  const stateA = partsA[1] || "";
  const stateB = partsB[1] || "";
  if (stateA !== stateB) return stateA.localeCompare(stateB);
  return partsA[0].localeCompare(partsB[0]);
});

export default function GeographicArbitrageCalculator({ isPro, onUpgrade, isLoggedIn = false, initialValues }: GeographicArbitrageCalculatorProps) {
  const [currentLoc, setCurrentLoc] = useState("San Francisco, CA");
  const [targetLoc, setTargetLoc] = useState("Austin, TX");
  const [annualIncome, setAnnualIncome] = useState<number | string>(150000);
  const [incomeAdjustment, setIncomeAdjustment] = useState(100);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [years, setYears] = useState(20);
  const [isDragging, setIsDragging] = useState(false);

  const [lifestyle, setLifestyle] = useState({
    housing: 50,
    dining: 40
  });

  const initialApplied = useRef(false);
  useEffect(() => {
    if (!initialValues || initialApplied.current) return;
    initialApplied.current = true;
    const v = initialValues as Record<string, any>;
    if (v.currentLoc != null) setCurrentLoc(v.currentLoc);
    if (v.targetLoc != null) setTargetLoc(v.targetLoc);
    if (v.annualIncome != null) setAnnualIncome(v.annualIncome);
    if (v.incomeAdjustment != null) setIncomeAdjustment(v.incomeAdjustment);
    if (v.investmentReturn != null) setInvestmentReturn(v.investmentReturn);
    if (v.years != null) setYears(v.years);
    if (v.lifestyle != null) setLifestyle(v.lifestyle);
  }, [initialValues]);

  const calculateMetrics = (locKey: string, income: number | string) => {
    const incomeNum = typeof income === 'string' ? parseFloat(income) || 0 : income;
    const loc = LOCATION_PRESETS[locKey];
    // 2026 federal income tax: single filer, standard deduction, via the shared engine
    const federalTax = bracketTax(Math.max(0, incomeNum - C.stdDed.single), C.ordinary.single);
    // Employee-side FICA: 6.2% Social Security up to the wage base,
    // 1.45% Medicare, plus 0.9% Additional Medicare over $200k
    const ficaTax = 0.062 * Math.min(incomeNum, SS_WAGE_BASE_2026)
      + 0.0145 * incomeNum
      + 0.009 * Math.max(0, incomeNum - 200000);
    // State tax is a single-rate model: top-marginal rate x gross income.
    // This overstates the bill in progressive states (CA, NY, etc.).
    const stateTax = incomeNum * loc.taxRate;
    const totalTax = federalTax + ficaTax + stateTax;
    const takeHome = incomeNum - totalTax;
    const housingCost = loc.housingBase * (lifestyle.housing / 50) * 12;
    const dailyCosts = (1500 * loc.colIndex) * (1 + lifestyle.dining / 50) * 12;
    const totalExpenses = housingCost + dailyCosts;
    // Deliberately unclamped: a negative surplus (deficit) must survive so
    // that comparisons between two deficit cities still show the true delta.
    const netSavings = takeHome - totalExpenses;
    return { takeHome, totalTax, stateTax, housingCost, dailyCosts, totalExpenses, netSavings };
  };

  const currentMetrics = useMemo(() => calculateMetrics(currentLoc, annualIncome), [currentLoc, annualIncome, lifestyle]);
  const targetMetrics = useMemo(() => {
    const incomeNum = typeof annualIncome === 'string' ? parseFloat(annualIncome) || 0 : annualIncome;
    return calculateMetrics(targetLoc, incomeNum * (incomeAdjustment / 100));
  }, [targetLoc, annualIncome, incomeAdjustment, lifestyle]);

  const savingsDelta = targetMetrics.netSavings - currentMetrics.netSavings;

  // PRO FEATURE: Multi-City Wealth Accelerator
  const multiCityAnalysis = useMemo(() => {
    if (!isPro) {
      // Sample data for blurred preview
      return {
        destinations: [
          { location: 'austin', delta: 18500, netSavings: 42000 },
          { location: 'denver', delta: 15200, netSavings: 38700 },
          { location: 'raleigh', delta: 22000, netSavings: 45500 },
          { location: 'nashville', delta: 16800, netSavings: 40300 },
          { location: 'phoenix', delta: 20100, netSavings: 43600 },
        ],
        yearlyTaxWindfall: 8500,
        mobilityPremium: 125000,
        lifestyleScore: 72,
        compoundedArbitrageWealth: 485000,
        _isPreview: true
      };
    }

    const incomeNum = typeof annualIncome === 'string' ? parseFloat(annualIncome) || 0 : annualIncome;

    // 1. Top 5 Arbitrage Destinations
    const destinations = Object.keys(LOCATION_PRESETS)
      .filter(loc => loc !== currentLoc)
      .map(loc => {
        const metrics = calculateMetrics(loc, incomeNum * (incomeAdjustment / 100));
        const delta = metrics.netSavings - currentMetrics.netSavings;
        return { location: loc, delta, netSavings: metrics.netSavings };
      })
      .sort((a, b) => b.delta - a.delta)
      .slice(0, 5);

    // 2. Tax Migration Windfall (current vs target state tax, same
    // top-marginal-rate model; negative means the target state taxes more)
    const currentLoc_data = LOCATION_PRESETS[currentLoc];
    const targetLoc_data = LOCATION_PRESETS[targetLoc];
    const yearlyTaxWindfall = incomeNum * (currentLoc_data.taxRate - targetLoc_data.taxRate);

    // 3. Career Mobility Premium
    // Assumption: staying in expensive locations may boost salary trajectory by 5-10% over 10 years
    const mobilityPenalty = incomeNum * 0.07 * years; // 7% of salary lost per year
    const mobilityPremium = savingsDelta * years - mobilityPenalty;

    // 4. Lifestyle Compression Score (0-100)
    // Compares post-tax, post-housing spending power in the target city
    // against today. 75 = unchanged spending power, below 50 = significant
    // compression, above 75 = the move expands your lifestyle budget.
    const currentDiscretionary = Math.max(1, currentMetrics.takeHome - currentMetrics.housingCost);
    const targetDiscretionary = targetMetrics.takeHome - targetMetrics.housingCost;
    const lifestyleScore = Math.max(0, Math.min(100, Math.round(75 * (targetDiscretionary / currentDiscretionary))));

    // 5. Compounding Leverage - How much extra wealth from arbitrage savings invested
    let compoundedArbitrageWealth = 0;
    const r = 1 + (investmentReturn / 100);
    for (let i = 0; i < years; i++) {
      compoundedArbitrageWealth = (compoundedArbitrageWealth + savingsDelta) * r;
    }

    return {
      destinations,
      yearlyTaxWindfall,
      mobilityPremium,
      lifestyleScore,
      compoundedArbitrageWealth
    };
  }, [isPro, currentLoc, targetLoc, annualIncome, incomeAdjustment, currentMetrics, targetMetrics, savingsDelta, lifestyle, years, investmentReturn]);

  const projectionData = useMemo(() => {
    let currentWealth = 0;
    let targetWealth = 0;
    const data = [];
    const r = 1 + (investmentReturn / 100);
    for (let i = 0; i <= years; i++) {
      data.push({
        year: i,
        current: Math.round(currentWealth),
        target: Math.round(targetWealth),
        difference: Math.round(targetWealth - currentWealth)
      });
      // Negative contributions (deficits) drain the balance, floored at 0.
      currentWealth = Math.max(0, (currentWealth + currentMetrics.netSavings) * r);
      targetWealth = Math.max(0, (targetWealth + targetMetrics.netSavings) * r);
    }
    return data;
  }, [currentMetrics.netSavings, targetMetrics.netSavings, investmentReturn, years]);

  return (
    <div className="space-y-8">

      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="geographic-arbitrage"
          toolName="Geographic Arbitrage Calculator"
          getInputs={() => ({ currentLoc, targetLoc, annualIncome, incomeAdjustment, investmentReturn, years })}
          getKeyResult={() => `${currentLoc} → ${targetLoc}, Income: $${Number(annualIncome).toLocaleString()}`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-[var(--bg-card)] p-7 rounded-3xl shadow-sm border border-[var(--border-default)]/60 ring-1 ring-[var(--border-subtle)]">
            <h2 className="text-lg font-extrabold mb-8 flex items-center gap-2 text-[var(--text-primary)]">
              <Briefcase size={22} className="text-[var(--emerald-500)]" />
              Input Economics
            </h2>
            <LocationSelector label="Source Geography" value={currentLoc} onChange={setCurrentLoc} />
            <LocationSelector label="Target Geography" value={targetLoc} onChange={setTargetLoc} />

            <div className="mb-6">
              <label className="text-sm font-semibold text-[var(--text-secondary)] flex items-center gap-2 mb-2">
                <DollarSign size={16} className="text-[var(--emerald-400)]" />
                Current Gross Salary
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={typeof annualIncome === 'string' ? annualIncome : annualIncome.toLocaleString()}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value === '') {
                      setAnnualIncome('');
                    } else {
                      setAnnualIncome(value);
                    }
                  }}
                  onBlur={() => {
                    const numValue = typeof annualIncome === 'string'
                      ? Math.max(40000, parseFloat(annualIncome) || 40000)
                      : Math.max(40000, annualIncome);
                    setAnnualIncome(numValue);
                  }}
                  className="w-full pl-7 pr-4 py-2.5 bg-[var(--bg-section)] border-2 border-[var(--border-default)] rounded-lg focus:ring-2 focus:ring-[var(--emerald-500)] focus:border-[var(--emerald-border)] outline-none font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div className="mt-1.5 text-xs text-[var(--text-muted)] font-medium">
                <span>Min: 40,000</span>
              </div>
            </div>

            <SliderField label="Salary Adjustment" icon={ArrowRightLeft} value={incomeAdjustment} onChange={setIncomeAdjustment} min={50} max={150} suffix="%" tooltip="What percent of your current salary you would earn in the destination market. 100% means you keep your current pay (e.g. a fully remote role)." />
          </section>

          <section className="bg-[var(--bg-card)] p-7 rounded-3xl shadow-sm border border-[var(--border-default)]/60 ring-1 ring-[var(--border-subtle)]">
            <h2 className="text-lg font-extrabold mb-8 flex items-center gap-2 text-[var(--text-primary)]">
              <TrendingUp size={22} className="text-[var(--emerald-500)]" />
              Variables & Lifestyle
            </h2>
            <SliderField label="Housing Standard" icon={Home} value={lifestyle.housing} onChange={(v) => setLifestyle({...lifestyle, housing: v})} tooltip="Your relative housing quality preference on a 0-100 scale (50 = market-typical). Higher means you want comparable or better housing in the new city." />
            <SliderField label="Consumption" icon={Coffee} value={lifestyle.dining} onChange={(v) => setLifestyle({...lifestyle, dining: v})} />
            <SliderField label="Time Horizon" value={years} onChange={setYears} min={1} max={40} suffix=" Years" />
            <SliderField label="Investment Yield" value={investmentReturn} onChange={setInvestmentReturn} min={1} max={12} suffix="%" />
          </section>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[var(--emerald-500)] text-white p-7 rounded-3xl shadow-xl shadow-[0_0_24px_var(--cta-glow-soft)]/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet size={80} />
              </div>
              <p className="text-[var(--mist-100)] text-xs font-bold uppercase tracking-widest mb-2">Monthly Delta</p>
              <h3 className="text-3xl font-bold tabular-nums">
                {fmtUSD(savingsDelta / 12)}
              </h3>
              <p className="text-xs text-[var(--mist-200)]/80 mt-3 font-medium leading-relaxed">Incremental monthly liquidity created by arbitrage.</p>
            </div>

            <div className="bg-[var(--bg-card)] p-7 rounded-3xl border border-[var(--border-default)]/60 shadow-sm transition-all hover:border-[var(--emerald-border)]">
              <p className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest mb-2">Wealth Gap</p>
              <h3 className="text-3xl font-bold text-[var(--emerald-500)] tabular-nums">
                {fmtUSD(projectionData[projectionData.length - 1].difference)}
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-3 font-medium leading-relaxed">The total opportunity cost of your current location.</p>
            </div>

            <div className="bg-[var(--bg-card)] p-7 rounded-3xl border border-[var(--border-default)]/60 shadow-sm transition-all hover:border-[var(--emerald-border)]">
              <p className="text-[var(--text-tertiary)] text-xs font-bold uppercase tracking-widest mb-2">Burn Rate</p>
              <h3 className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">
                {Math.round((targetMetrics.totalExpenses / currentMetrics.totalExpenses) * 100)}%
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-3 font-medium leading-relaxed">{targetLoc} cost relative to {currentLoc}.</p>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] p-8 rounded-3xl border border-[var(--border-default)]/60 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-extrabold text-[var(--text-primary)]">Compounded Trajectory</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--emerald-500)]"></div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Arbitrage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--bg-glass-strong)]"></div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Current</span>
                </div>
              </div>
            </div>
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D8072" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1D8072" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#2C2C2E" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#8E8E93', fontSize: 11, fontWeight: 600}}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#8E8E93', fontSize: 11, fontWeight: 600}}
                    tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                    dx={-10}
                  />
                  <ChartTooltip
                    cursor={{stroke: '#1D8072', strokeWidth: 1, strokeDasharray: '3 3'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#1D8072"
                    strokeWidth={4}
                    fill="url(#colorTarget)"
                    animationDuration={isDragging ? 0 : 400}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#6D6D72"
                    strokeWidth={2}
                    strokeDasharray="6 6"
                    fill="transparent"
                    animationDuration={isDragging ? 0 : 400}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[var(--bg-card)] p-7 rounded-3xl border border-[var(--border-default)]/60 shadow-sm group hover:ring-1 hover:ring-[var(--border-default)] transition-all">
              <h4 className="font-extrabold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-[var(--text-muted)]" />
                {currentLoc} <span className="text-[10px] bg-[var(--bg-glass)] text-[var(--text-muted)] py-0.5 px-2 rounded-full uppercase tracking-widest ml-auto">Baseline</span>
              </h4>
              <div className="space-y-4">
                <BreakdownRow label="Take-Home Pay" value={currentMetrics.takeHome} />
                <BreakdownRow label="Housing (Yearly)" value={currentMetrics.housingCost} color="text-[var(--crimson-500)]" />
                <BreakdownRow label="Regional COL" value={currentMetrics.dailyCosts} color="text-[var(--crimson-500)]" />
                <div className="pt-5 border-t border-[var(--border-subtle)] flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block tracking-widest">Yearly Surplus</span>
                    <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{fmtUSD(currentMetrics.netSavings)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] p-7 rounded-3xl border-2 border-[var(--emerald-border-soft)] shadow-lg shadow-[0_0_16px_var(--cta-glow-soft)]/20 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--emerald-50)] rounded-bl-full -mr-10 -mt-10 opacity-40"></div>
              <h4 className="font-extrabold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-[var(--emerald-500)]" />
                {targetLoc} <span className="text-[10px] bg-[var(--emerald-500)] text-white py-0.5 px-2 rounded-full uppercase tracking-widest ml-auto">Target</span>
              </h4>
              <div className="space-y-4">
                <BreakdownRow label="Adjusted Take-Home" value={targetMetrics.takeHome} />
                <BreakdownRow label="Housing (Yearly)" value={targetMetrics.housingCost} color="text-[var(--crimson-500)]" />
                <BreakdownRow label="Regional COL" value={targetMetrics.dailyCosts} color="text-[var(--crimson-500)]" />
                <div className="pt-5 border-t border-[var(--border-subtle)] flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-[var(--emerald-400)] uppercase block tracking-widest">Yearly Surplus</span>
                    <span className="text-2xl font-bold text-[var(--emerald-500)] tabular-nums">{fmtUSD(targetMetrics.netSavings)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
            Take-home estimates use 2026 federal brackets (single filer, standard deduction) plus employee-side FICA.
            State tax applies each state's top marginal rate to gross income — a top-marginal estimate that
            overstates the bill in progressive states like CA and NY.
          </p>

          {/* PRO FEATURES SECTION */}
          {!isPro && (
            <div data-theme="dark" className="bg-gradient-to-br from-[var(--emerald-700)] to-[var(--emerald-500)] rounded-3xl p-8 shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--bg-card)]/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="relative">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-[var(--bg-card)]/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <Zap size={24} className="text-white" />
                      </div>
                      <h3 className="text-2xl font-bold">Multi-City Wealth Accelerator</h3>
                    </div>
                    <p className="text-white/90 text-base font-medium mb-6 leading-relaxed">
                      Unlock the full power of geographic arbitrage. See your top 5 destinations ranked by wealth acceleration,
                      calculate tax migration windfalls, quantify career mobility trade-offs, and discover compounding leverage opportunities.
                    </p>
                    <div className="flex flex-wrap gap-3 mb-6">
                      <div className="bg-[var(--bg-card)]/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
                        Top 5 Arbitrage Destinations
                      </div>
                      <div className="bg-[var(--bg-card)]/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
                        Tax Migration Analysis
                      </div>
                      <div className="bg-[var(--bg-card)]/20 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold border border-white/30">
                        Career Mobility Premium
                      </div>
                    </div>
                    <button
                      onClick={onUpgrade}
                      className="bg-[var(--bg-card)] text-[var(--color-warning)] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[var(--color-warning-soft)] transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100"
                    >
                      Upgrade to Pro
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {multiCityAnalysis && (
            <ProGatedPreview isLocked={!isPro} toolId="geographic-arbitrage">
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-[var(--emerald-50)] to-[var(--emerald-50)] border-2 border-[var(--emerald-border-soft)] rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[var(--emerald-500)] rounded-xl flex items-center justify-center">
                    <Plane size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Top 5 Arbitrage Destinations</h3>
                </div>
                <p className="text-[var(--emerald-500)] font-medium mb-6 leading-relaxed">
                  These cities maximize your savings delta while accounting for adjusted income, cost of living, and tax structures.
                  Each represents an optimized wealth acceleration opportunity.
                </p>
                <div className="space-y-3">
                  {multiCityAnalysis.destinations.map((dest, idx) => (
                    <div key={idx} className="bg-[var(--bg-card)] rounded-2xl p-5 border border-[var(--emerald-border-soft)] flex items-center justify-between group hover:border-[var(--emerald-border)] transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[var(--emerald-100)] text-[var(--emerald-500)] rounded-lg flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-[var(--text-primary)]">{dest.location}</h4>
                          <p className="text-xs text-[var(--text-tertiary)] font-medium">Net Savings: {fmtUSD(dest.netSavings)}/year</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-1">Delta</p>
                        <p className="text-2xl font-bold text-[var(--emerald-500)]">{dest.delta >= 0 ? '+' : ''}{fmtUSD(dest.delta)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 bg-[var(--emerald-500)] rounded-2xl p-5 text-white">
                  <div className="flex items-start gap-3">
                    <Zap size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">MUTANT INSIGHT</p>
                      <p className="text-[var(--mist-100)] text-sm font-medium leading-relaxed">
                        The #1 destination delivers {fmtUSD(multiCityAnalysis.destinations[0].delta)} more in annual savings than your current location.
                        Your selected destination's savings advantage compounds to {fmtUSD(multiCityAnalysis.compoundedArbitrageWealth)} in extra wealth over {years} years.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-[var(--color-info-soft)] to-[var(--emerald-50)] border-2 border-[var(--emerald-border-soft)] rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[var(--emerald-500)] rounded-xl flex items-center justify-center">
                      <DollarSign size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--emerald-500)]">Tax Migration Windfall</h3>
                  </div>
                  <p className="text-[var(--emerald-500)] font-medium mb-6 leading-relaxed">
                    Quantifies the state income tax difference between your current and target locations. This is money that would
                    otherwise evaporate to state coffers.
                  </p>
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--emerald-border-soft)] mb-5">
                    <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-2">Annual Tax Savings</p>
                    <p className="text-4xl font-bold text-[var(--emerald-500)] mb-3">${Math.round(Math.max(0, multiCityAnalysis.yearlyTaxWindfall)).toLocaleString()}</p>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                      Top-marginal state rate: <span className="font-bold text-[var(--text-primary)]">{(LOCATION_PRESETS[currentLoc].taxRate * 100).toFixed(1)}%</span> current
                      vs <span className="font-bold text-[var(--text-primary)]">{(LOCATION_PRESETS[targetLoc].taxRate * 100).toFixed(1)}%</span> target
                    </p>
                    {multiCityAnalysis.yearlyTaxWindfall < 0 && (
                      <p className="text-sm text-[var(--crimson-500)] font-medium mt-2">
                        Your target state taxes more — this move adds {fmtUSD(Math.abs(multiCityAnalysis.yearlyTaxWindfall))}/year in state tax.
                      </p>
                    )}
                  </div>
                  <div className="bg-[var(--emerald-500)] rounded-2xl p-5 text-white">
                    <div className="flex items-start gap-3">
                      <Zap size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">MUTANT INSIGHT</p>
                        <p className="text-white/85 text-sm font-medium leading-relaxed">
                          {multiCityAnalysis.yearlyTaxWindfall > 0
                            ? `Moving from ${currentLoc} to ${targetLoc} saves ${fmtUSD(multiCityAnalysis.yearlyTaxWindfall)}/year in pure state tax arbitrage, before cost-of-living differences.`
                            : `${targetLoc} taxes income at the same or a higher rate than ${currentLoc} — there is no state tax windfall on this move.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[var(--crimson-50)] to-[var(--emerald-50)] border-2 border-[var(--crimson-border)] rounded-3xl p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-[var(--crimson-500)] rounded-xl flex items-center justify-center">
                      <TrendingDown size={20} className="text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--crimson-500)]">Career Mobility Premium</h3>
                  </div>
                  <p className="text-[var(--crimson-500)] font-medium mb-6 leading-relaxed">
                    Moving away from high-cost hubs may cost you career trajectory and networking advantages. This metric quantifies
                    the trade-off between savings and long-term earning potential.
                  </p>
                  <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--crimson-border)] mb-5">
                    <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider mb-2">Net Premium After Trajectory Loss</p>
                    <p className={`text-4xl font-bold mb-3 ${multiCityAnalysis.mobilityPremium >= 0 ? 'text-[var(--emerald-500)]' : 'text-[var(--crimson-500)]'}`}>
                      {multiCityAnalysis.mobilityPremium >= 0 ? '+' : ''}${Math.round(multiCityAnalysis.mobilityPremium).toLocaleString()}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">
                      Assumes ~7% of salary lost per year in trajectory over {years} years
                    </p>
                  </div>
                  <div className="bg-[var(--crimson-500)] rounded-2xl p-5 text-white">
                    <div className="flex items-start gap-3">
                      <Zap size={18} className="flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">MUTANT INSIGHT</p>
                        <p className="text-white/85 text-sm font-medium leading-relaxed">
                          {multiCityAnalysis.mobilityPremium >= 0
                            ? `Even accounting for career trajectory loss, arbitrage still nets you ${Math.abs(Math.round(multiCityAnalysis.mobilityPremium)).toLocaleString()} in extra wealth.`
                            : `The savings from arbitrage may not offset the career trajectory loss. Consider hybrid strategies like 5-year sprints in hubs.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-[var(--bg-section)] to-[var(--bg-glass)] border-2 border-[var(--border-default)] rounded-3xl p-8 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[var(--obsidian-700)] rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)]">Lifestyle Compression Score</h3>
                </div>
                <p className="text-[var(--text-secondary)] font-medium mb-6 leading-relaxed">
                  Compares your post-tax, post-housing spending power in the target city with what you have today. A score of 75 means
                  unchanged spending power, below 50 indicates significant compression, and above 75 means the move expands your budget.
                </p>
                <div className="bg-[var(--bg-card)] rounded-2xl p-6 border border-[var(--border-default)] mb-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-wider">Compression Score</p>
                    <p className="text-4xl font-bold text-[var(--text-primary)]">{multiCityAnalysis.lifestyleScore}</p>
                  </div>
                  <div className="w-full bg-[var(--bg-glass-strong)] rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        multiCityAnalysis.lifestyleScore >= 75 ? 'bg-[var(--emerald-500)]' :
                        multiCityAnalysis.lifestyleScore >= 50 ? 'bg-[var(--color-warning)]' :
                        'bg-[var(--crimson-500)]'
                      }`}
                      style={{ width: `${Math.min(100, multiCityAnalysis.lifestyleScore)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs font-bold text-[var(--text-muted)]">
                    <span>High Compression</span>
                    <span>Sustainable</span>
                  </div>
                </div>
                <div className="bg-[var(--obsidian-700)] rounded-2xl p-5 text-white">
                  <div className="flex items-start gap-3">
                    <Zap size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-white/85 uppercase tracking-widest mb-2">MUTANT INSIGHT</p>
                      <p className="text-[var(--text-muted)] text-sm font-medium leading-relaxed">
                        {multiCityAnalysis.lifestyleScore >= 75
                          ? 'Your target location maintains a sustainable lifestyle while delivering arbitrage gains. Low risk of burnout or regret.'
                          : multiCityAnalysis.lifestyleScore >= 50
                          ? 'Moderate lifestyle compression detected. Consider whether the savings justify the trade-offs in dining, housing, and amenities.'
                          : 'High lifestyle compression risk. Ensure the financial gains are worth potential quality-of-life sacrifices.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </ProGatedPreview>
          )}
        </div>
      </div>
      {!isPro && <ProUpsellCard toolId="geographic-arbitrage" isLoggedIn={isLoggedIn} />}
    </div>
  );
}

interface BreakdownRowProps {
  label: string;
  value: number;
  color?: string;
}

const BreakdownRow = ({ label, value, color = "text-[var(--text-secondary)]" }: BreakdownRowProps) => (
  <div className="flex justify-between text-sm items-center">
    <span className="text-[var(--text-muted)] font-medium">{label}</span>
    <span className={`font-bold tabular-nums ${color}`}>${Math.round(value).toLocaleString()}</span>
  </div>
);
