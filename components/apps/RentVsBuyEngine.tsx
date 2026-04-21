'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';
import {
  TrendingUp, Home, Calculator, Settings2, Info, AlertTriangle, ShieldCheck, Landmark, Lock, Zap, MapPin, Repeat, DollarSign
} from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import Tooltip from '@/components/ui/Tooltip';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';
import ProGatedPreview from '@/components/monetization/ProGatedPreview';

interface RentVsBuyEngineProps {
  isPro?: boolean;
  isLoggedIn?: boolean;
  onUpgrade?: () => void;
  initialValues?: Record<string, unknown>;
}

export default function RentVsBuyEngine({ isPro, isLoggedIn = false, onUpgrade, initialValues }: RentVsBuyEngineProps) {
  // --- Input State ---
  const [purchasePrice, setPurchasePrice] = useState(500000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [monthlyRent, setMonthlyRent] = useState(2800);
  const [years, setYears] = useState(10);

  // Advanced Inputs
  const [appreciationRate, setAppreciationRate] = useState(4);
  const [rentInflation, setRentInflation] = useState(3.5);
  const [stockReturn, setStockReturn] = useState(8);
  const [maintenanceRate, setMaintenanceRate] = useState(1.5); // % of home value/year
  const [propertyTax, setPropertyTax] = useState(1.2);
  const [buyingCosts, setBuyingCosts] = useState(2); // Closing costs %
  const [sellingCosts, setSellingCosts] = useState(6); // Real estate agent + transfer fees

  const initialApplied = useRef(false);
  useEffect(() => {
    if (!initialValues || initialApplied.current) return;
    initialApplied.current = true;
    const v = initialValues as Record<string, number>;
    if (v.purchasePrice != null) setPurchasePrice(v.purchasePrice);
    if (v.downPaymentPct != null) setDownPaymentPct(v.downPaymentPct);
    if (v.mortgageRate != null) setMortgageRate(v.mortgageRate);
    if (v.monthlyRent != null) setMonthlyRent(v.monthlyRent);
    if (v.years != null) setYears(v.years);
    if (v.appreciationRate != null) setAppreciationRate(v.appreciationRate);
    if (v.rentInflation != null) setRentInflation(v.rentInflation);
    if (v.stockReturn != null) setStockReturn(v.stockReturn);
    if (v.maintenanceRate != null) setMaintenanceRate(v.maintenanceRate);
    if (v.propertyTax != null) setPropertyTax(v.propertyTax);
    if (v.buyingCosts != null) setBuyingCosts(v.buyingCosts);
    if (v.sellingCosts != null) setSellingCosts(v.sellingCosts);
  }, [initialValues]);

  // --- Calculations ---
  const results = useMemo(() => {
    const data = [];
    const downPayment = purchasePrice * (downPaymentPct / 100);
    const loanAmount = purchasePrice - downPayment;
    const monthlyRate = mortgageRate / 100 / 12;
    const totalPayments = 30 * 12; // 30-year fixed assumption

    // Standard Mortgage Payment (P&I)
    const monthlyPI = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / (Math.pow(1 + monthlyRate, totalPayments) - 1);

    // Initial Sunk Costs (Closing costs + Down Payment)
    let totalSunkBuying = purchasePrice * (buyingCosts / 100);

    // State Tracking
    let currentHomeValue = purchasePrice;
    let currentMortgageBalance = loanAmount;
    let currentRent = monthlyRent;
    let investedCapital = downPayment + totalSunkBuying; // Opportunity cost tracking
    let totalPaidInRent = 0;

    for (let yr = 0; yr <= 30; yr++) {
      // Net Worth: Buy Side
      // (Home Value - Mortgage Balance - Selling Costs)
      const sellingFees = currentHomeValue * (sellingCosts / 100);
      const buyNetWorth = currentHomeValue - currentMortgageBalance - sellingFees;

      // Net Worth: Rent Side
      // (Invested initial capital + invested monthly difference)
      const rentNetWorth = investedCapital;

      data.push({
        year: yr,
        buyNetWorth: Math.round(buyNetWorth),
        rentNetWorth: Math.round(rentNetWorth),
        homeValue: Math.round(currentHomeValue),
        rentCost: Math.round(currentRent),
      });

      // Update for next year
      const annualPropertyTax = currentHomeValue * (propertyTax / 100);
      const annualMaintenance = currentHomeValue * (maintenanceRate / 100);
      const annualInsurance = currentHomeValue * 0.005; // 0.5% placeholder

      const totalAnnualBuyCosts = (monthlyPI * 12) + annualPropertyTax + annualMaintenance + annualInsurance;
      const totalAnnualRentCosts = currentRent * 12;

      // Calculate Difference (What is "saved" by renting/buying?)
      // If renting is cheaper, the surplus is invested. If buying is cheaper, the difference adds to buy side?
      // Reality: Most often, renting is cheaper monthly in early years.
      const monthlyDiff = (totalAnnualBuyCosts - totalAnnualRentCosts) / 12;

      // Update Investment Capital (The "Renters" portfolio)
      // They invested the initial downpayment + closing costs, plus the monthly savings.
      investedCapital = (investedCapital * (1 + stockReturn/100)) + (monthlyDiff * 12);

      // Update House Value & Balance
      currentHomeValue *= (1 + appreciationRate / 100);
      currentRent *= (1 + rentInflation / 100);

      // Simple Principal Reduction (approximate for year)
      for(let m = 0; m < 12; m++) {
        const interestM = currentMortgageBalance * monthlyRate;
        const principalM = monthlyPI - interestM;
        currentMortgageBalance -= principalM;
      }
      if (currentMortgageBalance < 0) currentMortgageBalance = 0;
    }
    return data;
  }, [purchasePrice, downPaymentPct, mortgageRate, monthlyRent, appreciationRate, rentInflation, stockReturn, maintenanceRate, propertyTax, buyingCosts, sellingCosts]);

  const currentYearData = results[years];
  const winner = currentYearData.buyNetWorth > currentYearData.rentNetWorth ? 'Buy' : 'Rent';
  const nwDiff = Math.abs(currentYearData.buyNetWorth - currentYearData.rentNetWorth);

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // PRO FEATURE: Lifecycle Housing Strategy
  const lifecycleAnalysis = useMemo(() => {
    if (!isPro) {
      // Sample data for blurred preview
      return {
        moves: {
          transactionCosts: 72000,
          singleHomeTransactionCost: 36000,
          extraFriction: 36000
        },
        marketTimingRisk: 225000,
        bestCase: 562500,
        worstCase: 337500,
        totalHiddenCosts: 185000,
        monthlyHiddenDrag: 1028,
        mobilityPremium: 50000,
        mobilityAdjustedRentNW: 480000,
        geoArbitrageGain: 108000,
        hcolRent: 3750,
        lcolHomePrice: 270000,
        _isPreview: true
      };
    }

    // Scenario 1: 3-Move Lifecycle (Starter → Family Home → Downsize)
    const threeMoveSim = () => {
      // Move 1: Starter home (years 0-7)
      const starter = { price: purchasePrice * 0.7, years: 7, rent: monthlyRent * 0.8 };
      // Move 2: Family home (years 7-22)
      const family = { price: purchasePrice, years: 15, rent: monthlyRent };
      // Move 3: Downsize (years 22-30)
      const downsize = { price: purchasePrice * 0.6, years: 8, rent: monthlyRent * 0.7 };

      // Simplified calculation: transaction costs eat wealth
      const transactionCosts = (starter.price + family.price + downsize.price) * (buyingCosts + sellingCosts) / 100;
      const singleHomeTransactionCost = purchasePrice * (buyingCosts + sellingCosts) / 100;

      return {
        transactionCosts,
        singleHomeTransactionCost,
        extraFriction: transactionCosts - singleHomeTransactionCost
      };
    };

    const moves = threeMoveSim();

    // Scenario 2: Market Timing Risk
    const bestCase = currentYearData.buyNetWorth * 1.25; // +25% if bought at bottom
    const worstCase = currentYearData.buyNetWorth * 0.75; // -25% if bought at peak
    const marketTimingRisk = bestCase - worstCase;

    // Scenario 3: Hidden Drag Calculator
    const annualMaintenance = purchasePrice * (maintenanceRate / 100);
    const annualPropertyTax = purchasePrice * (propertyTax / 100);
    const annualInsurance = purchasePrice * 0.005;
    const annualHOA = 3600; // $300/mo estimate
    const closingCost = purchasePrice * (buyingCosts / 100);
    const futureSellingCost = currentYearData.homeValue * (sellingCosts / 100);

    const totalHiddenCosts = (annualMaintenance + annualPropertyTax + annualInsurance + annualHOA) * years + closingCost + futureSellingCost;
    const monthlyHiddenDrag = totalHiddenCosts / years / 12;

    // Scenario 4: Career Mobility Premium
    // Renting allows instant relocation = career optionality
    const mobilityPremium = 50000; // Conservative: ability to take 10% raise in another city
    const mobilityAdjustedRentNW = currentYearData.rentNetWorth + (years > 5 ? mobilityPremium : 0);

    // Scenario 5: Geographic Arbitrage Analysis
    const hcolRent = monthlyRent * 1.5; // High cost of living area
    const lcolHomePrice = purchasePrice * 0.6; // Low cost of living area
    const geoArbitrageGain = (monthlyRent * 1.5 - monthlyRent) * 12 * years;

    return {
      moves,
      marketTimingRisk,
      bestCase,
      worstCase,
      totalHiddenCosts,
      monthlyHiddenDrag,
      mobilityPremium,
      mobilityAdjustedRentNW,
      geoArbitrageGain,
      hcolRent,
      lcolHomePrice
    };
  }, [isPro, purchasePrice, monthlyRent, years, currentYearData, buyingCosts, sellingCosts, maintenanceRate, propertyTax]);

  return (
    <div className="space-y-8">
      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="rent-vs-buy"
          toolName="Rent vs Buy Reality Engine"
          getInputs={() => ({ purchasePrice, downPaymentPct, mortgageRate, monthlyRent, years, appreciationRate, rentInflation, stockReturn, maintenanceRate, propertyTax, buyingCosts, sellingCosts })}
          getKeyResult={() => `$${purchasePrice.toLocaleString()} home vs $${monthlyRent.toLocaleString()}/mo rent over ${years}yr`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-default)]">
            <div className="flex items-center gap-2 mb-4 text-[var(--emerald-500)] font-semibold">
              <Calculator size={18} />
              <h2>Core Figures</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Purchase Price</label>
                <input
                  type="range" min="100000" max="2000000" step="10000"
                  value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-1 font-mono font-medium">
                  <span>{formatCurrency(purchasePrice)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Current Monthly Rent</label>
                <input
                  type="range" min="500" max="10000" step="50"
                  value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full h-2 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-1 font-mono font-medium">
                  <span>{formatCurrency(monthlyRent)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Mortgage Rate %</label>
                  <input
                    type="number" step="0.1" value={mortgageRate} onChange={(e) => setMortgageRate(Number(e.target.value))}
                    className="w-full p-2 border border-[var(--border-default)] rounded-md bg-[var(--bg-section)] focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase mb-1">Down Payment %</label>
                  <input
                    type="number" value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full p-2 border border-[var(--border-default)] rounded-md bg-[var(--bg-section)] focus:outline-indigo-600"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-default)]">
            <div className="flex items-center gap-2 mb-4 text-[var(--emerald-500)] font-semibold">
              <Settings2 size={18} />
              <h2>The &quot;Reality&quot; Sliders</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Maintenance Drag<Tooltip content="Annual maintenance costs as a percentage of home value. Typically 1-2% per year." /></label>
                  <span className="text-xs font-mono bg-[var(--color-warning-soft)] text-[var(--color-warning)] px-1.5 py-0.5 rounded">{maintenanceRate}% / yr</span>
                </div>
                <input
                  type="range" min="0" max="4" step="0.1"
                  value={maintenanceRate} onChange={(e) => setMaintenanceRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1 italic">Roofs, HVAC, leaks, and time. Realtor math usually ignores this.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Alt Investment Return<Tooltip content="The annual return you could earn by investing your down payment instead of buying." /></label>
                  <span className="text-xs font-mono bg-[var(--emerald-100)] text-[var(--emerald-500)] px-1.5 py-0.5 rounded">{stockReturn}% / yr</span>
                </div>
                <input
                  type="range" min="0" max="15" step="0.5"
                  value={stockReturn} onChange={(e) => setStockReturn(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1 italic">The opportunity cost of your down payment in an S&P 500 index.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase">Home Appreciation</label>
                  <span className="text-xs font-mono bg-[var(--color-info-soft)] text-[var(--color-info)] px-1.5 py-0.5 rounded">{appreciationRate}% / yr</span>
                </div>
                <input
                  type="range" min="-2" max="10" step="0.1"
                  value={appreciationRate} onChange={(e) => setAppreciationRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-[var(--bg-glass-strong)] rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Main Visuals Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Time Horizon Master Slider */}
          <div className="bg-[var(--obsidian-800)] text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingUp size={120} />
            </div>

            <div className="relative z-10">
              <h3 className="text-[var(--mist-200)] text-xs font-bold uppercase tracking-widest mb-4">Select Your Time Horizon</h3>
              <input
                type="range" min="1" max="30" step="1"
                value={years} onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-4 bg-[var(--emerald-600)] rounded-xl appearance-none cursor-pointer accent-white mb-6"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-[var(--mist-200)] text-xs font-semibold uppercase">Timeline</p>
                  <p className="text-3xl font-bold">{years} <span className="text-lg">Years</span></p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-[var(--mist-200)] text-xs font-semibold uppercase mb-1">The Verdict</p>
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-1 rounded-full text-lg font-semibold uppercase tracking-tighter ${winner === 'Buy' ? 'bg-[var(--emerald-500)] text-white' : 'bg-[var(--crimson-500)] text-white'}`}>
                      {winner} Wins
                    </div>
                    <p className="text-white text-sm">
                      by <span className="font-bold font-mono">{formatCurrency(nwDiff)}</span> in net worth
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Area */}
          <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-default)] shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-[var(--text-primary)]">Net Worth Trajectory</h3>
                <p className="text-xs text-[var(--text-muted)]">Total liquid capital + home equity minus selling costs</p>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[var(--emerald-500)] rounded-full"></div> Buy</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[var(--bg-glass-strong)] rounded-full"></div> Rent</div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0A0" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#00F0A0" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2C2C2E" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#8E8E93', fontSize: 12}}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#8E8E93', fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#8E8E93', fontSize: 12}}
                    tickFormatter={(val) => `$${val/1000}k`}
                  />
                  <ChartTooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <ReferenceLine x={years} stroke="#00F0A0" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="buyNetWorth" name="Buy Net Worth" stroke="#00F0A0" strokeWidth={3} fillOpacity={1} fill="url(#colorBuy)" />
                  <Area type="monotone" dataKey="rentNetWorth" name="Rent Portfolio" stroke="#8E8E93" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flexibility & Risk Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-3 text-[var(--color-warning)]">
                <AlertTriangle size={20} />
                <h4 className="font-bold">Mobility Risk</h4>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Selling this home in year {years} will cost you roughly <span className="font-bold text-[var(--text-primary)]">{formatCurrency(currentYearData.homeValue * (sellingCosts/100))}</span> in commissions and fees.
              </p>
              <div className="w-full bg-[var(--bg-glass)] rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${years < 5 ? 'bg-[var(--crimson-500)]' : 'bg-[var(--emerald-500)]'}`}
                  style={{ width: `${Math.min(100, years * 10)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-[var(--text-muted)] uppercase">
                <span>High Friction</span>
                <span>Amortized</span>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] p-5 rounded-2xl border border-[var(--border-default)]">
              <div className="flex items-center gap-2 mb-3 text-[var(--emerald-500)]">
                <ShieldCheck size={20} />
                <h4 className="font-bold">Flexibility Score</h4>
              </div>
              <ul className="text-sm space-y-2 text-[var(--text-secondary)]">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--emerald-400)] mt-1.5 shrink-0"></div>
                  <span>{winner === 'Rent' ? 'Rent gives you liquidity to pivot careers or cities instantly.' : 'Buying provides long-term stability and a fixed housing cost.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--emerald-400)] mt-1.5 shrink-0"></div>
                  <span>Estimated maintenance: <span className="font-bold">{formatCurrency((currentYearData.homeValue * maintenanceRate / 100) / 12)}/mo</span> average.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* PRO FEATURES UPGRADE CARD */}
      {!isPro && (
        <div className="bg-gradient-to-br from-[var(--emerald-500)] to-[var(--emerald-500)] rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
            <Zap size={200} fill="currentColor" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <Lock size={24} />
              <h3 className="text-3xl font-bold">Lifecycle Housing Strategy</h3>
            </div>
            <p className="text-[var(--mist-50)] text-lg font-medium mb-8 max-w-3xl leading-relaxed">
              Unlock advanced simulations that reveal the long-term wealth impact of housing decisions across multiple moves, market conditions, and life stages.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <Repeat size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">3-Move Simulation</h4>
                <p className="text-[var(--mist-100)] text-xs font-medium">Model starter home → family home → downsize to see how transaction costs compound</p>
              </div>
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <DollarSign size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Hidden Drag Calculator</h4>
                <p className="text-[var(--mist-100)] text-xs font-medium">Quantify all the costs beyond your mortgage: maintenance, property tax, HOA, closing costs</p>
              </div>
              <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <MapPin size={24} className="mb-3" />
                <h4 className="font-bold text-sm mb-2">Mobility Premium</h4>
                <p className="text-[var(--mist-100)] text-xs font-medium">Calculate the career optionality value of staying flexible vs. being locked into a property</p>
              </div>
            </div>
            <button
              onClick={onUpgrade}
              className="bg-[var(--bg-card)] text-[var(--emerald-500)] px-8 py-4 rounded-2xl font-bold hover:bg-[var(--emerald-50)] transition-all shadow-xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <Zap size={20} fill="currentColor" />
              Upgrade to Pro - $9/month
            </button>
          </div>
        </div>
      )}

      {/* PRO FEATURES: Lifecycle Housing Strategy */}
      {lifecycleAnalysis && (
        <ProGatedPreview isLocked={!isPro} toolId="rent-vs-buy">
        <div className="space-y-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-[var(--emerald-500)] text-white p-3 rounded-2xl">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[var(--text-primary)]">Lifecycle Housing Strategy</h3>
              <p className="text-[var(--text-tertiary)] font-medium">Long-term wealth impact across multiple life stages</p>
            </div>
          </div>

          {/* Multi-Move Friction Analysis */}
          <div className="bg-gradient-to-br from-[var(--crimson-500)] to-[var(--emerald-500)] rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--bg-card)]/20 p-3 rounded-2xl backdrop-blur-sm">
                <Repeat size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold mb-3">The 3-Move Reality</h4>
                <p className="text-[var(--crimson-50)] font-medium text-lg leading-relaxed mb-6">
                  Most people don't buy one house and stay forever. Let's model a realistic lifecycle:
                </p>
                <div className="space-y-3 mb-6">
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">Move 1: Starter Home (Years 0-7)</span>
                      <span className="text-sm">{formatCurrency(purchasePrice * 0.7)}</span>
                    </div>
                    <p className="text-[var(--crimson-100)] text-xs">2BR condo or small house to get started</p>
                  </div>
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">Move 2: Family Home (Years 7-22)</span>
                      <span className="text-sm">{formatCurrency(purchasePrice)}</span>
                    </div>
                    <p className="text-[var(--crimson-100)] text-xs">Upgrade for kids, schools, space</p>
                  </div>
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold">Move 3: Downsize (Years 22-30)</span>
                      <span className="text-sm">{formatCurrency(purchasePrice * 0.6)}</span>
                    </div>
                    <p className="text-[var(--crimson-100)] text-xs">Empty nest, lower maintenance</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-[var(--crimson-100)] text-sm font-bold mb-2">Total Transaction Friction</p>
                    <p className="text-4xl font-bold">{formatCurrency(lifecycleAnalysis.moves.transactionCosts)}</p>
                    <p className="text-[var(--crimson-100)] text-xs font-medium mt-2">
                      Closing costs + realtor fees across 3 purchases and 2 sales
                    </p>
                  </div>
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-[var(--crimson-100)] text-sm font-bold mb-2">vs. Single Home</p>
                    <p className="text-4xl font-bold">{formatCurrency(lifecycleAnalysis.moves.singleHomeTransactionCost)}</p>
                    <p className="text-[var(--crimson-100)] text-xs font-medium mt-2">
                      Extra friction cost: {formatCurrency(lifecycleAnalysis.moves.extraFriction)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-sm font-bold text-[var(--crimson-100)] mb-2">CORTEX INSIGHT</p>
              <p className="font-medium text-white">
                Over 3 expected moves, renting preserves {formatCurrency(lifecycleAnalysis.moves.extraFriction + nwDiff)} more wealth due to transaction costs and mobility value—even with "wasted" rent.
              </p>
            </div>
          </div>

          {/* Hidden Drag Calculator */}
          <div className="bg-[var(--bg-card)] rounded-[3rem] p-10 border border-[var(--border-default)] shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--color-warning-soft)] text-[var(--color-warning)] p-3 rounded-2xl">
                <DollarSign size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-3">The Hidden Drag</h4>
                <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed mb-6">
                  Your mortgage payment is just the beginning. Here are ALL the costs of ownership over {years} years:
                </p>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-section)] rounded-xl">
                    <span className="font-bold text-[var(--text-secondary)]">Maintenance ({maintenanceRate}% annually)</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatCurrency(purchasePrice * (maintenanceRate / 100) * years)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-section)] rounded-xl">
                    <span className="font-bold text-[var(--text-secondary)]">Property Tax ({propertyTax}% annually)</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatCurrency(purchasePrice * (propertyTax / 100) * years)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-section)] rounded-xl">
                    <span className="font-bold text-[var(--text-secondary)]">Insurance (0.5% annually)</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatCurrency(purchasePrice * 0.005 * years)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-section)] rounded-xl">
                    <span className="font-bold text-[var(--text-secondary)]">HOA/Condo Fees (est.)</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatCurrency(3600 * years)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-section)] rounded-xl">
                    <span className="font-bold text-[var(--text-secondary)]">Closing Costs ({buyingCosts}%)</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatCurrency(purchasePrice * (buyingCosts / 100))}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[var(--bg-section)] rounded-xl">
                    <span className="font-bold text-[var(--text-secondary)]">Future Selling Costs ({sellingCosts}%)</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatCurrency(currentYearData.homeValue * (sellingCosts / 100))}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[var(--color-warning-soft)] to-[var(--crimson-100)] rounded-xl border-2 border-[var(--color-warning-soft)]">
                    <span className="font-bold text-[var(--text-primary)] text-lg">Total Hidden Drag</span>
                    <span className="font-bold text-[var(--color-warning)] text-2xl">{formatCurrency(lifecycleAnalysis.totalHiddenCosts)}</span>
                  </div>
                </div>
                <div className="bg-[var(--color-warning-soft)] rounded-2xl p-6 border border-[var(--color-warning-soft)]">
                  <p className="text-[var(--color-warning)] text-sm font-bold mb-2">Monthly Hidden Drag</p>
                  <p className="text-4xl font-bold text-[var(--text-primary)]">{formatCurrency(lifecycleAnalysis.monthlyHiddenDrag)}/mo</p>
                  <p className="text-[var(--text-tertiary)] text-xs font-medium mt-2">
                    This is ON TOP of your {formatCurrency((purchasePrice - (purchasePrice * downPaymentPct / 100)) * (mortgageRate / 100 / 12))} monthly mortgage payment
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobility Premium */}
          <div className="bg-gradient-to-br from-[var(--emerald-500)] to-[var(--color-info)] rounded-[3rem] p-10 text-white shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--bg-card)]/20 p-3 rounded-2xl backdrop-blur-sm">
                <MapPin size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold mb-3">The Mobility Premium</h4>
                <p className="text-[var(--emerald-50)] font-medium text-lg leading-relaxed mb-6">
                  Renting isn't just flexibility—it's career optionality with real dollar value.
                </p>
                <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-6">
                  <h5 className="font-bold mb-4">Real-World Scenario:</h5>
                  <ul className="space-y-3 text-[var(--emerald-50)]">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--emerald-400)] mt-2 shrink-0"></div>
                      <span>Year 3: Dream job offer in another city with 15% raise</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--emerald-400)] mt-2 shrink-0"></div>
                      <span>Homeowner: Sell (lose 8% to transaction costs) or rent out (become landlord)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--emerald-400)] mt-2 shrink-0"></div>
                      <span>Renter: Give 30 days notice, take the job, increase income immediately</span>
                    </li>
                  </ul>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-[var(--emerald-100)] text-sm font-bold mb-2">Standard Rent Net Worth</p>
                    <p className="text-4xl font-bold">{formatCurrency(currentYearData.rentNetWorth)}</p>
                  </div>
                  <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <p className="text-[var(--emerald-100)] text-sm font-bold mb-2">Mobility-Adjusted Value</p>
                    <p className="text-4xl font-bold">{formatCurrency(lifecycleAnalysis.mobilityAdjustedRentNW)}</p>
                    <p className="text-[var(--emerald-100)] text-xs font-medium mt-2">
                      +{formatCurrency(lifecycleAnalysis.mobilityPremium)} opportunity value
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[var(--bg-card)]/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <p className="text-sm font-bold text-[var(--emerald-100)] mb-2">CORTEX INSIGHT</p>
              <p className="font-medium text-white">
                Career mobility has quantifiable value. Being locked into a property when a life-changing opportunity appears has a real cost that traditional rent vs. buy calculators ignore.
              </p>
            </div>
          </div>

          {/* Market Timing Risk */}
          <div className="bg-[var(--bg-card)] rounded-[3rem] p-10 border border-[var(--border-default)] shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-[var(--emerald-100)] text-[var(--emerald-500)] p-3 rounded-2xl">
                <TrendingUp size={32} />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Market Timing Scenarios</h4>
                <p className="text-[var(--text-secondary)] font-medium text-lg leading-relaxed mb-6">
                  Housing markets fluctuate. Here's your outcome range based on historical data:
                </p>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[var(--text-tertiary)]">Best Case (Buy at Bottom)</span>
                      <span className="text-lg font-bold text-[var(--emerald-500)]">{formatCurrency(lifecycleAnalysis.bestCase)}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-glass)] rounded-full h-3">
                      <div className="h-3 bg-gradient-to-r from-[var(--emerald-400)] to-[var(--emerald-600)] rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[var(--text-tertiary)]">Your Scenario (Current Inputs)</span>
                      <span className="text-lg font-bold text-[var(--emerald-500)]">{formatCurrency(currentYearData.buyNetWorth)}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-glass)] rounded-full h-3">
                      <div className="h-3 bg-gradient-to-r from-[var(--emerald-400)] to-[var(--emerald-500)] rounded-full" style={{ width: '80%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[var(--text-tertiary)]">Worst Case (Buy at Peak)</span>
                      <span className="text-lg font-bold text-[var(--crimson-500)]">{formatCurrency(lifecycleAnalysis.worstCase)}</span>
                    </div>
                    <div className="w-full bg-[var(--bg-glass)] rounded-full h-3">
                      <div className="h-3 bg-gradient-to-r from-[var(--crimson-400)] to-[var(--crimson-500)] rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--color-warning-soft)] rounded-2xl p-6 border border-[var(--glass-border-strong)] mt-6">
                  <p className="text-[var(--color-warning)] text-sm font-bold mb-2">Market Timing Risk</p>
                  <p className="text-4xl font-bold text-[var(--text-primary)] mb-2">{formatCurrency(lifecycleAnalysis.marketTimingRisk)}</p>
                  <p className="text-[var(--text-secondary)] text-sm font-medium">
                    The spread between buying at the right time vs. the wrong time. Renters are insulated from this volatility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </ProGatedPreview>
      )}

      {/* Footer Note */}
      <footer className="pt-8 border-t border-[var(--border-default)] text-center">
        <div className="inline-flex items-center gap-2 text-[var(--text-muted)] text-xs">
          <Info size={14} />
          <span>This is a simulation, not financial advice. Tax benefits (SALT, Mortgage Interest Deduction) vary by bracket and jurisdiction.</span>
        </div>
      </footer>
      {!isPro && <ProUpsellCard toolId="rent-vs-buy" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
