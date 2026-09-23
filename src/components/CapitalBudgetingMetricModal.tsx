import React, { useEffect, useState } from 'react';
import { FeasibilityProject, YearFinancials, FeasibilityMetrics } from '../types';
import { formatCurrency } from '../utils/financialCalculations';
import {
  X,
  Target,
  TrendingUp,
  Clock,
  Award,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
} from 'lucide-react';

export type CapitalMetricKey = 'npv' | 'irr' | 'payback' | 'arr' | 'pi';

interface CapitalBudgetingMetricModalProps {
  metricKey: CapitalMetricKey | null;
  onClose: () => void;
  project: FeasibilityProject;
  financials: YearFinancials[];
  metrics: FeasibilityMetrics;
}

export default function CapitalBudgetingMetricModal({
  metricKey,
  onClose,
  project,
  financials,
  metrics,
}: CapitalBudgetingMetricModalProps) {
  const [activeKey, setActiveKey] = useState<CapitalMetricKey>(metricKey || 'npv');

  useEffect(() => {
    if (metricKey) {
      setActiveKey(metricKey);
    }
  }, [metricKey]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!metricKey) return null;

  const c = project.currency;
  const discountRate = project.discountRatePercent || 10;
  const initialOutlay = metrics.totalInitialInvestment || 0;
  const years5 = financials && financials.length > 1 ? financials.slice(1) : [];
  const avgNetIncome = years5.length > 0 ? years5.reduce((sum, y) => sum + y.netIncome, 0) / years5.length : 0;

  // Metric details generator
  const getMetricData = (key: CapitalMetricKey) => {
    switch (key) {
      case 'npv': {
        const isPositive = metrics.npv > 0;
        return {
          key: 'npv',
          title: 'Net Present Value (NPV)',
          subtitle: 'Discounted Cash Flow Valuation & Wealth Addition',
          icon: Target,
          colorTheme: isPositive ? 'indigo' : 'amber',
          amountDisplay: formatCurrency(metrics.npv, c),
          statusBadge: isPositive ? 'NPV > 0 (Financially Acceptable)' : 'NPV ≤ 0 (Deficit / Reject)',
          statusPositive: isPositive,
          formula: 'NPV = ∑ [ CFₜ / (1 + r)ᵗ ] − Initial Outlay',
          formulaDescription: 'Sums all annual net cash flows discounted at the required hurdle rate (r) and subtracts the project startup capital.',
          shortDescription:
            'Net Present Value (NPV) is the definitive gold standard in capital budgeting. It measures the net monetary wealth created by the business in today’s purchasing power, discounted at the required rate of return (' +
            discountRate +
            '%), after completely repaying the initial capital investment.',
          whatNumberSignifies: [
            {
              heading: 'Economic Wealth Generated',
              text: isPositive
                ? `The positive amount of ${formatCurrency(metrics.npv, c)} signifies that the project generates ${formatCurrency(metrics.npv, c)} in net surplus wealth above and beyond recovering the ${formatCurrency(initialOutlay, c)} initial startup capital and exceeding the required ${discountRate}% hurdle rate.`
                : `The amount of ${formatCurrency(metrics.npv, c)} indicates that the project fails to earn the required ${discountRate}% discount rate, generating an economic shortfall over the 5-year operating horizon.`,
            },
            {
              heading: 'Covering Capital Financing Costs',
              text: `This amount signifies that after fully servicing bank loan interest and delivering the expected return to equity partners at ${discountRate}%, the venture leaves an unencumbered equity surplus for enterprise expansion.`,
            },
            {
              heading: 'Decision Rule & Thesis Defense',
              text: isPositive
                ? 'Decision Rule: Accept the project (NPV > 0). An investment with positive NPV adds real enterprise value and protects shareholder capital.'
                : 'Decision Rule: Re-evaluate pricing, lower variable costs, or optimize initial capital expenditure to achieve a positive NPV.',
            },
          ],
          keyFacts: [
            { label: 'Discount / Hurdle Rate', value: `${discountRate}%` },
            { label: 'Total Initial Outlay', value: formatCurrency(initialOutlay, c) },
            { label: '5-Year Cumulative Cash Flow', value: formatCurrency(years5.reduce((s, y) => s + y.operatingCashFlow, 0), c) },
            { label: 'Verdict', value: isPositive ? 'Value Accretive' : 'Value Dilutive' },
          ],
        };
      }

      case 'irr': {
        const exceedsHurdle = metrics.irr >= discountRate;
        const spread = metrics.irr - discountRate;
        return {
          key: 'irr',
          title: 'Internal Rate of Return (IRR)',
          subtitle: 'Annualized Compound Yield on Invested Capital',
          icon: TrendingUp,
          colorTheme: exceedsHurdle ? 'emerald' : 'amber',
          amountDisplay: `${metrics.irr.toFixed(1)}%`,
          statusBadge: exceedsHurdle
            ? `IRR (${metrics.irr.toFixed(1)}%) ≥ Hurdle Rate (${discountRate}%)`
            : `IRR (${metrics.irr.toFixed(1)}%) < Hurdle Rate (${discountRate}%)`,
          statusPositive: exceedsHurdle,
          formula: '0 = ∑ [ CFₜ / (1 + IRR)ᵗ ] − Initial Outlay',
          formulaDescription: 'The exact discount rate that brings the Net Present Value of all operating cash flows to zero.',
          shortDescription:
            'Internal Rate of Return (IRR) is the effective annualized compounded rate of return earned on each invested currency unit over the projection period. It indicates the break-even borrowing rate or maximum financing cost the project can endure before turning unprofitable.',
          whatNumberSignifies: [
            {
              heading: 'Annualized Compound Yield',
              text: `The rate of ${metrics.irr.toFixed(1)}% signifies that every peso invested in the business compounds at an average annual effective return of ${metrics.irr.toFixed(1)}% across the 5-year operating life.`,
            },
            {
              heading: 'Spread Over Cost of Capital',
              text: exceedsHurdle
                ? `Because ${metrics.irr.toFixed(1)}% exceeds the required hurdle rate of ${discountRate}%, the venture provides a healthy safety spread of +${spread.toFixed(1)} percentage points. This margin insulates the project against adverse shifts in inflation or loan interest rates.`
                : `The project return of ${metrics.irr.toFixed(1)}% is ${Math.abs(spread).toFixed(1)}% below the ${discountRate}% hurdle rate, indicating insufficient margin of return for the business risk profile.`,
            },
            {
              heading: 'Decision Rule & Thesis Defense',
              text: exceedsHurdle
                ? `Decision Rule: Accept the project (IRR ≥ ${discountRate}%). The business generates superior yields compared to standard commercial banking benchmarks and alternative investments.`
                : `Decision Rule: Review unit margins or volume projections to elevate IRR above the ${discountRate}% threshold.`,
            },
          ],
          keyFacts: [
            { label: 'Required Hurdle Rate', value: `${discountRate}%` },
            { label: 'IRR Spread vs Hurdle', value: `${spread >= 0 ? '+' : ''}${spread.toFixed(1)}%` },
            { label: 'Break-Even Discount Rate', value: `${metrics.irr.toFixed(1)}%` },
            { label: 'Capital Efficiency', value: exceedsHurdle ? 'High Return' : 'Sub-Hurdle' },
          ],
        };
      }

      case 'payback': {
        const isQuick = metrics.paybackPeriodYears <= 3.5;
        const yearsInt = Math.floor(metrics.paybackPeriodYears);
        const monthsInt = Math.round((metrics.paybackPeriodYears % 1) * 12);
        return {
          key: 'payback',
          title: 'Payback Period',
          subtitle: 'Capital Liquidity Timeline & Risk Exposure Window',
          icon: Clock,
          colorTheme: isQuick ? 'amber' : 'blue',
          amountDisplay: `${metrics.paybackPeriodYears.toFixed(2)} Years`,
          statusBadge: `${metrics.paybackPeriodYears.toFixed(2)} Yrs (Discounted: ${metrics.discountedPaybackPeriodYears.toFixed(2)} Yrs)`,
          statusPositive: isQuick,
          formula: 'Payback = Full Years Before Recovery + (Unrecovered Cost at Start of Year ÷ Cash Flow During Year)',
          formulaDescription: 'The time required for cumulative nominal and discounted cash inflows to equal the initial investment.',
          shortDescription:
            'The Payback Period measures the operational duration required to completely recoup the initial startup capital investment. It is the primary indicator of capital liquidity, operational turnaround speed, and exposure to early-stage venture risk.',
          whatNumberSignifies: [
            {
              heading: 'Capital Recoupment Timeline',
              text: `The number ${metrics.paybackPeriodYears.toFixed(2)} Years signifies that the venture will fully recover its ${formatCurrency(initialOutlay, c)} initial capital in approximately ${yearsInt} year(s) and ${monthsInt} month(s) of regular commercial operation.`,
            },
            {
              heading: 'Time Value Adjusted Recovery',
              text: `When accounting for the ${discountRate}% time value of money, the Discounted Payback Period is ${metrics.discountedPaybackPeriodYears.toFixed(2)} Years. Achieving complete discounted recovery within 5 years confirms that investors recover real purchasing power early.`,
            },
            {
              heading: 'Risk Mitigation Significance',
              text: 'A rapid payback period minimizes financial exposure to market volatility, competitive pressures, and technological obsolescence. After payback is reached, all subsequent operating cash flows represent risk-free cash accumulation for equity partners.',
            },
          ],
          keyFacts: [
            { label: 'Nominal Payback', value: `${metrics.paybackPeriodYears.toFixed(2)} Years` },
            { label: 'Discounted Payback', value: `${metrics.discountedPaybackPeriodYears.toFixed(2)} Years` },
            { label: 'Initial Outlay Recouped', value: formatCurrency(initialOutlay, c) },
            { label: 'Recovery Assessment', value: metrics.paybackPeriodYears < 3 ? 'Rapid Turnaround' : 'Moderate Turnaround' },
          ],
        };
      }

      case 'arr': {
        const isStrong = metrics.accountingRateOfReturn >= 20;
        return {
          key: 'arr',
          title: 'Accounting Rate of Return (ARR / ROI)',
          subtitle: 'Accrual Accounting Profitability on Capital Employed',
          icon: Award,
          colorTheme: isStrong ? 'blue' : 'indigo',
          amountDisplay: `${metrics.accountingRateOfReturn.toFixed(1)}%`,
          statusBadge: `ARR: ${metrics.accountingRateOfReturn.toFixed(1)}% (Average Annual Net Profit / Outlay)`,
          statusPositive: isStrong,
          formula: 'ARR = (Average Annual Net Income ÷ Initial Investment Outlay) × 100',
          formulaDescription: 'Calculated using audited accrual accounting net income after deducting non-cash depreciation and income taxes.',
          shortDescription:
            'Accounting Rate of Return (ARR) assesses project performance from the perspective of standard financial accounting and financial statement presentation. It relates average annual book profit after depreciation and taxes to the initial capital outlay.',
          whatNumberSignifies: [
            {
              heading: 'Accounting Book Profit Yield',
              text: `The rate of ${metrics.accountingRateOfReturn.toFixed(1)}% signifies that for every ₱100 invested in initial capital, the company yields an average annual accounting net profit of ₱${metrics.accountingRateOfReturn.toFixed(1)} per year across the 5-year projection period.`,
            },
            {
              heading: 'Annual Net Income Output',
              text: `This signifies that the venture generates an average bottom-line profit of ${formatCurrency(avgNetIncome, c)} annually after paying all production expenses, administrative overhead, equipment depreciation, and corporate income taxes.`,
            },
            {
              heading: 'Financial Audit & Ratio Impact',
              text: 'High ARR directly strengthens corporate retained earnings, expands equity capitalization, and ensures strong Return on Equity (ROE) and Return on Assets (ROA) metrics on audited balance sheets.',
            },
          ],
          keyFacts: [
            { label: 'Average Annual Net Income', value: formatCurrency(avgNetIncome, c) },
            { label: 'Initial Investment Outlay', value: formatCurrency(initialOutlay, c) },
            { label: 'ARR (Accounting ROI)', value: `${metrics.accountingRateOfReturn.toFixed(1)}%` },
            { label: 'Accounting Viability', value: isStrong ? 'Highly Profitable' : 'Acceptable' },
          ],
        };
      }

      case 'pi': {
        const isAccretive = metrics.profitabilityIndex >= 1.0;
        const surplus = metrics.profitabilityIndex - 1.0;
        return {
          key: 'pi',
          title: 'Profitability Index (PI)',
          subtitle: 'Benefit-Cost Ratio & Capital Allocation Efficiency',
          icon: Zap,
          colorTheme: isAccretive ? 'purple' : 'amber',
          amountDisplay: `${metrics.profitabilityIndex.toFixed(2)}`,
          statusBadge: isAccretive
            ? `PI: ${metrics.profitabilityIndex.toFixed(2)} ≥ 1.0 (Value Accretive)`
            : `PI: ${metrics.profitabilityIndex.toFixed(2)} < 1.0 (Value Dilutive)`,
          statusPositive: isAccretive,
          formula: 'PI = Present Value of Future Cash Inflows ÷ Initial Investment Outlay',
          formulaDescription: 'Benefit-cost ratio evaluating the discounted purchasing power generated per unit of capital spent.',
          shortDescription:
            'The Profitability Index (PI), also known as the Benefit-Cost Ratio, evaluates capital efficiency under budget constraints. It calculates the present value of future cash benefits produced per unit of initial investment outlay.',
          whatNumberSignifies: [
            {
              heading: 'Purchasing Power Return Per Unit Capital',
              text: `The index of ${metrics.profitabilityIndex.toFixed(2)} signifies that every ₱1.00 of capital invested delivers ₱${metrics.profitabilityIndex.toFixed(2)} in discounted cash benefits over the 5-year operating period.`,
            },
            {
              heading: 'Value Creation Ratio',
              text: isAccretive
                ? `Because PI is greater than 1.0, the project creates ₱${surplus.toFixed(2)} in net surplus value per peso committed, proving superior capital productivity.`
                : 'A PI below 1.0 signifies that the present value of generated inflows does not match the invested outlay, destroying capital value.',
            },
            {
              heading: 'Decision Rule & Capital Rationing',
              text: isAccretive
                ? 'Decision Rule: Accept the project (PI ≥ 1.0). When comparing multiple projects with limited capital, ranking by Profitability Index identifies the highest value-generating ventures.'
                : 'Decision Rule: Reject or re-engineer project economics to achieve PI ≥ 1.0.',
            },
          ],
          keyFacts: [
            { label: 'Benefit-Cost Ratio', value: `${metrics.profitabilityIndex.toFixed(2)}x` },
            { label: 'Surplus Value / ₱1.00', value: `₱${surplus.toFixed(2)}` },
            { label: 'Discount Hurdle Used', value: `${discountRate}%` },
            { label: 'Capital Ranking', value: isAccretive ? 'Top Priority' : 'Sub-Optimal' },
          ],
        };
      }
    }
  };

  const currentData = getMetricData(activeKey);
  const IconComponent = currentData.icon;

  const metricButtons: Array<{ key: CapitalMetricKey; label: string }> = [
    { key: 'npv', label: 'Net Present Value' },
    { key: 'irr', label: 'Internal Rate of Return' },
    { key: 'payback', label: 'Payback Period' },
    { key: 'arr', label: 'Accounting ROI / ARR' },
    { key: 'pi', label: 'Profitability Index' },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="metric-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:hidden"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* MODAL HEADER */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="metric-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {currentData.title}
                </h2>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                    currentData.statusPositive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                  }`}
                >
                  {currentData.statusBadge}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">{currentData.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* METRIC QUICK SWITCHER BUTTONS */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          {metricButtons.map((btn) => {
            const isSelected = btn.key === activeKey;
            return (
              <button
                key={btn.key}
                type="button"
                id={`btn-metric-tab-${btn.key}`}
                onClick={() => setActiveKey(btn.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
                }`}
              >
                {btn.label}
              </button>
            );
          })}
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* VALUE HERO CARD */}
          <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl p-4 sm:p-5 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
                Calculated {currentData.title}
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold font-financial text-indigo-950 mt-1">
                {currentData.amountDisplay}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                {currentData.statusPositive ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span className="text-xs font-semibold text-slate-700">
                  {currentData.statusBadge}
                </span>
              </div>
            </div>

            {/* Quick Fact Grid */}
            <div className="grid grid-cols-2 gap-2 sm:min-w-[260px] bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs text-xs">
              {currentData.keyFacts.map((fact, idx) => (
                <div key={idx} className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    {fact.label}
                  </span>
                  <span className="font-bold text-slate-900 font-financial block">
                    {fact.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 1. SHORT DESCRIPTION */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Metric Description & Principle
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-8">
              {currentData.shortDescription}
            </p>
          </div>

          {/* 2. WHAT THIS NUMBER / AMOUNT SIGNIFIES */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                What This {currentData.amountDisplay} Signifies
              </h3>
            </div>

            <div className="space-y-2.5 pl-8">
              {currentData.whatNumberSignifies.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 space-y-1"
                >
                  <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{item.heading}</span>
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed pl-5">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. MATHEMATICAL FORMULA */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Mathematical Formula
              </h3>
            </div>
            <div className="bg-slate-900 text-indigo-100 p-3 rounded-xl font-mono text-xs shadow-inner space-y-1 ml-8">
              <div className="font-bold text-white">{currentData.formula}</div>
              <div className="text-[11px] text-slate-400">{currentData.formulaDescription}</div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            id="btn-close-capital-metric-modal"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close Description
          </button>
        </div>
      </div>
    </div>
  );
}
