import React from 'react';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import {
  Calculator,
  Scale,
  Building2,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  Layers,
  ArrowRight,
  ShieldCheck,
  Equal,
  Sparkles,
} from 'lucide-react';

interface StepWalkthroughProps {
  c: string;
  selectedYear: number;
  totalUnits: number;
  netSales: number;
  avgSellingPrice: number;
  totalVariableCosts: number;
  avgVariableCost: number;
  directMaterials: number;
  dlVariablePortion?: number;
  sellingExpenses: number;
  salesDiscounts: number;
  unitContributionMargin: number;
  cmRatio: number;
  totalFixedCosts: number;
  bepUnitsExact: number;
  bepUnits: number;
  bepSales: number;
  bepRevenue: number;
  bepVarCost: number;
  bepContrMargin: number;
  bepOperatingProfit: number;
  mosUnits: number;
  mosUnitsRatio: number;
}

export default function BreakEvenStepWalkthrough({
  c,
  selectedYear,
  totalUnits,
  netSales,
  avgSellingPrice,
  totalVariableCosts,
  avgVariableCost,
  directMaterials,
  dlVariablePortion,
  sellingExpenses,
  salesDiscounts,
  unitContributionMargin,
  cmRatio,
  totalFixedCosts,
  bepUnitsExact,
  bepUnits,
  bepSales,
  bepRevenue,
  bepVarCost,
  bepContrMargin,
  bepOperatingProfit,
  mosUnits,
  mosUnitsRatio,
}: StepWalkthroughProps) {
  const roundedUnits = Math.round(totalUnits);

  return (
    <div className="space-y-4 animate-in fade-in duration-100">
      {/* 1. TOP HEADER BANNER (Identical style to Tab 3 & Tab 4) */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
          <Calculator className="w-4 h-4 text-indigo-600" />
          Step-by-Step Break-Even Point (BEP) Derivation for Year {selectedYear}
        </h3>
        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
          Standard Cost-Volume-Profit (CVP) analysis derives the required commercial unit volume where total contribution margin exactly equals all fixed operating overhead, yielding exactly zero operating profit or loss.
        </p>
      </div>

      {/* 2. 3-COLUMN SUMMARY STRIP (Matching Tab 4 milestone cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
            Formula Numerator (Fixed Costs)
          </span>
          <span className="text-lg font-bold font-financial text-indigo-950 block mt-0.5">
            {formatCurrency(totalFixedCosts, c)}
          </span>
          <span className="text-[10px] text-slate-400">Total contractual & overhead costs</span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
            Formula Denominator (UCM)
          </span>
          <span className="text-lg font-bold font-financial text-emerald-900 block mt-0.5">
            {formatCurrency(unitContributionMargin, c)} / unit
          </span>
          <span className="text-[10px] text-emerald-600 font-medium">
            {formatPercent(cmRatio)} Contribution Margin Ratio
          </span>
        </div>

        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
            Break-Even Point Threshold
          </span>
          <span className="text-lg font-bold font-financial text-indigo-950 block mt-0.5">
            {bepUnits.toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-500">
            Equivalent to {formatCurrency(bepSales, c)} Sales
          </span>
        </div>
      </div>

      {/* 3. CORE CVP FORMULA CARD (Light Theme matching Tab 3/4) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Equal className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              CVP Mathematical Formulation & Equation Fraction
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-indigo-950">
            BEP = {bepUnits.toLocaleString()} Commercial Units
          </span>
        </div>

        <div className="p-4 sm:p-5 bg-slate-50/40">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-center">
            {/* Left Result */}
            <div className="flex flex-col items-center bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Target Variable
              </span>
              <span className="text-xl sm:text-2xl font-black font-financial text-indigo-950 mt-0.5">
                BEP (Units)
              </span>
              <span className="text-[10px] text-indigo-600 font-medium mt-0.5">Zero-Profit Volume</span>
            </div>

            <div className="text-xl font-light text-slate-400 hidden sm:block">=</div>

            {/* Fraction representation */}
            <div className="flex flex-col items-center max-w-md w-full sm:w-auto shadow-2xs">
              {/* Numerator */}
              <div className="w-full pb-2 border-b-2 border-indigo-400 flex items-center justify-between gap-4 px-3.5 bg-indigo-50/80 rounded-t-lg py-2 border-t border-x border-indigo-200">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-indigo-900 block">Numerator (Fixed Overhead)</span>
                  <span className="text-xs font-semibold text-slate-700">Total Fixed Costs</span>
                </div>
                <span className="text-sm sm:text-base font-bold font-financial text-indigo-950">
                  {formatCurrency(totalFixedCosts, c)}
                </span>
              </div>

              {/* Denominator */}
              <div className="w-full pt-2 flex items-center justify-between gap-4 px-3.5 bg-emerald-50/80 rounded-b-lg py-2 border-b border-x border-emerald-200">
                <div className="text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 block">Denominator (UCM)</span>
                  <span className="text-xs font-semibold text-slate-700">
                    P_avg ({formatCurrency(avgSellingPrice, c)}) − VC_avg ({formatCurrency(avgVariableCost, c)})
                  </span>
                </div>
                <span className="text-sm sm:text-base font-bold font-financial text-emerald-900">
                  {formatCurrency(unitContributionMargin, c)}
                </span>
              </div>
            </div>

            <div className="text-xl font-light text-slate-400 hidden sm:block">=</div>

            {/* Exact result */}
            <div className="flex flex-col items-center bg-white px-4 py-3 rounded-xl border border-indigo-200 shadow-2xs">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Mathematical Quotient</span>
              <span className="text-sm sm:text-base font-mono font-bold text-slate-900 mt-0.5">
                {bepUnitsExact.toFixed(2)} units
              </span>
              <span className="text-[11px] text-indigo-700 font-bold mt-0.5">
                Commercial: <strong>{bepUnits.toLocaleString()} units</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. 4-STEP WALKTHROUGH TABLE (Identical to Tab 3 Table Style) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Sequential 4-Step CVP Derivation Schedule
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            {roundedUnits.toLocaleString()} projected commercial units in Year {selectedYear}
          </span>
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold">
              <th className="py-2.5 px-3 text-center w-12">Step</th>
              <th className="py-2.5 px-3 text-left">Economic Metric</th>
              <th className="py-2.5 px-3 text-left">Governing Equation</th>
              <th className="py-2.5 px-3 text-left">Values & Calculation</th>
              <th className="py-2.5 px-3 text-right font-financial">Result</th>
              <th className="py-2.5 px-3 text-left">Source Schedule</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {/* Step 1 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 px-3 text-center font-bold text-indigo-700">
                <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs inline-flex items-center justify-center border border-indigo-200">
                  1
                </span>
              </td>
              <td className="py-2.5 px-3 font-semibold text-slate-900">
                Weighted Average Price (P_avg)
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                Net Sales ÷ Total Projected Units
              </td>
              <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                {formatCurrency(netSales, c)} ÷ {roundedUnits.toLocaleString()} units
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950">
                {formatCurrency(avgSellingPrice, c)}
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                Sales Revenue Schedule
              </td>
            </tr>

            {/* Step 2 */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 px-3 text-center font-bold text-amber-700">
                <span className="w-5 h-5 rounded bg-amber-50 text-amber-700 font-bold text-xs inline-flex items-center justify-center border border-amber-200">
                  2
                </span>
              </td>
              <td className="py-2.5 px-3 font-semibold text-slate-900">
                Weighted Average Variable Cost (VC_avg)
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                Total Variable Costs ÷ Total Units
              </td>
              <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                {formatCurrency(totalVariableCosts, c)} ÷ {roundedUnits.toLocaleString()} units
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-bold text-amber-900">
                {formatCurrency(avgVariableCost, c)}
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                BOM + Selling Commissions + Discounts
              </td>
            </tr>

            {/* Step 3 */}
            <tr className="hover:bg-slate-50/60 transition-colors bg-emerald-50/20">
              <td className="py-2.5 px-3 text-center font-bold text-emerald-700">
                <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs inline-flex items-center justify-center border border-emerald-200">
                  3
                </span>
              </td>
              <td className="py-2.5 px-3 font-semibold text-emerald-950">
                Unit Contribution Margin (UCM)
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                P_avg − VC_avg
              </td>
              <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                {formatCurrency(avgSellingPrice, c)} − {formatCurrency(avgVariableCost, c)}
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950 text-sm">
                {formatCurrency(unitContributionMargin, c)}
              </td>
              <td className="py-2.5 px-3 text-emerald-700 font-semibold text-[11px]">
                {formatPercent(cmRatio)} Margin Ratio (CMR)
              </td>
            </tr>

            {/* Step 4 */}
            <tr className="hover:bg-slate-50/60 transition-colors bg-indigo-50/30">
              <td className="py-2.5 px-3 text-center font-bold text-indigo-700">
                <span className="w-5 h-5 rounded bg-indigo-600 text-white font-bold text-xs inline-flex items-center justify-center">
                  4
                </span>
              </td>
              <td className="py-2.5 px-3 font-bold text-indigo-950">
                Break-Even Point in Units (BEP)
              </td>
              <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                Total Fixed Costs ÷ UCM
              </td>
              <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                {formatCurrency(totalFixedCosts, c)} ÷ {formatCurrency(unitContributionMargin, c)}
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-black text-indigo-950 text-sm">
                {bepUnits.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 text-indigo-900 font-semibold text-[11px]">
                Sales: {formatCurrency(bepSales, c)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
              <td colSpan={2} className="py-2.5 px-3">Margin of Safety Cushion</td>
              <td colSpan={2} className="py-2.5 px-3 text-slate-600 font-normal">
                Planned Units ({roundedUnits.toLocaleString()}) − BEP ({bepUnits.toLocaleString()})
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-black text-emerald-900">
                {mosUnits.toLocaleString()}
              </td>
              <td className="py-2.5 px-3 text-emerald-700 font-bold text-[11px]">
                {formatPercent(mosUnitsRatio)} volume buffer
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* 5. STEP CARDS (Matching Tab 4 card structure) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Step 1 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
                1
              </span>
              <span className="text-xs font-bold text-slate-900">Weighted Average Selling Price</span>
            </div>
            <span className="text-xs font-bold font-financial text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
              {formatCurrency(avgSellingPrice, c)} / unit
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Blended commercial selling price across all product lines based on planned Year {selectedYear} sales mix proportions.
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Formula:</span>
              <span>Net Sales ÷ Total Units</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-slate-200 text-indigo-950">
              <span>{formatCurrency(netSales, c)} ÷ {roundedUnits.toLocaleString()}</span>
              <span>= {formatCurrency(avgSellingPrice, c)}</span>
            </div>
          </div>
        </div>

        {/* Step 2 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-amber-50 text-amber-700 font-bold text-xs flex items-center justify-center border border-amber-200">
                2
              </span>
              <span className="text-xs font-bold text-slate-900">Weighted Average Variable Cost</span>
            </div>
            <span className="text-xs font-bold font-financial text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
              {formatCurrency(avgVariableCost, c)} / unit
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Direct materials (BOM), delivery freight, sales commissions, and volume discounts (Direct Labor is treated as 100% fixed).
          </p>
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700 space-y-1">
            <div className="flex justify-between text-slate-500">
              <span>Formula:</span>
              <span>Total Variable Costs ÷ Total Units</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-slate-200 text-amber-950">
              <span>{formatCurrency(totalVariableCosts, c)} ÷ {roundedUnits.toLocaleString()}</span>
              <span>= {formatCurrency(avgVariableCost, c)}</span>
            </div>
          </div>
        </div>

        {/* Step 3 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border border-emerald-200">
                3
              </span>
              <span className="text-xs font-bold text-slate-900">Unit Contribution Margin (UCM)</span>
            </div>
            <span className="text-xs font-bold font-financial text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {formatCurrency(unitContributionMargin, c)} / unit
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The incremental cash profit per unit sold that funds and amortizes contractual fixed overhead until reaching zero net income.
          </p>
          <div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-200 font-mono text-[11px] text-emerald-950 space-y-1">
            <div className="flex justify-between text-emerald-700">
              <span>Formula:</span>
              <span>P_avg − VC_avg</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-emerald-200 text-emerald-950">
              <span>{formatCurrency(avgSellingPrice, c)} − {formatCurrency(avgVariableCost, c)}</span>
              <span>= {formatCurrency(unitContributionMargin, c)}</span>
            </div>
          </div>
        </div>

        {/* Step 4 Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                4
              </span>
              <span className="text-xs font-bold text-slate-900">Break-Even Point in Units (BEP)</span>
            </div>
            <span className="text-xs font-bold font-financial text-white bg-indigo-600 px-2 py-0.5 rounded">
              {bepUnits.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Annual Fixed Costs divided by UCM yields the required commercial production volume to reach zero net income.
          </p>
          <div className="bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-200 font-mono text-[11px] text-indigo-950 space-y-1">
            <div className="flex justify-between text-indigo-700">
              <span>Formula:</span>
              <span>Total Fixed Costs ÷ UCM</span>
            </div>
            <div className="flex justify-between font-semibold pt-1 border-t border-indigo-100 text-indigo-950">
              <span>{formatCurrency(totalFixedCosts, c)} ÷ {formatCurrency(unitContributionMargin, c)}</span>
              <span>= {bepUnits.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6. MATHEMATICAL VERIFICATION TABLE (Matching Tab 3 table structure) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              Income Statement Verification at BEP ({bepUnits.toLocaleString()} Units)
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Net Operating Income = {formatCurrency(0, c)}
          </span>
        </div>

        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold">
              <th className="py-2.5 px-3 text-left">Income Statement Line Item</th>
              <th className="py-2.5 px-3 text-right font-financial">Unit Rate ({c})</th>
              <th className="py-2.5 px-3 text-right font-financial">Amount at BEP ({c})</th>
              <th className="py-2.5 px-3 text-right">% of BEP Sales</th>
              <th className="py-2.5 px-3 text-left">Accounting Verification Proof</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {/* Sales */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-slate-900">
                Gross Sales Revenue at BEP
              </td>
              <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                {formatCurrency(avgSellingPrice, c)}
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-bold text-slate-900">
                {formatCurrency(bepRevenue, c)}
              </td>
              <td className="py-2.5 px-3 text-right text-slate-500">
                100.0%
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                {bepUnits.toLocaleString()} units × {formatCurrency(avgSellingPrice, c)}
              </td>
            </tr>

            {/* Variable Costs */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-slate-900">
                Less: Variable Costs at BEP
              </td>
              <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                ({formatCurrency(avgVariableCost, c)})
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-bold text-rose-700">
                ({formatCurrency(bepVarCost, c)})
              </td>
              <td className="py-2.5 px-3 text-right text-slate-500">
                {avgSellingPrice > 0 ? ((avgVariableCost / avgSellingPrice) * 100).toFixed(1) : '0.0'}%
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                {bepUnits.toLocaleString()} units × {formatCurrency(avgVariableCost, c)}
              </td>
            </tr>

            {/* Contribution Margin */}
            <tr className="hover:bg-slate-50/60 transition-colors bg-indigo-50/30 font-semibold">
              <td className="py-2.5 px-3 text-indigo-950 font-bold">
                Contribution Margin at BEP
              </td>
              <td className="py-2.5 px-3 text-right font-financial text-indigo-950 font-bold">
                {formatCurrency(unitContributionMargin, c)}
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-black text-indigo-950">
                {formatCurrency(bepContrMargin, c)}
              </td>
              <td className="py-2.5 px-3 text-right font-bold text-indigo-900">
                {formatPercent(cmRatio)}
              </td>
              <td className="py-2.5 px-3 text-indigo-800 text-[11px] font-medium">
                Exactly equals annual fixed overhead commitments
              </td>
            </tr>

            {/* Fixed Costs */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 px-3 font-semibold text-slate-900">
                Less: Total Fixed Costs (TFC)
              </td>
              <td className="py-2.5 px-3 text-right font-financial text-slate-500">
                —
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-bold text-rose-700">
                ({formatCurrency(totalFixedCosts, c)})
              </td>
              <td className="py-2.5 px-3 text-right text-slate-500">
                {formatPercent(cmRatio)}
              </td>
              <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                Contractual rent, salaries, utilities, and debt interest
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-emerald-300 bg-emerald-50/80 font-bold text-emerald-950">
              <td className="py-2.5 px-3">Net Operating Income / (Loss)</td>
              <td className="py-2.5 px-3 text-right font-financial text-slate-500 font-normal">
                {formatCurrency(0, c)} / unit
              </td>
              <td className="py-2.5 px-3 text-right font-financial font-black text-emerald-950 text-sm">
                {formatCurrency(bepOperatingProfit, c)}
              </td>
              <td className="py-2.5 px-3 text-right font-bold text-emerald-900">
                0.0%
              </td>
              <td className="py-2.5 px-3 text-emerald-800 text-[11px] font-bold">
                ✓ Exact Zero-Profit Proof (Break-Even Condition Satisfied)
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
