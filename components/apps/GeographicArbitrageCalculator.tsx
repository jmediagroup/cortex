'use client';

import React, { useState, useMemo } from 'react';
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
  Wallet
} from 'lucide-react';

interface LocationData {
  taxRate: number;
  colIndex: number;
  housingBase: number;
  note: string;
}

interface GeographicArbitrageCalculatorProps {
  isPro?: boolean;
  onUpgrade?: () => void;
}

// Comprehensive Data for all 50 State Capitals + Major Hubs + DC + Custom Cities
const LOCATION_PRESETS: Record<string, LocationData> = {
  "Montgomery, AL": { taxRate: 0.05, colIndex: 0.85, housingBase: 1250, note: "Alabama Capital. High affordability in the Deep South." },
  "Juneau, AK": { taxRate: 0.0, colIndex: 1.3, housingBase: 2100, note: "Alaska Capital. 0% income tax but high cost of goods/services." },
  "Phoenix, AZ": { taxRate: 0.025, colIndex: 1.05, housingBase: 1950, note: "Arizona Capital. Low flat tax. Major destination for West Coast exits." },
  "Little Rock, AR": { taxRate: 0.044, colIndex: 0.85, housingBase: 1300, note: "Arkansas Capital. Low cost of living and declining tax rates." },
  "Sacramento, CA": { taxRate: 0.093, colIndex: 1.3, housingBase: 2200, note: "California Capital. High state tax but ~30% cheaper than SF/LA." },
  "San Francisco, CA": { taxRate: 0.093, colIndex: 1.8, housingBase: 3500, note: "Benchmark Hub. Peak geographic arbitrage origin point." },
  "Los Angeles, CA": { taxRate: 0.093, colIndex: 1.6, housingBase: 2900, note: "Benchmark Hub. High CA tax. Significant utility/gas burden." },
  "Denver, CO": { taxRate: 0.044, colIndex: 1.1, housingBase: 2200, note: "Colorado Capital. Flat tax rate. Popular destination with rising costs." },
  "Hartford, CT": { taxRate: 0.055, colIndex: 1.15, housingBase: 1800, note: "Connecticut Capital. Moderate costs but high local property taxes." },
  "Dover, DE": { taxRate: 0.05, colIndex: 1.0, housingBase: 1600, note: "Delaware Capital. Moderate tax and no sales tax." },
  "Washington, D.C.": { taxRate: 0.085, colIndex: 1.7, housingBase: 2800, note: "U.S. Capital. High income tax brackets and extreme housing costs. Major outflow hub." },
  "Tallahassee, FL": { taxRate: 0.0, colIndex: 1.0, housingBase: 1750, note: "Florida Capital. 0% state income tax. Lower costs than Miami." },
  "Miami, FL": { taxRate: 0.0, colIndex: 1.2, housingBase: 2400, note: "Major Metro Hub. 0% state income tax. Significant housing demand and international appeal." },
  "Atlanta, GA": { taxRate: 0.054, colIndex: 1.0, housingBase: 1900, note: "Georgia Capital. Major Inflow Hub. Corporate center with moderate housing." },
  "Honolulu, HI": { taxRate: 0.0825, colIndex: 1.8, housingBase: 3100, note: "Hawaii Capital. Extremely high COL and housing burden." },
  "Boise, ID": { taxRate: 0.058, colIndex: 1.05, housingBase: 2000, note: "Idaho Capital. High recent Inflow from West Coast. Rising housing." },
  "Springfield, IL": { taxRate: 0.0495, colIndex: 0.85, housingBase: 1300, note: "Illinois Capital. Flat tax and high housing affordability." },
  "Indianapolis, IN": { taxRate: 0.0315, colIndex: 0.9, housingBase: 1500, note: "Indiana Capital. Low flat state tax and stable housing costs." },
  "Des Moines, IA": { taxRate: 0.057, colIndex: 0.85, housingBase: 1300, note: "Iowa Capital. Strong insurance/finance hub. High affordability." },
  "Topeka, KS": { taxRate: 0.057, colIndex: 0.82, housingBase: 1250, note: "Kansas Capital. Highly affordable housing with moderate state tax." },
  "Frankfort, KY": { taxRate: 0.045, colIndex: 0.85, housingBase: 1200, note: "Kentucky Capital. Very affordable living and flat tax rate." },
  "Baton Rouge, LA": { taxRate: 0.0425, colIndex: 0.9, housingBase: 1350, note: "Louisiana Capital. Low housing costs and moderate state tax." },
  "Augusta, ME": { taxRate: 0.0715, colIndex: 0.95, housingBase: 1400, note: "Maine Capital. Higher state tax but low housing costs." },
  "Annapolis, MD": { taxRate: 0.0475, colIndex: 1.25, housingBase: 2400, note: "Maryland Capital. High local COL due to DC proximity." },
  "Boston, MA": { taxRate: 0.05, colIndex: 1.65, housingBase: 3200, note: "Massachusetts Capital. High Outflow due to housing burden." },
  "Lansing, MI": { taxRate: 0.0425, colIndex: 0.88, housingBase: 1350, note: "Michigan Capital. Low housing costs and flat tax rate." },
  "St. Paul, MN": { taxRate: 0.07, colIndex: 1.05, housingBase: 1700, note: "Minnesota Capital. Higher tax but high social service index." },
  "Jackson, MS": { taxRate: 0.05, colIndex: 0.8, housingBase: 1150, note: "Mississippi Capital. Lowest housing baseline in the dataset." },
  "Jefferson City, MO": { taxRate: 0.0495, colIndex: 0.82, housingBase: 1200, note: "Missouri Capital. High affordability and moderate state tax." },
  "Helena, MT": { taxRate: 0.059, colIndex: 1.0, housingBase: 1700, note: "Montana Capital. Increasing Inflow. No sales tax." },
  "Lincoln, NE": { taxRate: 0.058, colIndex: 0.92, housingBase: 1450, note: "Nebraska Capital. High stability and low discretionary costs." },
  "Carson City, NV": { taxRate: 0.0, colIndex: 1.05, housingBase: 1850, note: "Nevada Capital. 0% state income tax. High West Coast migration." },
  "Concord, NH": { taxRate: 0.0, colIndex: 1.1, housingBase: 1900, note: "New Hampshire Capital. 0% tax on earned income." },
  "Trenton, NJ": { taxRate: 0.0637, colIndex: 1.2, housingBase: 1900, note: "New Jersey Capital. High property taxes and progressive income tax." },
  "Santa Fe, NM": { taxRate: 0.059, colIndex: 1.1, housingBase: 2000, note: "New Mexico Capital. High cultural value with moderate tax burden." },
  "Albany, NY": { taxRate: 0.065, colIndex: 1.05, housingBase: 1600, note: "NY State Capital. Progressive tax system. Moderate COL." },
  "New York, NY": { taxRate: 0.10, colIndex: 1.9, housingBase: 3800, note: "Benchmark Hub. Highest tax drag (City + State). Max Outflow risk." },
  "Raleigh, NC": { taxRate: 0.045, colIndex: 0.95, housingBase: 1750, note: "North Carolina Capital. Flat tax and Research Triangle growth." },
  "Wilmington, NC": { taxRate: 0.045, colIndex: 0.95, housingBase: 1650, note: "Coastal Destination. Favorable flat tax (4.5%) and high appeal for remote workers/retirees." },
  "Bismarck, ND": { taxRate: 0.025, colIndex: 0.9, housingBase: 1300, note: "North Dakota Capital. Very low state tax and stable economy." },
  "Columbus, OH": { taxRate: 0.035, colIndex: 0.95, housingBase: 1650, note: "Ohio Capital. Rapidly growing tech/corporate hub." },
  "Oklahoma City, OK": { taxRate: 0.0475, colIndex: 0.88, housingBase: 1400, note: "Oklahoma Capital. Rapidly growing with low cost of operations." },
  "Salem, OR": { taxRate: 0.0875, colIndex: 1.1, housingBase: 1850, note: "Oregon Capital. High income tax but no sales tax." },
  "Harrisburg, PA": { taxRate: 0.0307, colIndex: 0.95, housingBase: 1400, note: "Pennsylvania Capital. Low flat tax rate and moderate COL." },
  "Providence, RI": { taxRate: 0.0475, colIndex: 1.15, housingBase: 1900, note: "Rhode Island Capital. Moderate costs with proximity to Boston." },
  "Columbia, SC": { taxRate: 0.07, colIndex: 0.9, housingBase: 1450, note: "South Carolina Capital. Low COL offset by tax brackets." },
  "Pierre, SD": { taxRate: 0.0, colIndex: 0.9, housingBase: 1400, note: "South Dakota Capital. 0% state income tax. Favorable for savings." },
  "Nashville, TN": { taxRate: 0.0, colIndex: 0.95, housingBase: 1800, note: "Tennessee Capital. 0% state income tax. Massive cultural Inflow Hub." },
  "Austin, TX": { taxRate: 0.0, colIndex: 1.1, housingBase: 2100, note: "Texas Capital. 0% state income tax. Major tech Inflow Hub." },
  "Salt Lake City, UT": { taxRate: 0.0485, colIndex: 1.1, housingBase: 2100, note: "Utah Capital. Flat tax and high Inflow (Silicon Slopes)." },
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

export default function GeographicArbitrageCalculator({ isPro, onUpgrade }: GeographicArbitrageCalculatorProps) {
  const [currentLoc, setCurrentLoc] = useState("San Francisco, CA");
  const [targetLoc, setTargetLoc] = useState("Austin, TX");
  const [annualIncome, setAnnualIncome] = useState(150000);
  const [incomeAdjustment, setIncomeAdjustment] = useState(100);
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [years, setYears] = useState(20);
  const [isDragging, setIsDragging] = useState(false);

  const [lifestyle, setLifestyle] = useState({
    housing: 50,
    dining: 40,
    transit: 30,
    discretionary: 50
  });

  // Sort keys by State (suffix) then City (prefix)
  const sortedLocationKeys = useMemo(() => {
    return Object.keys(LOCATION_PRESETS).sort((a, b) => {
      if (a === "Remote / LCOL") return 1;
      if (b === "Remote / LCOL") return -1;
      const partsA = a.split(', ');
      const partsB = b.split(', ');
      const stateA = partsA[1] || "";
      const stateB = partsB[1] || "";
      if (stateA !== stateB) return stateA.localeCompare(stateB);
      return partsA[0].localeCompare(partsB[0]);
    });
  }, []);

  const calculateMetrics = (locKey: string, income: number) => {
    const loc = LOCATION_PRESETS[locKey];
    const fedTax = 0.22;
    const stateTax = loc.taxRate;
    const totalTax = income * (fedTax + stateTax);
    const takeHome = income - totalTax;
    const housingCost = loc.housingBase * (lifestyle.housing / 50) * 12;
    const dailyCosts = (1500 * loc.colIndex) * (1 + (lifestyle.dining + lifestyle.transit + lifestyle.discretionary) / 150) * 12;
    const totalExpenses = housingCost + dailyCosts;
    const netSavings = Math.max(0, takeHome - totalExpenses);
    return { takeHome, totalTax, housingCost, dailyCosts, totalExpenses, netSavings };
  };

  const currentMetrics = useMemo(() => calculateMetrics(currentLoc, annualIncome), [currentLoc, annualIncome, lifestyle]);
  const targetMetrics = useMemo(() => calculateMetrics(targetLoc, annualIncome * (incomeAdjustment / 100)), [targetLoc, annualIncome, incomeAdjustment, lifestyle]);

  const savingsDelta = targetMetrics.netSavings - currentMetrics.netSavings;

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
      currentWealth = (currentWealth + currentMetrics.netSavings) * r;
      targetWealth = (targetWealth + targetMetrics.netSavings) * r;
    }
    return data;
  }, [currentMetrics.netSavings, targetMetrics.netSavings, investmentReturn, years]);

  interface SliderFieldProps {
    label: string;
    icon?: React.ComponentType<{ size?: number; className?: string }>;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    suffix?: string;
  }

  const SliderField = ({ label, icon: Icon, value, onChange, min = 0, max = 100, suffix = "" }: SliderFieldProps) => {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
      <div className="mb-6 group">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-semibold text-slate-700 flex items-center gap-2 group-hover:text-indigo-600 transition-colors">
            {Icon && <Icon size={16} className="text-indigo-500" />}
            {label}
          </label>
          <span className="text-sm font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full tabular-nums">
            {value.toLocaleString()}{suffix}
          </span>
        </div>
        <div className="relative flex items-center py-3">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            onChange={(e) => onChange(parseInt(e.target.value))}
            style={{
              background: `linear-gradient(to right, #4f46e5 ${percentage}%, #e2e8f0 ${percentage}%)`
            }}
            className="w-full h-3 rounded-lg appearance-none cursor-grab active:cursor-grabbing accent-indigo-600 bg-slate-200 slider-thumb-custom focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
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
        <label className="text-sm font-semibold text-slate-700 block">{label}</label>
        <div className="relative">
          <Info size={14} className="text-slate-400 hover:text-indigo-600 cursor-help transition-colors" />
          <div className="absolute right-0 bottom-full mb-2 w-72 bg-slate-900 text-white text-[11px] p-4 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none leading-relaxed border border-slate-700">
            <p className="font-bold text-indigo-400 border-b border-slate-700 pb-2 mb-2 uppercase tracking-wider">{value} Regional Profile</p>
            {LOCATION_PRESETS[value].note}
          </div>
        </div>
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3.5 rounded-xl border-2 border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-100 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none appearance-none cursor-pointer transition-all font-medium text-slate-800"
        >
          {sortedLocationKeys.map(loc => <option key={loc} value={loc}>{loc}</option>)}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <ChevronRight size={18} className="rotate-90" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <style>{`
        /* Enhanced slider thumb styling for better interaction */
        .slider-thumb-custom {
          position: relative;
        }

        .slider-thumb-custom::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: #ffffff;
          border: 3px solid #4f46e5;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 12px rgba(79, 70, 229, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          margin-top: -9px;
        }

        .slider-thumb-custom::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #ffffff;
          border: 3px solid #4f46e5;
          border-radius: 50%;
          cursor: grab;
          box-shadow: 0 2px 12px rgba(79, 70, 229, 0.3), 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
        }

        .slider-thumb-custom:hover::-webkit-slider-thumb {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .slider-thumb-custom:hover::-moz-range-thumb {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4), 0 2px 6px rgba(0, 0, 0, 0.15);
        }

        .slider-thumb-custom:active::-webkit-slider-thumb {
          cursor: grabbing;
          transform: scale(1.15);
          box-shadow: 0 0 0 10px rgba(79, 70, 229, 0.1), 0 4px 20px rgba(79, 70, 229, 0.5);
          border-width: 4px;
        }

        .slider-thumb-custom:active::-moz-range-thumb {
          cursor: grabbing;
          transform: scale(1.15);
          box-shadow: 0 0 0 10px rgba(79, 70, 229, 0.1), 0 4px 20px rgba(79, 70, 229, 0.5);
          border-width: 4px;
        }

        /* Increase hit area for better mobile/touch interaction */
        .slider-thumb-custom::-webkit-slider-thumb::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          right: -10px;
          bottom: -10px;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 ring-1 ring-slate-100">
            <h2 className="text-lg font-extrabold mb-8 flex items-center gap-2 text-slate-800">
              <Briefcase size={22} className="text-indigo-600" />
              Input Economics
            </h2>
            <LocationSelector label="Source Geography" value={currentLoc} onChange={setCurrentLoc} />
            <LocationSelector label="Target Geography" value={targetLoc} onChange={setTargetLoc} />
            <SliderField label="Current Gross Salary" icon={DollarSign} value={annualIncome} onChange={setAnnualIncome} min={40000} max={500000} />
            <SliderField label="Retention Ratio" icon={ArrowRightLeft} value={incomeAdjustment} onChange={setIncomeAdjustment} min={50} max={150} suffix="%" />
          </section>

          <section className="bg-white p-7 rounded-3xl shadow-sm border border-slate-200/60 ring-1 ring-slate-100">
            <h2 className="text-lg font-extrabold mb-8 flex items-center gap-2 text-slate-800">
              <TrendingUp size={22} className="text-indigo-600" />
              Variables & Lifestyle
            </h2>
            <SliderField label="Housing Standard" icon={Home} value={lifestyle.housing} onChange={(v) => setLifestyle({...lifestyle, housing: v})} />
            <SliderField label="Consumption" icon={Coffee} value={lifestyle.dining} onChange={(v) => setLifestyle({...lifestyle, dining: v})} />
            <SliderField label="Time Horizon" value={years} onChange={setYears} min={1} max={40} suffix=" Years" />
            <SliderField label="Investment Yield" value={investmentReturn} onChange={setInvestmentReturn} min={1} max={12} suffix="%" />
          </section>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-indigo-600 text-white p-7 rounded-3xl shadow-xl shadow-indigo-200/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet size={80} />
              </div>
              <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-2">Monthly Delta</p>
              <h3 className="text-3xl font-black tabular-nums">
                ${Math.round(savingsDelta / 12).toLocaleString()}
              </h3>
              <p className="text-xs text-indigo-200/80 mt-3 font-medium leading-relaxed">Incremental monthly liquidity created by arbitrage.</p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:border-emerald-200">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Wealth Gap</p>
              <h3 className="text-3xl font-black text-emerald-600 tabular-nums">
                ${projectionData[projectionData.length - 1].difference.toLocaleString()}
              </h3>
              <p className="text-xs text-slate-400 mt-3 font-medium leading-relaxed">The total opportunity cost of your current location.</p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm transition-all hover:border-indigo-200">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Burn Rate</p>
              <h3 className="text-3xl font-black text-slate-800 tabular-nums">
                {Math.round((targetMetrics.totalExpenses / currentMetrics.totalExpenses) * 100)}%
              </h3>
              <p className="text-xs text-slate-400 mt-3 font-medium leading-relaxed">{targetLoc} cost relative to {currentLoc}.</p>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-xl font-extrabold text-slate-800">Compounded Trajectory</h3>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Arbitrage</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Current</span>
                </div>
              </div>
            </div>
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.02}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}}
                    dy={15}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}}
                    tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`}
                    dx={-10}
                  />
                  <ChartTooltip
                    cursor={{stroke: '#4f46e5', strokeWidth: 1, strokeDasharray: '3 3'}}
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#4f46e5"
                    strokeWidth={4}
                    fill="url(#colorTarget)"
                    animationDuration={isDragging ? 0 : 400}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stroke="#cbd5e1"
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
            <div className="bg-white p-7 rounded-3xl border border-slate-200/60 shadow-sm group hover:ring-1 hover:ring-slate-200 transition-all">
              <h4 className="font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-slate-300" />
                {currentLoc} <span className="text-[10px] bg-slate-100 text-slate-400 py-0.5 px-2 rounded-full uppercase tracking-widest ml-auto">Baseline</span>
              </h4>
              <div className="space-y-4">
                <BreakdownRow label="Take-Home Pay" value={currentMetrics.takeHome} />
                <BreakdownRow label="Housing (Yearly)" value={currentMetrics.housingCost} color="text-red-500" />
                <BreakdownRow label="Regional COL" value={currentMetrics.dailyCosts} color="text-red-500" />
                <div className="pt-5 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-widest">Yearly Surplus</span>
                    <span className="text-2xl font-black text-slate-800 tabular-nums">${Math.round(currentMetrics.netSavings).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-7 rounded-3xl border-2 border-indigo-100 shadow-lg shadow-indigo-100/20 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-40"></div>
              <h4 className="font-extrabold text-slate-800 mb-6 flex items-center gap-2">
                <MapPin size={18} className="text-indigo-600" />
                {targetLoc} <span className="text-[10px] bg-indigo-600 text-white py-0.5 px-2 rounded-full uppercase tracking-widest ml-auto">Target</span>
              </h4>
              <div className="space-y-4">
                <BreakdownRow label="Adjusted Take-Home" value={targetMetrics.takeHome} />
                <BreakdownRow label="Housing (Yearly)" value={targetMetrics.housingCost} color="text-red-500" />
                <BreakdownRow label="Regional COL" value={targetMetrics.dailyCosts} color="text-red-500" />
                <div className="pt-5 border-t border-slate-100 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase block tracking-widest">Yearly Surplus</span>
                    <span className="text-2xl font-black text-indigo-600 tabular-nums">${Math.round(targetMetrics.netSavings).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface BreakdownRowProps {
  label: string;
  value: number;
  color?: string;
}

const BreakdownRow = ({ label, value, color = "text-slate-600" }: BreakdownRowProps) => (
  <div className="flex justify-between text-sm items-center">
    <span className="text-slate-400 font-medium">{label}</span>
    <span className={`font-bold tabular-nums ${color}`}>${Math.round(value).toLocaleString()}</span>
  </div>
);
