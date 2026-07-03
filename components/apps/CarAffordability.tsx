"use client";

import React, { useState, useMemo } from 'react';
import { Car, DollarSign, Calendar, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react';
import SaveScenarioButton from './SaveScenarioButton';
import NumberInput from '@/components/ui/NumberInput';
import ProUpsellCard from '@/components/monetization/ProUpsellCard';

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
  initialValues?: Record<string, unknown>;
}

export default function CarAffordability({ isPro = false, isLoggedIn = false, onUpgrade, initialValues }: CarAffordabilityProps) {
  const [inputs, setInputs] = useState({
    annualIncome: 150000,
    interestRate: 4.0,
    currentMonthlyPayment: 0,
    downPaymentPercent: 20, // default to the 20/3/8 rule's recommended 20%
    ...(initialValues || {}),
  });

  // Used by the down-payment range slider; numeric fields use <NumberInput>.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Calculate car affordability based on 20/3/8 rule
  const calculations = useMemo(() => {
    const monthlyIncome = inputs.annualIncome / 12;
    // 8% of pre-tax income, minus payments on any existing car loan
    const maxMonthlyPayment = Math.max(0, monthlyIncome * 0.08 - inputs.currentMonthlyPayment);

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

    // Total car price the budget supports at the user's actual down payment %
    // (a bigger down payment supports a more expensive car for the same loan).
    // Capped at 80% down — beyond that the price is dominated by cash on hand,
    // not the payment budget, and the formula diverges.
    const downPaymentPercent = Math.min(80, Math.max(0, inputs.downPaymentPercent));
    const downPaymentFraction = downPaymentPercent / 100;
    const maxCarPrice = maxLoanAmount / (1 - downPaymentFraction);
    const recommendedDownPayment = maxCarPrice * 0.20;

    // Calculate user's actual down payment amount
    const userDownPaymentAmount = maxCarPrice * downPaymentFraction;
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

    // The down payment is the only rule input the user can bend; the price is
    // sized so the payment lands exactly on the 8% budget over a 3-year term,
    // so there is nothing to "test" on those two dimensions.
    const meetsDownPaymentRule = downPaymentPercent >= 20;

    // Payment as a share of gross monthly income (equals the 8% cap when there
    // are no existing car payments; lower when part of the budget is used up).
    const paymentPercentOfIncome = monthlyIncome > 0 ? (userMonthlyPayment / monthlyIncome) * 100 : 0;

    return {
      maxCarPrice,
      maxMonthlyPayment,
      recommendedDownPayment,
      userDownPaymentAmount,
      userLoanAmount,
      userMonthlyPayment,
      totalInterest,
      totalPaid,
      downPaymentPercent,
      meetsDownPaymentRule,
      paymentPercentOfIncome
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
      <div className="bg-[var(--color-info-soft)] border border-[var(--color-info-soft)] rounded-xl p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[var(--color-info-soft)] rounded-lg">
            <AlertCircle className="text-[var(--color-info)]" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[var(--color-info)] mb-2">The 20/3/8 Car-Buying Rule</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div className="flex items-start gap-2">
                <div className="font-bold text-3xl text-[var(--color-info)]">20%</div>
                <div className="text-[var(--color-info)] font-medium mt-1">
                  <div className="font-bold">Down Payment</div>
                  Put at least 20% down to reduce loan amount
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="font-bold text-3xl text-[var(--color-info)]">3</div>
                <div className="text-[var(--color-info)] font-medium mt-1">
                  <div className="font-bold">Years to Pay Off</div>
                  Finance for no more than 36 months
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="font-bold text-3xl text-[var(--color-info)]">8%</div>
                <div className="text-[var(--color-info)] font-medium mt-1">
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
          <div className="bg-[var(--bg-card)] rounded-xl p-8 border border-[var(--border-default)] shadow-[var(--shadow-card)]">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
              <DollarSign className="text-[var(--navy)]" size={28} />
              Your Financial Info
            </h3>

            <div className="space-y-6">
              {/* Annual Gross Income */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Annual Gross Income</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">$</span>
                  <NumberInput
                    name="annualIncome"
                    value={inputs.annualIncome}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, annualIncome: n }))}
                    min={0}
                    className="w-full pl-8 pr-4 py-3 border border-[var(--border-default)] rounded-sm font-bold text-[var(--text-primary)] focus:border-[var(--sky)] focus:ring-2 focus:ring-[var(--sky)] focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">Your total annual income before taxes</p>
              </div>

              {/* Interest Rate */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Interest Rate</label>
                <div className="relative">
                  <NumberInput
                    name="interestRate"
                    value={inputs.interestRate}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, interestRate: n }))}
                    step="0.1"
                    className="w-full pr-8 pl-4 py-3 border border-[var(--border-default)] rounded-sm font-bold text-[var(--text-primary)] focus:border-[var(--sky)] focus:ring-2 focus:ring-[var(--sky)] focus:outline-none transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">%</span>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">Expected auto loan APR</p>
              </div>

              {/* Current Monthly Car Payment */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Current Monthly Car Payments</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold">$</span>
                  <NumberInput
                    name="currentMonthlyPayment"
                    value={inputs.currentMonthlyPayment}
                    onValueChange={(n) => setInputs(prev => ({ ...prev, currentMonthlyPayment: n }))}
                    min={0}
                    className="w-full pl-8 pr-4 py-3 border border-[var(--border-default)] rounded-sm font-bold text-[var(--text-primary)] focus:border-[var(--sky)] focus:ring-2 focus:ring-[var(--sky)] focus:outline-none transition-colors"
                  />
                </div>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">Any existing car loan payments (optional)</p>
              </div>

              {/* Down Payment Percentage Slider */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">
                  Down Payment: <span className="text-[var(--navy)]">{calculations.downPaymentPercent}%</span>
                </label>
                <input
                  type="range"
                  name="downPaymentPercent"
                  min="0"
                  max="80"
                  step="1"
                  value={calculations.downPaymentPercent}
                  onChange={handleInputChange}
                  className="mgm-range"
                  style={{
                    background: `linear-gradient(to right, var(--navy) 0%, var(--navy) ${(calculations.downPaymentPercent / 80) * 100}%, var(--off-white) ${(calculations.downPaymentPercent / 80) * 100}%, var(--off-white) 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1 font-medium">
                  <span>0%</span>
                  <span className={calculations.meetsDownPaymentRule ? 'text-[var(--emerald-500)] font-bold' : 'text-[var(--color-warning)] font-bold'}>
                    {calculations.meetsDownPaymentRule ? '✓ Meets 20% rule' : '⚠ Below 20% recommended'}
                  </span>
                  <span>80%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - RESULTS */}
        <div className="space-y-6">
          {/* Main Result - Affordable Car Price */}
          <div className="mgm-band rounded-xl p-10 text-white shadow-[var(--shadow-elevated)]">
            <div className="flex items-center gap-3 mb-4">
              <Car className="text-[var(--mist-200)]" size={32} />
              <h3 className="text-xl font-bold tracking-tight">Maximum Car Price</h3>
            </div>
            <div className="text-6xl font-bold mb-2 tracking-tight">
              ${calculations.maxCarPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <p className="text-[var(--mist-100)] font-medium text-sm mb-2">
              Assumes ${calculations.userDownPaymentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} in cash down ({calculations.downPaymentPercent}%) plus a ${calculations.userLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} loan over 3 years.
            </p>
            <p className="text-[var(--mist-100)] font-medium text-xs opacity-80">
              Price is before sales tax, title, and fees, and excludes insurance and operating costs.
            </p>
          </div>

          {/* Breakdown Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-default)]">
              <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Down Payment ({calculations.downPaymentPercent}%)</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                ${calculations.userDownPaymentAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-default)]">
              <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Loan Amount</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                ${calculations.userLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-default)]">
              <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Monthly Payment</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                ${calculations.userMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] font-medium mt-1">
                Max: ${calculations.maxMonthlyPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
              </div>
            </div>

            <div className="bg-[var(--bg-card)] rounded-lg p-6 border border-[var(--border-default)]">
              <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Total Interest</div>
              <div className="text-2xl font-bold text-[var(--text-primary)]">
                ${calculations.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
              <div className="text-xs text-[var(--text-tertiary)] font-medium mt-1">Over 3 years</div>
            </div>
          </div>

          {/* How the price was sized against the 20/3/8 rule. The loan term and
              payment cap are baked into the calculation itself, so they are stated
              as facts rather than "tested" — only the down payment is a real choice. */}
          <div className={`rounded-lg p-6 border ${
            calculations.meetsDownPaymentRule
              ? 'bg-[var(--emerald-50)] border-[var(--emerald-border)]'
              : 'bg-[var(--color-warning-soft)] border-[var(--glass-border-strong)]'
          }`}>
            <div className="flex items-start gap-3 mb-4">
              {calculations.meetsDownPaymentRule ? (
                <CheckCircle className="text-[var(--emerald-500)]" size={24} />
              ) : (
                <AlertCircle className="text-[var(--color-warning)]" size={24} />
              )}
              <div>
                <h4 className={`font-bold text-lg mb-2 ${
                  calculations.meetsDownPaymentRule ? 'text-[var(--emerald-500)]' : 'text-[var(--color-warning)]'
                }`}>
                  How this price is sized to the 20/3/8 rule
                </h4>
                <div className="space-y-2 text-sm font-medium">
                  <div className={`flex items-center gap-2 ${
                    calculations.meetsDownPaymentRule ? 'text-[var(--emerald-500)]' : 'text-[var(--color-warning)]'
                  }`}>
                    <span>{calculations.meetsDownPaymentRule ? '✓' : '⚠'}</span>
                    <span>Down payment: {calculations.downPaymentPercent}% {calculations.meetsDownPaymentRule ? '(meets 20% minimum)' : '(below 20% recommended)'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--emerald-500)]">
                    <span>•</span>
                    <span>Loan term: fixed at the rule&apos;s 3 years (36 months)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[var(--emerald-500)]">
                    <span>•</span>
                    <span>
                      Monthly payment: {calculations.paymentPercentOfIncome.toFixed(1)}% of gross income — the price above is sized so the payment lands exactly on your 8% budget{inputs.currentMonthlyPayment > 0 ? ' after existing car payments' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="bg-[var(--bg-section)] rounded-xl p-8 border border-[var(--border-default)]">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-3">
          <Calendar className="text-[var(--text-secondary)]" size={24} />
          Loan Summary (3-Year Term)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Total Paid</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              ${calculations.totalPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Principal</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              ${calculations.userLoanAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Interest</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              ${calculations.totalInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">APR</div>
            <div className="text-2xl font-bold text-[var(--text-primary)]">{inputs.interestRate}%</div>
          </div>
        </div>
      </div>

      {!isPro && <ProUpsellCard toolId="car-affordability" isLoggedIn={isLoggedIn} />}
    </div>
  );
}
