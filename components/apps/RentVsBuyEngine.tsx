'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ReferenceLine
} from 'recharts';
import {
  TrendingUp, Home, Calculator, Settings2, Info, AlertTriangle, ShieldCheck, Landmark
} from 'lucide-react';

interface RentVsBuyEngineProps {
  isPro?: boolean;
  onUpgrade?: () => void;
}

export default function RentVsBuyEngine({ isPro, onUpgrade }: RentVsBuyEngineProps) {
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

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Controls Column */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold">
              <Calculator size={18} />
              <h2>Core Figures</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Purchase Price</label>
                <input
                  type="range" min="100000" max="2000000" step="10000"
                  value={purchasePrice} onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-1 font-mono font-medium">
                  <span>{formatCurrency(purchasePrice)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Monthly Rent</label>
                <input
                  type="range" min="500" max="10000" step="50"
                  value={monthlyRent} onChange={(e) => setMonthlyRent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <div className="flex justify-between mt-1 font-mono font-medium">
                  <span>{formatCurrency(monthlyRent)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mortgage Rate %</label>
                  <input
                    type="number" step="0.1" value={mortgageRate} onChange={(e) => setMortgageRate(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-md bg-slate-50 focus:outline-indigo-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Down Payment %</label>
                  <input
                    type="number" value={downPaymentPct} onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-md bg-slate-50 focus:outline-indigo-600"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-indigo-600 font-semibold">
              <Settings2 size={18} />
              <h2>The &quot;Reality&quot; Sliders</h2>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Maintenance Drag</label>
                  <span className="text-xs font-mono bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">{maintenanceRate}% / yr</span>
                </div>
                <input
                  type="range" min="0" max="4" step="0.1"
                  value={maintenanceRate} onChange={(e) => setMaintenanceRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">Roofs, HVAC, leaks, and time. Realtor math usually ignores this.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Alt Investment Return</label>
                  <span className="text-xs font-mono bg-green-100 text-green-700 px-1.5 py-0.5 rounded">{stockReturn}% / yr</span>
                </div>
                <input
                  type="range" min="0" max="15" step="0.5"
                  value={stockReturn} onChange={(e) => setStockReturn(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">The opportunity cost of your down payment in an S&P 500 index.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Home Appreciation</label>
                  <span className="text-xs font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{appreciationRate}% / yr</span>
                </div>
                <input
                  type="range" min="-2" max="10" step="0.1"
                  value={appreciationRate} onChange={(e) => setAppreciationRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Main Visuals Column */}
        <div className="lg:col-span-8 space-y-6">

          {/* Time Horizon Master Slider */}
          <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <TrendingUp size={120} />
            </div>

            <div className="relative z-10">
              <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-4">Select Your Time Horizon</h3>
              <input
                type="range" min="1" max="30" step="1"
                value={years} onChange={(e) => setYears(Number(e.target.value))}
                className="w-full h-4 bg-indigo-800 rounded-xl appearance-none cursor-pointer accent-white mb-6"
              />

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-indigo-300 text-xs font-semibold uppercase">Timeline</p>
                  <p className="text-3xl font-bold">{years} <span className="text-lg">Years</span></p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-indigo-300 text-xs font-semibold uppercase mb-1">The Verdict</p>
                  <div className="flex items-center gap-3">
                    <div className={`px-4 py-1 rounded-full text-lg font-black uppercase tracking-tighter ${winner === 'Buy' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800">Net Worth Trajectory</h3>
                <p className="text-xs text-slate-400">Total liquid capital + home equity minus selling costs</p>
              </div>
              <div className="flex gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-indigo-600 rounded-full"></div> Buy</div>
                <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-slate-300 rounded-full"></div> Rent</div>
              </div>
            </div>

            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={results} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="year"
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    label={{ value: 'Years', position: 'insideBottom', offset: -5, fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{fill: '#94a3b8', fontSize: 12}}
                    tickFormatter={(val) => `$${val/1000}k`}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(val: number) => formatCurrency(val)}
                  />
                  <ReferenceLine x={years} stroke="#4f46e5" strokeDasharray="3 3" />
                  <Area type="monotone" dataKey="buyNetWorth" name="Buy Net Worth" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorBuy)" />
                  <Area type="monotone" dataKey="rentNetWorth" name="Rent Portfolio" stroke="#94a3b8" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Flexibility & Risk Scorecard */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-3 text-orange-600">
                <AlertTriangle size={20} />
                <h4 className="font-bold">Mobility Risk</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Selling this home in year {years} will cost you roughly <span className="font-bold text-slate-900">{formatCurrency(currentYearData.homeValue * (sellingCosts/100))}</span> in commissions and fees.
              </p>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${years < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, years * 10)}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase">
                <span>High Friction</span>
                <span>Amortized</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 mb-3 text-indigo-600">
                <ShieldCheck size={20} />
                <h4 className="font-bold">Flexibility Score</h4>
              </div>
              <ul className="text-sm space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                  <span>{winner === 'Rent' ? 'Rent gives you liquidity to pivot careers or cities instantly.' : 'Buying provides long-term stability and a fixed housing cost.'}</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></div>
                  <span>Estimated maintenance: <span className="font-bold">{formatCurrency((currentYearData.homeValue * maintenanceRate / 100) / 12)}/mo</span> average.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Note */}
      <footer className="pt-8 border-t border-slate-200 text-center">
        <div className="inline-flex items-center gap-2 text-slate-400 text-xs">
          <Info size={14} />
          <span>This is a simulation, not financial advice. Tax benefits (SALT, Mortgage Interest Deduction) vary by bracket and jurisdiction.</span>
        </div>
      </footer>
    </div>
  );
}
