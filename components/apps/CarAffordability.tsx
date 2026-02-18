"use client";

import React, { useState, useMemo } from 'react';
import { Car, DollarSign, Calendar, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';

/**
 * Car Affordability Calculator (20/3/8 Rule)
 *
 * The 20/3/8 rule suggests:
 * - 20% down payment
 * - 3 year (36 month) loan term
 * - 8% of pre-tax income for monthly payment
 */

interface CarAffordabilityProps {
  isPro?: boolean;
  onUpgrade?: () => void;
  isLoggedIn?: boolean;
}

export default function CarAffordability({ isLoggedIn = false, onUpgrade }: CarAffordabilityProps) {
  const [inputs, setInputs] = useState({
    annualIncome: 150000,
    interestRate: 4.0,
    currentMonthlyPayment: 0,
    downPaymentPercent: 44
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Calculate car affordability based on 20/3/8 rule
  const calculations = useMemo(() => {
    const monthlyIncome = inputs.annualIncome / 12;
    const maxMonthlyPayment = monthlyIncome * 0.08; // 8% of pre-tax income

    // Calculate max car price based on 3-year loan at given interest rate
    const monthlyRate = inputs.interestRate / 100 / 12;
    const numPayments = 36; // 3 years

    // Loan amount using standard loan payment formula: P = M * [(1 - (1 + r)^-n) / r]
    let maxLoanAmount = 0;
    if (monthlyRate === 0) {
      maxLoanAmount = maxMonthlyPayment * numPayments;
    } else {
      maxLoanAmount = maxMonthlyPayment * ((1 - Math.pow(1 + monthlyRate, -numPayments)) / monthlyRate);
    }

    // Total car price = loan amount / 0.8 (since 20% down payment)
    const maxCarPrice = maxLoanAmount / 0.8;
    const recommendedDownPayment = maxCarPrice * 0.20;

    // Calculate user's actual down payment amount
    const userDownPaymentAmount = maxCarPrice * (inputs.downPaymentPercent / 100);
    const userLoanAmount = maxCarPrice - userDownPaymentAmount;

    // Calculate user's monthly payment with their down payment percentage
    let userMonthlyPayment = 0;
    if (monthlyRate === 0) {
      userMonthlyPayment = userLoanAmount / numPayments;
    } else {
      userMonthlyPayment = userLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
    }

    // Calculate total interest paid over the loan
    const totalPaid = userMonthlyPayment * numPayments;
    const totalInterest = totalPaid - userLoanAmount;

    // Check compliance with 20/3/8 rule
    const meetsDownPaymentRule = inputs.downPaymentPercent >= 20;
    const meetsPaymentRule = userMonthlyPayment <= maxMonthlyPayment;
    const meetsAllRules = meetsDownPaymentRule && meetsPaymentRule;

    return {
      maxCarPrice,
      maxMonthlyPayment,
      recommendedDownPayment,
      userDownPaymentAmount,
      userLoanAmount,
      userMonthlyPayment,
      totalInterest,
      totalPaid,
      meetsDownPaymentRule,
      meetsPaymentRule,
      meetsAllRules
    };
  }, [inputs]);

  return (
    <div className="space-y-8">
      {/* Save Scenario */}
      <div className="flex justify-end mb-4">
        <SaveScenarioButton
          toolId="car-affordability"
          toolName="Car Affordability Calculator"
          getInputs={() => inputs}
          getKeyResult={() => `Max car: $${Math.round(calculations.maxCarPrice).toLocaleString()}`}
          isLoggedIn={isLoggedIn}
          onLoginPrompt={onUpgrade}
        />
      </div>

      {/* RULE EXPLANATION BANNER */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-[2.5rem] p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <AlertCircle className="text-blue-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-blue-900 mb-2">The 20/3/8 Car-Buying Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-2">
                <div className="font-black text-3xl text-blue-600">20%</div>
                <div className="text-blue-700 font-medium mt-1">
                  <div className="font-bold">Down Payment</div>
                  Put at least 20% down to reduce loan amount
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="font-black text-3xl text-blue-600">3</div>
                <div className="text-blue-700 font-medium mt-1">
                  <div className="font-bold">Years to Pay Off</div>
                  Finance for no more than 36 months
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="font-black text-3xl text-blue-600">8%</div>
                <div className="text-blue-700 font-medium mt-1">
                  <div className="font-bold">of Pre-Tax Income</div>
                  Monthly payment should not exceed 8% of gross income
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN - INPUTS */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-200 shadow-sm">
            <h3 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
              <DollarSign className="text-indigo-600" size={28} />
              Your Financial Info
            </h3>

            <div className="space-y-6">
              {/* Annual Gross Income */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Annual Gross Income</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    name="annualIncome"
                    value={inputs.annualIncome}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Your total annual income before taxes</p>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Interest Rate</label>
                <div className="relative">
                  <input
                    type="number"
                    name="interestRate"
                    value={inputs.interestRate}
                    onChange={handleInputChange}
                    step="0.1"
                    className="w-full pr-8 pl-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Expected auto loan APR</p>
              </div>

              {/* Current Monthly Car Payment */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Current Monthly Car Payments</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    name="currentMonthlyPayment"
                    value={inputs.currentMonthlyPayment}
                    onChange={handleInputChange}
                    className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-2xl font-bold text-slate-900 focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">Any existing car loan payments (optional)</p>
              </div>

              {/* Down Payment Percentage Slider */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Down Payment: <span className="text-indigo-600">{inputs.downPaymentPercent}%</span>
                </label>
                <input
                  type="range"
                  name="downPaymentPercent"
                  min="0"
                  max="100"
                  step="1"
                  value={inputs.downPaymentPercent}
                  onChange={handleInputChange}
                  className="w-full h-3 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
                  style={{
                    background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${inputs.downPaymentPercent}%, #e2e8f0 ${inputs.downPaymentPercent}%, #e2e8f0 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1 font-medium">
                  <span>0%</span>
                  <span className={inputs.downPaymentPercent >= 20 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                    {inputs.downPaymentPercent >= 20 ? '✓ Meets 20% rule' : '⚠ Below 20% recommended'}
                  </span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - RESULTS */}
        <div className="space-y-6">
          {/* Main Result - Affordable Car Price */}
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[3rem] p-10 text-white shadow-2xl border-2 border-indigo-500">
            <div className="flex items-center gap-3 mb-4">
              <Car className="text-indigo-200" size={32} />
              <h3 className="text-xl font-black tracking-tight">Maximum Car Price</h3>
            </div>
            <div className="text-6xl font-black mb-2 tracking-tight">
              ${calculations.maxCarPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-indigo-100 font-medium text-sm">
              This is how much car you can afford without going broke!
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Down Payment ({inputs.downPaymentPercent}%)</div>
              <div className="text-2xl font-black text-slate-900">
                ${calculations.userDownPaymentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Loan Amount</div>
              <div className="text-2xl font-black text-slate-900">
                ${calculations.userLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-2xl font-black text-slate-900">
                ${calculations.userMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">
                Max: ${calculations.maxMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Interest</div>
              <div className="text-2xl font-black text-slate-900">
                ${calculations.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-slate-500 font-medium mt-1">Over 3 years</div>
            </div>
          </div>

          {/* Rule Compliance Status */}
          <div className={`rounded-2xl p-6 border-2 ${
            calculations.meetsAllRules
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {calculations.meetsAllRules ? (
                <CheckCircle className="text-emerald-600" size={24} />
              ) : (
                <AlertCircle className="text-amber-600" size={24} />
              )}
              <div>
                <h4 className={`font-black text-lg mb-2 ${
                  calculations.meetsAllRules ? 'text-emerald-900' : 'text-amber-900'
                }`}>
                  {calculations.meetsAllRules ? '20/3/8 Rule Status: PASS' : '20/3/8 Rule Status: WARNING'}
                </h4>
                <div className="space-y-2 text-sm font-medium">
                  <div className={`flex items-center gap-2 ${
                    calculations.meetsDownPaymentRule ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    <span>{calculations.meetsDownPaymentRule ? '✓' : '⚠'}</span>
                    <span>Down payment: {inputs.downPaymentPercent}% {calculations.meetsDownPaymentRule ? '(meets 20% minimum)' : '(below 20% recommended)'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700">
                    <span>✓</span>
                    <span>Loan term: 3 years (36 months)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${
                    calculations.meetsPaymentRule ? 'text-emerald-700' : 'text-amber-700'
                  }`}>
                    <span>{calculations.meetsPaymentRule ? '✓' : '⚠'}</span>
                    <span>
                      Monthly payment: {((calculations.userMonthlyPayment / (inputs.annualIncome / 12)) * 100).toFixed(1)}% of income
                      {calculations.meetsPaymentRule ? ' (under 8%)' : ' (exceeds 8%)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-slate-50 rounded-[2.5rem] p-8 border-2 border-slate-200">
        <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-3">
          <Calendar className="text-slate-600" size={24} />
          Loan Summary (3-Year Term)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Paid</div>
            <div className="text-2xl font-black text-slate-900">
              ${calculations.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Principal</div>
            <div className="text-2xl font-black text-slate-900">
              ${calculations.userLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interest</div>
            <div className="text-2xl font-black text-slate-900">
              ${calculations.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">APR</div>
            <div className="text-2xl font-black text-slate-900">{inputs.interestRate}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
