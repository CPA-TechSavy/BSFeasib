import React, { useState } from 'react';
import { FeasibilityProject, YearFinancials, FeasibilityMetrics } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import {
  Award,
  TrendingUp,
  Target,
  Clock,
  ShieldCheck,
  Zap,
  CheckCircle,
  AlertTriangle,
  Droplets,
  Scale,
  Percent,
  Activity,
  HelpCircle,
  Sparkles,
  ArrowUpDown,
} from 'lucide-react';
import BreakEvenUnitsTable from './BreakEvenUnitsTable';
import FinancialRatioDetailsModal, { RatioKey } from './FinancialRatioDetailsModal';
import CapitalBudgetingMetricModal, { CapitalMetricKey } from './CapitalBudgetingMetricModal';
import PdfDownloadButton from './PdfDownloadButton';

interface FeasibilityEvaluationViewProps {
  project: FeasibilityProject;
  financials: YearFinancials[];
  metrics: FeasibilityMetrics;
}

export default function FeasibilityEvaluationView({
  project,
  financials,
  metrics,
}: FeasibilityEvaluationViewProps) {
  const c = project.currency;
  const years5 = financials && financials.length > 1 ? financials.slice(1) : [];
  const [selectedRatioKey, setSelectedRatioKey] = useState<RatioKey | null>(null);
  const [selectedCapitalMetric, setSelectedCapitalMetric] = useState<CapitalMetricKey | null>(null);

  return (
    <div className="space-y-6 mb-6">
      {/* 1. EXECUTIVE FEASIBILITY VERDICT BANNER */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                metrics.isFeasible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              {metrics.isFeasible ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
                Feasibility Study Verdict
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                {metrics.isFeasible ? (
                  <span className="text-emerald-400 flex items-center gap-2">
                    FINANCIALLY FEASIBLE & VIABLE
                    <CheckCircle className="w-5 h-5" />
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-2">
                    REVISION / OPTIMIZATION RECOMMENDED
                  </span>
                )}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PdfDownloadButton
              targetId="all-ratio-tables-container"
              title="Comprehensive Financial Ratios & Feasibility Analysis"
              subtitle={`${project.title} • 5-Year Financial Ratio Analysis`}
              projectTitle={project.title}
              buttonText="Download All Ratios (PDF)"
              size="sm"
              variant="slate"
              orientation="landscape"
              format="a4"
            />
          </div>
        </div>

        {metrics.verdictSummary ? (
          <p className="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
            {metrics.verdictSummary}
          </p>
        ) : null}
      </section>

      {/* 2. CAPITAL BUDGETING CORE METRICS (NPV, IRR, PAYBACK, ARR, PI) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* NPV */}
        <button
          type="button"
          onClick={() => setSelectedCapitalMetric('npv')}
          className="bg-white hover:bg-indigo-50/50 rounded-xl border border-slate-200 hover:border-indigo-300 p-4 shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
          title="Click to view NPV description and what this amount signifies"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-indigo-700 transition-colors">
              Net Present Value (NPV)
            </span>
            <Target className="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 group-hover:text-indigo-950 mt-1">
            {formatCurrency(metrics.npv, c)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            {metrics.npv > 0 ? (
              <span className="text-emerald-600 font-semibold">NPV &gt; 0 (Accept Project)</span>
            ) : (
              <span className="text-red-600 font-semibold">NPV &lt; 0 (Reject Project)</span>
            )}
            <span className="text-[10px] text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Inspect ↗
            </span>
          </div>
        </button>

        {/* IRR */}
        <button
          type="button"
          onClick={() => setSelectedCapitalMetric('irr')}
          className="bg-white hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 p-4 shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
          title="Click to view IRR description and what this percentage signifies"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-emerald-700 transition-colors">
              Internal Rate of Return
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 group-hover:text-emerald-950 mt-1">
            {metrics.irr.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            {metrics.irr >= project.discountRatePercent ? (
              <span className="text-emerald-600 font-semibold">
                Exceeds {project.discountRatePercent}% Hurdle
              </span>
            ) : (
              <span className="text-red-600 font-semibold">
                Below {project.discountRatePercent}% Hurdle
              </span>
            )}
            <span className="text-[10px] text-emerald-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Inspect ↗
            </span>
          </div>
        </button>

        {/* Payback Period */}
        <button
          type="button"
          onClick={() => setSelectedCapitalMetric('payback')}
          className="bg-white hover:bg-amber-50/50 rounded-xl border border-slate-200 hover:border-amber-300 p-4 shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
          title="Click to view Payback Period description and what this timeline signifies"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-amber-700 transition-colors">
              Payback Period
            </span>
            <Clock className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 group-hover:text-amber-950 mt-1">
            {metrics.paybackPeriodYears < 5
              ? `${metrics.paybackPeriodYears.toFixed(2)} Years`
              : '> 5 Years'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Disc: {metrics.discountedPaybackPeriodYears.toFixed(2)} Yrs</span>
            <span className="text-[10px] text-amber-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Inspect ↗
            </span>
          </div>
        </button>

        {/* Accounting Rate of Return */}
        <button
          type="button"
          onClick={() => setSelectedCapitalMetric('arr')}
          className="bg-white hover:bg-blue-50/50 rounded-xl border border-slate-200 hover:border-blue-300 p-4 shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
          title="Click to view ARR description and what this return signifies"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-blue-700 transition-colors">
              Accounting ROI / ARR
            </span>
            <Award className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 group-hover:text-blue-950 mt-1">
            {metrics.accountingRateOfReturn.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            <span>Avg Net Income / Outlay</span>
            <span className="text-[10px] text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Inspect ↗
            </span>
          </div>
        </button>

        {/* Profitability Index */}
        <button
          type="button"
          onClick={() => setSelectedCapitalMetric('pi')}
          className="bg-white hover:bg-purple-50/50 rounded-xl border border-slate-200 hover:border-purple-300 p-4 shadow-sm hover:shadow-md transition-all text-left cursor-pointer group"
          title="Click to view Profitability Index description and what this ratio signifies"
        >
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider group-hover:text-purple-700 transition-colors">
              Profitability Index (PI)
            </span>
            <Zap className="w-4 h-4 text-purple-500 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-bold font-financial text-slate-900 group-hover:text-purple-950 mt-1">
            {metrics.profitabilityIndex.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
            {metrics.profitabilityIndex >= 1.0 ? (
              <span className="text-emerald-600 font-semibold">PI &gt; 1.0 (Accretive)</span>
            ) : (
              <span className="text-red-600 font-semibold">PI &lt; 1.0</span>
            )}
            <span className="text-[10px] text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Inspect ↗
            </span>
          </div>
        </button>
      </div>

      <div id="all-ratio-tables-container" className="space-y-6">
        {/* Mobile Horizontal Scroll Hint */}
        <div className="md:hidden flex items-center justify-between text-[11px] text-slate-600 bg-indigo-50/60 px-3 py-2 rounded-xl border border-indigo-100">
          <span className="flex items-center gap-1.5 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-600 rotate-90 shrink-0" />
            Swipe tables horizontally to inspect Years 1–5
          </span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full shrink-0">
            Yr 1–5 →
          </span>
        </div>

      {/* 2. BREAK-EVEN POINT (BEP) IN UNITS TABLE */}
      <BreakEvenUnitsTable project={project} financials={financials} />

      {/* 3. LIQUIDITY RATIOS */}
      <section id="table-liquidity-ratios" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Liquidity Ratios
              </h3>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Short-Term Solvency
              </span>
            </div>
          </div>
          <PdfDownloadButton
            targetId="table-liquidity-ratios"
            title="Liquidity Ratios Analysis"
            subtitle={`${project.title} • Short-Term Solvency (Years 1 to 5)`}
            projectTitle={project.title}
            buttonText="Download PDF"
            size="xs"
            variant="default"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[560px] text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                <th className="py-2.5 text-left w-1/4">Ratio / Metric</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden sm:table-cell w-1/4">Formula</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden lg:table-cell">Standard Benchmark</th>
                <th className="py-2.5 text-right font-financial">Year 1</th>
                <th className="py-2.5 text-right font-financial">Year 2</th>
                <th className="py-2.5 text-right font-financial">Year 3</th>
                <th className="py-2.5 text-right font-financial">Year 4</th>
                <th className="py-2.5 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Current Ratio */}
              <tr
                onClick={() => setSelectedRatioKey('current_ratio')}
                className="hover:bg-blue-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-blue-700 transition-colors">Current Ratio</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Total Current Assets ÷ Total Current Liabilities
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 1.50x</td>
                {years5.map((y) => {
                  const val = y.totalCurrentLiabilities > 0 ? y.totalCurrentAssets / y.totalCurrentLiabilities : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-blue-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Quick Ratio (Acid-Test Ratio) */}
              <tr
                onClick={() => setSelectedRatioKey('quick_ratio')}
                className="hover:bg-blue-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-blue-700 transition-colors">Quick Ratio (Acid-Test Ratio)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Cash + Accounts Receivable) ÷ Total Current Liabilities
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 1.00x</td>
                {years5.map((y) => {
                  const quickAssets = y.cash + y.accountsReceivable;
                  const val = y.totalCurrentLiabilities > 0 ? quickAssets / y.totalCurrentLiabilities : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-blue-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Cash Ratio */}
              <tr
                onClick={() => setSelectedRatioKey('cash_ratio')}
                className="hover:bg-blue-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-blue-700 transition-colors">Cash Ratio</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Cash & Cash Equivalents ÷ Total Current Liabilities
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 0.50x</td>
                {years5.map((y) => {
                  const val = y.totalCurrentLiabilities > 0 ? y.cash / y.totalCurrentLiabilities : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-blue-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Operating Cash Flow Ratio */}
              <tr
                onClick={() => setSelectedRatioKey('ocf_ratio')}
                className="hover:bg-blue-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-blue-700 transition-colors">Operating Cash Flow Ratio</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Operating Cash Flow ÷ Total Current Liabilities
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 1.00x</td>
                {years5.map((y) => {
                  const val = y.totalCurrentLiabilities > 0 ? y.operatingCashFlow / y.totalCurrentLiabilities : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-blue-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. LEVERAGE & SOLVENCY RATIOS */}
      <section id="table-solvency-ratios" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Leverage & Solvency Ratios
              </h3>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Capital Structure & Long-Term Solvency
              </span>
            </div>
          </div>
          <PdfDownloadButton
            targetId="table-solvency-ratios"
            title="Leverage & Solvency Ratios Analysis"
            subtitle={`${project.title} • Long-Term Solvency & Capital Structure`}
            projectTitle={project.title}
            buttonText="Download PDF"
            size="xs"
            variant="default"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[560px] text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                <th className="py-2.5 text-left w-1/4">Ratio / Metric</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden sm:table-cell w-1/4">Formula</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden lg:table-cell">Standard Benchmark</th>
                <th className="py-2.5 text-right font-financial">Year 1</th>
                <th className="py-2.5 text-right font-financial">Year 2</th>
                <th className="py-2.5 text-right font-financial">Year 3</th>
                <th className="py-2.5 text-right font-financial">Year 4</th>
                <th className="py-2.5 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Debt-to-Equity (D/E) Ratio */}
              <tr
                onClick={() => setSelectedRatioKey('debt_to_equity')}
                className="hover:bg-indigo-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-indigo-700 transition-colors">Debt-to-Equity (D/E) Ratio</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Total Liabilities ÷ Total Equity
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≤ 1.50x</td>
                {years5.map((y) => {
                  const val = y.totalEquity > 0 ? y.totalLiabilities / y.totalEquity : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-indigo-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Debt-to-Assets Ratio */}
              <tr
                onClick={() => setSelectedRatioKey('debt_to_assets')}
                className="hover:bg-indigo-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-indigo-700 transition-colors">Debt-to-Assets Ratio</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Total Liabilities ÷ Total Assets) × 100%
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≤ 50.0%</td>
                {years5.map((y) => {
                  const val = y.totalAssets > 0 ? (y.totalLiabilities / y.totalAssets) * 100 : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-indigo-950">
                      {formatPercent(val)}
                    </td>
                  );
                })}
              </tr>

              {/* Interest Coverage Ratio */}
              <tr
                onClick={() => setSelectedRatioKey('interest_coverage')}
                className="hover:bg-indigo-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-indigo-700 transition-colors">Interest Coverage Ratio</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  EBIT (Operating Income) ÷ Interest Expense
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 3.0x</td>
                {years5.map((y) => {
                  const tie = y.interestExpense > 0 ? y.ebit / y.interestExpense : null;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-indigo-950">
                      {tie !== null ? `${tie.toFixed(1)}x` : 'N/A (No Debt)'}
                    </td>
                  );
                })}
              </tr>

              {/* Equity Multiplier */}
              <tr
                onClick={() => setSelectedRatioKey('equity_multiplier')}
                className="hover:bg-indigo-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-indigo-700 transition-colors">Equity Multiplier</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Total Assets ÷ Total Equity
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≤ 2.00x</td>
                {years5.map((y) => {
                  const val = y.totalEquity > 0 ? y.totalAssets / y.totalEquity : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-indigo-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. PROFITABILITY RATIOS */}
      <section id="table-profitability-ratios" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Profitability Ratios
              </h3>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Operating Margins & Capital Returns
              </span>
            </div>
          </div>
          <PdfDownloadButton
            targetId="table-profitability-ratios"
            title="Profitability Ratios Analysis"
            subtitle={`${project.title} • Operating Margins & Capital Returns`}
            projectTitle={project.title}
            buttonText="Download PDF"
            size="xs"
            variant="default"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[560px] text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                <th className="py-2.5 text-left w-1/4">Ratio / Metric</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden sm:table-cell w-1/4">Formula</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden lg:table-cell">Standard Benchmark</th>
                <th className="py-2.5 text-right font-financial">Year 1</th>
                <th className="py-2.5 text-right font-financial">Year 2</th>
                <th className="py-2.5 text-right font-financial">Year 3</th>
                <th className="py-2.5 text-right font-financial">Year 4</th>
                <th className="py-2.5 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Gross Profit Margin */}
              <tr
                onClick={() => setSelectedRatioKey('gross_profit_margin')}
                className="hover:bg-emerald-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-emerald-700 transition-colors">Gross Profit Margin</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Gross Profit ÷ Net Sales) × 100%
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 30.0%</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-emerald-950">
                    {formatPercent(y.grossProfitMargin)}
                  </td>
                ))}
              </tr>

              {/* Operating Profit Margin */}
              <tr
                onClick={() => setSelectedRatioKey('operating_profit_margin')}
                className="hover:bg-emerald-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-emerald-700 transition-colors">Operating Profit Margin</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Operating Income [EBIT] ÷ Net Sales) × 100%
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 15.0%</td>
                {years5.map((y) => {
                  const val = y.netSales > 0 ? (y.ebit / y.netSales) * 100 : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-emerald-950">
                      {formatPercent(val)}
                    </td>
                  );
                })}
              </tr>

              {/* Net Profit Margin */}
              <tr
                onClick={() => setSelectedRatioKey('net_profit_margin')}
                className="hover:bg-emerald-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-emerald-700 transition-colors">Net Profit Margin</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Net Income After Tax ÷ Net Sales) × 100%
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 10.0%</td>
                {years5.map((y) => (
                  <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-emerald-950">
                    {formatPercent(y.netProfitMargin)}
                  </td>
                ))}
              </tr>

              {/* Return on Assets */}
              <tr
                onClick={() => setSelectedRatioKey('roa')}
                className="hover:bg-emerald-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-emerald-700 transition-colors">Return on Assets (ROA)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Net Income ÷ Total Assets) × 100%
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 10.0%</td>
                {years5.map((y) => {
                  const val = y.totalAssets > 0 ? (y.netIncome / y.totalAssets) * 100 : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-emerald-950">
                      {formatPercent(val)}
                    </td>
                  );
                })}
              </tr>

              {/* Return on Equity */}
              <tr
                onClick={() => setSelectedRatioKey('roe')}
                className="hover:bg-emerald-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-emerald-700 transition-colors">Return on Equity (ROE)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Net Income ÷ Total Equity) × 100%
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 15.0%</td>
                {years5.map((y) => {
                  const val = y.totalEquity > 0 ? (y.netIncome / y.totalEquity) * 100 : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-emerald-950">
                      {formatPercent(val)}
                    </td>
                  );
                })}
              </tr>

              {/* Return on Invested Capital */}
              <tr
                onClick={() => setSelectedRatioKey('roic')}
                className="hover:bg-emerald-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-emerald-700 transition-colors">Return on Invested Capital (ROIC)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  NOPAT [EBIT × (1 - Tax Rate)] ÷ (Total Debt + Total Equity)
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 12.0%</td>
                {years5.map((y) => {
                  const nopat = y.ebit * (1 - project.taxRatePercent / 100);
                  const totalDebt = y.longTermDebt + y.currentPortionOfDebt;
                  const capital = y.totalEquity + totalDebt;
                  const val = capital > 0 ? (nopat / capital) * 100 : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-emerald-950">
                      {formatPercent(val)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. OPERATIONAL EFFICIENCY / ACTIVITY RATIOS */}
      <section id="table-efficiency-ratios" className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm print-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Operational Efficiency / Activity Ratios
              </h3>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Asset Turnover & Working Capital Velocity
              </span>
            </div>
          </div>
          <PdfDownloadButton
            targetId="table-efficiency-ratios"
            title="Operational Efficiency & Activity Ratios"
            subtitle={`${project.title} • Asset Turnover & Working Capital Velocity`}
            projectTitle={project.title}
            buttonText="Download PDF"
            size="xs"
            variant="default"
            orientation="landscape"
            format="a4"
            fitToSinglePage={true}
          />
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[560px] text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
                <th className="py-2.5 text-left w-1/4">Ratio / Metric</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden sm:table-cell w-1/4">Formula</th>
                <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden lg:table-cell">Standard Benchmark</th>
                <th className="py-2.5 text-right font-financial">Year 1</th>
                <th className="py-2.5 text-right font-financial">Year 2</th>
                <th className="py-2.5 text-right font-financial">Year 3</th>
                <th className="py-2.5 text-right font-financial">Year 4</th>
                <th className="py-2.5 text-right font-financial">Year 5</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
              {/* Total Asset Turnover */}
              <tr
                onClick={() => setSelectedRatioKey('total_asset_turnover')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Total Asset Turnover</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Net Sales ÷ Total Assets
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 1.00x</td>
                {years5.map((y) => {
                  const val = y.totalAssets > 0 ? y.netSales / y.totalAssets : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Fixed Asset Turnover */}
              <tr
                onClick={() => setSelectedRatioKey('fixed_asset_turnover')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Fixed Asset Turnover</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Net Sales ÷ Net PPE
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 2.50x</td>
                {years5.map((y) => {
                  const val = y.netPPE > 0 ? y.netSales / y.netPPE : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Inventory Turnover */}
              <tr
                onClick={() => setSelectedRatioKey('inventory_turnover')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Inventory Turnover</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Cost of Goods Sold (COGS) ÷ Ending Inventory
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 6.00x</td>
                {years5.map((y) => {
                  const val = y.inventory > 0 ? y.totalCOGS / y.inventory : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Days Sales of Inventory (DSI) */}
              <tr
                onClick={() => setSelectedRatioKey('dsi')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Days Sales of Inventory (DSI)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Ending Inventory ÷ COGS) × 365 Days
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≤ 60.0 Days</td>
                {years5.map((y) => {
                  const invTurn = y.inventory > 0 ? y.totalCOGS / y.inventory : 0;
                  const val = invTurn > 0 ? 365 / invTurn : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(1)} Days
                    </td>
                  );
                })}
              </tr>

              {/* Accounts Receivable Turnover */}
              <tr
                onClick={() => setSelectedRatioKey('ar_turnover')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Accounts Receivable Turnover</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Net Sales ÷ Accounts Receivable
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 8.00x</td>
                {years5.map((y) => {
                  const val = y.accountsReceivable > 0 ? y.netSales / y.accountsReceivable : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Days Sales Outstanding (DSO) */}
              <tr
                onClick={() => setSelectedRatioKey('dso')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Days Sales Outstanding (DSO)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Accounts Receivable ÷ Net Sales) × 365 Days
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≤ 45.0 Days</td>
                {years5.map((y) => {
                  const arTurn = y.accountsReceivable > 0 ? y.netSales / y.accountsReceivable : 0;
                  const val = arTurn > 0 ? 365 / arTurn : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(1)} Days
                    </td>
                  );
                })}
              </tr>

              {/* Accounts Payable Turnover */}
              <tr
                onClick={() => setSelectedRatioKey('ap_turnover')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Accounts Payable Turnover</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Direct Purchases (Materials) ÷ Accounts Payable
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">6.0x - 12.0x</td>
                {years5.map((y) => {
                  const purchases = y.directMaterials > 0 ? y.directMaterials : y.totalCOGS * 0.6;
                  const val = y.accountsPayable > 0 ? purchases / y.accountsPayable : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>

              {/* Days Payable Outstanding (DPO) */}
              <tr
                onClick={() => setSelectedRatioKey('dpo')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Days Payable Outstanding (DPO)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  (Accounts Payable ÷ Direct Purchases) × 365 Days
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">30.0 - 60.0 Days</td>
                {years5.map((y) => {
                  const purchases = y.directMaterials > 0 ? y.directMaterials : y.totalCOGS * 0.6;
                  const apTurn = y.accountsPayable > 0 ? purchases / y.accountsPayable : 0;
                  const val = apTurn > 0 ? 365 / apTurn : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(1)} Days
                    </td>
                  );
                })}
              </tr>

              {/* Cash Conversion Cycle (CCC) */}
              <tr
                onClick={() => setSelectedRatioKey('ccc')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Cash Conversion Cycle (CCC)</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  DSO + DSI - DPO
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">Shorter is optimal</td>
                {years5.map((y) => {
                  const invTurn = y.inventory > 0 ? y.totalCOGS / y.inventory : 0;
                  const dsi = invTurn > 0 ? 365 / invTurn : 0;

                  const arTurn = y.accountsReceivable > 0 ? y.netSales / y.accountsReceivable : 0;
                  const dso = arTurn > 0 ? 365 / arTurn : 0;

                  const purchases = y.directMaterials > 0 ? y.directMaterials : y.totalCOGS * 0.6;
                  const apTurn = y.accountsPayable > 0 ? purchases / y.accountsPayable : 0;
                  const dpo = apTurn > 0 ? 365 / apTurn : 0;

                  const ccc = dso + dsi - dpo;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {ccc.toFixed(1)} Days
                    </td>
                  );
                })}
              </tr>

              {/* Working Capital Turnover */}
              <tr
                onClick={() => setSelectedRatioKey('working_capital_turnover')}
                className="hover:bg-amber-50/70 cursor-pointer transition-colors group"
                title="Click for full definition and year-by-year analysis"
              >
                <td className="py-2.5 pl-2 font-medium text-slate-900 flex items-center gap-1.5">
                  <span className="group-hover:text-amber-800 transition-colors">Working Capital Turnover</span>
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 transition-colors shrink-0" />
                </td>
                <td className="py-2.5 text-xs text-slate-500 font-mono hidden sm:table-cell">
                  Net Sales ÷ (Current Assets - Current Liabilities)
                </td>
                <td className="py-2.5 text-xs text-slate-500 hidden lg:table-cell">≥ 2.00x</td>
                {years5.map((y) => {
                  const nwc = y.totalCurrentAssets - y.totalCurrentLiabilities;
                  const val = nwc > 0 ? y.netSales / nwc : 0;
                  return (
                    <td key={y.year} className="py-2.5 text-right font-financial font-medium text-slate-900 group-hover:text-amber-950">
                      {val.toFixed(2)}x
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      </div>

      {/* RATIO DETAILS POPUP MODAL */}
      <FinancialRatioDetailsModal
        ratioKey={selectedRatioKey}
        onClose={() => setSelectedRatioKey(null)}
        project={project}
        financials={financials}
      />

      {/* CAPITAL BUDGETING METRIC DESCRIPTION & MEANING MODAL */}
      <CapitalBudgetingMetricModal
        metricKey={selectedCapitalMetric}
        onClose={() => setSelectedCapitalMetric(null)}
        project={project}
        financials={financials}
        metrics={metrics}
      />
    </div>
  );
}
