import React, { useEffect, useState } from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import {
  X,
  Calculator,
  Target,
  ShieldCheck,
  Info,
  Layers,
  Sparkles,
  BookOpen,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  TrendingUp,
  Percent,
  HelpCircle,
  Clock,
  ChevronRight,
  BarChart3,
  Scale,
  Printer,
  Calendar,
} from 'lucide-react';
import BreakEvenStepWalkthrough from './BreakEvenStepWalkthrough';

interface BreakEvenBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialYear?: number;
  project: FeasibilityProject;
  financials: YearFinancials[];
}

export default function BreakEvenBreakdownModal({
  isOpen,
  onClose,
  initialYear = 1,
  project,
  financials,
}: BreakEvenBreakdownModalProps) {
  // Lock to the specific year clicked by the user
  const selectedYear = initialYear >= 1 && initialYear <= 5 ? initialYear : 1;
  const [activeTab, setActiveTab] = useState<'computation' | 'sources' | 'products' | 'defense'>('computation');

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const c = project.currency;
  const currentFin = financials.find((f) => f.year === selectedYear) || financials[1] || financials[0];

  // 1. Calculate Unit Volumes for each product for the selected year
  const prodVolumes = (project.products || []).map((p) => {
    const growth = Math.pow(1 + (p.annualGrowthRate || 0) / 100, currentFin.year - 1);
    const volume = (p.year1Volume || 0) * growth;
    const grossRevenue = volume * (p.unitPrice || 0);
    return {
      id: p.id,
      name: p.name,
      volume,
      unitPrice: p.unitPrice,
      grossRevenue,
    };
  });

  const totalUnits = prodVolumes.reduce((sum, p) => sum + p.volume, 0);

  // 2. Breakdown of Fixed Costs
  const directLaborFixed = currentFin.directLabor;
  const totalFOH = currentFin.totalFactoryOverhead ?? (
    currentFin.factoryOverhead + (currentFin.factoryLaborBenefits || 0) + currentFin.factoryDepreciation
  );
  const adminCosts = currentFin.adminExpenses;
  const rentUtilities = currentFin.utilitiesAndRent;
  const otherOpex = currentFin.otherOpex;
  const opexDepreciation = currentFin.opexDepreciation;
  const interestExpense = currentFin.interestExpense;

  const totalFixedCosts = currentFin.fixedCosts > 0 
    ? currentFin.fixedCosts 
    : (directLaborFixed + totalFOH + adminCosts + rentUtilities + otherOpex + opexDepreciation + interestExpense);

  // 3. Breakdown of Variable Costs (All Direct Labor is fixed; variable consists of Direct Materials, Selling Expenses, Sales Discounts)
  const directMaterials = currentFin.directMaterials;
  const sellingExpenses = currentFin.sellingExpenses;
  const salesDiscounts = currentFin.salesDiscounts;

  const totalVariableCosts = currentFin.variableCosts > 0
    ? currentFin.variableCosts
    : (directMaterials + sellingExpenses + salesDiscounts);

  // 4. Per-Unit Economics
  const avgSellingPrice = totalUnits > 0 ? currentFin.netSales / totalUnits : 0;
  const avgVariableCost = totalUnits > 0 ? totalVariableCosts / totalUnits : 0;
  const unitContributionMargin = avgSellingPrice - avgVariableCost;
  const cmRatio = currentFin.netSales > 0 ? (currentFin.contributionMargin / currentFin.netSales) * 100 : 0;

  // 5. Break-Even Calculations
  const bepUnitsExact = unitContributionMargin > 0 ? totalFixedCosts / unitContributionMargin : 0;
  const bepUnits = Math.round(bepUnitsExact);
  const bepSales = currentFin.breakEvenSales > 0 ? currentFin.breakEvenSales : (cmRatio > 0 ? (totalFixedCosts / (cmRatio / 100)) : 0);

  // 6. Margin of Safety
  const mosUnits = Math.max(0, Math.round(totalUnits - bepUnits));
  const mosUnitsRatio = totalUnits > 0 ? (mosUnits / totalUnits) * 100 : 0;

  // 7. Operational Calendar Milestone (assuming 300 annual operating days or 12 operating months)
  const bepFraction = totalUnits > 0 ? Math.min(1, bepUnits / totalUnits) : 0;
  const bepOperatingDays = Math.round(bepFraction * 300);
  const bepOperatingMonths = (bepFraction * 12).toFixed(1);

  // 8. Product-Level Allocation
  const productAllocation = prodVolumes.map((pv) => {
    const mixPercent = totalUnits > 0 ? (pv.volume / totalUnits) * 100 : 0;
    const allocatedBepUnits = Math.round(bepUnits * (mixPercent / 100));
    const allocatedBepSales = allocatedBepUnits * pv.unitPrice;
    const allocatedMosUnits = Math.max(0, Math.round(pv.volume - allocatedBepUnits));
    const allocatedMosRatio = pv.volume > 0 ? (allocatedMosUnits / pv.volume) * 100 : 0;
    return {
      id: pv.id,
      name: pv.name,
      unitPrice: pv.unitPrice,
      volume: Math.round(pv.volume),
      mixPercent,
      allocatedBepUnits,
      allocatedBepSales,
      allocatedMosUnits,
      allocatedMosRatio,
    };
  });

  // Proof at BEP
  const bepRevenue = bepUnits * avgSellingPrice;
  const bepVarCost = bepUnits * avgVariableCost;
  const bepContrMargin = bepRevenue - bepVarCost;
  const bepOperatingProfit = bepContrMargin - totalFixedCosts;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="bep-breakdown-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs overflow-y-auto print:hidden"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-full max-w-4xl my-auto overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-200/80 bg-slate-50/80 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0 mt-0.5">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 id="bep-breakdown-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Break-Even Point (BEP) in Units
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-900 bg-indigo-100/90 border border-indigo-200 px-3 py-0.5 rounded-full shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Year {selectedYear} Analysis</span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600 bg-slate-200/70 px-2.5 py-0.5 rounded-full">
                  CVP Model
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              title="Close modal (Esc)"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECTION SELECTION BUTTONS */}
        <div className="px-5 sm:px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Breakdown Views
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-thin">
            <button
              type="button"
              id="btn-view-step-computation"
              onClick={() => setActiveTab('computation')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-2xs ${
                activeTab === 'computation'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-600 ring-offset-1'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Calculator className={`w-3.5 h-3.5 ${activeTab === 'computation' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Step-by-Step Computation</span>
            </button>

            <button
              type="button"
              id="btn-view-data-sources"
              onClick={() => setActiveTab('sources')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-2xs ${
                activeTab === 'sources'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-600 ring-offset-1'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <FileSpreadsheet className={`w-3.5 h-3.5 ${activeTab === 'sources' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Data Origins & Line-Item Drivers</span>
            </button>

            <button
              type="button"
              id="btn-view-product-allocation"
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-2xs ${
                activeTab === 'products'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-600 ring-offset-1'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <Layers className={`w-3.5 h-3.5 ${activeTab === 'products' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Product Sales Mix Allocation</span>
            </button>

            <button
              type="button"
              id="btn-view-defense-qa"
              onClick={() => setActiveTab('defense')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-2xs ${
                activeTab === 'defense'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs ring-2 ring-indigo-600 ring-offset-1'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'defense' ? 'text-white' : 'text-indigo-600'}`} />
              <span>Defense Questions & Milestones</span>
            </button>
          </div>
        </div>

        {/* MODAL SCROLLABLE CONTENT BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TOP 4 KEY METRIC CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Card 1: BEP Units */}
            <div className="bg-indigo-50/70 rounded-xl p-3.5 border border-indigo-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                  Year {selectedYear} BEP Units
                </span>
                <Target className="w-3.5 h-3.5 text-indigo-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-financial text-indigo-950 mt-1">
                {bepUnits.toLocaleString()}
              </div>
              <span className="text-[11px] text-indigo-700 font-semibold block mt-0.5">
                {formatCurrency(bepSales, c)} Sales Value
              </span>
            </div>

            {/* Card 2: Total Fixed Costs */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Total Fixed Costs
                </span>
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-financial text-slate-900 mt-1">
                {formatCurrency(totalFixedCosts, c)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Overhead Numerator
              </span>
            </div>

            {/* Card 3: Unit Contribution Margin */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Unit Contribution (UCM)
                </span>
                <Scale className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-financial text-slate-900 mt-1">
                {formatCurrency(unitContributionMargin, c)}
              </div>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                {formatPercent(cmRatio)} Margin Ratio (CMR)
              </span>
            </div>

            {/* Card 4: Margin of Safety */}
            <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
                  Margin of Safety (Units)
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black font-financial text-emerald-950 mt-1">
                {mosUnits.toLocaleString()}
              </div>
              <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                {formatPercent(mosUnitsRatio)} volume cushion
              </span>
            </div>
          </div>

          {/* TAB 1: STEP-BY-STEP COMPUTATION */}
          {activeTab === 'computation' && (
            <BreakEvenStepWalkthrough
              c={c}
              selectedYear={selectedYear}
              totalUnits={totalUnits}
              netSales={currentFin.netSales}
              avgSellingPrice={avgSellingPrice}
              totalVariableCosts={totalVariableCosts}
              avgVariableCost={avgVariableCost}
              directMaterials={directMaterials}
              sellingExpenses={sellingExpenses}
              salesDiscounts={salesDiscounts}
              unitContributionMargin={unitContributionMargin}
              cmRatio={cmRatio}
              totalFixedCosts={totalFixedCosts}
              bepUnitsExact={bepUnitsExact}
              bepUnits={bepUnits}
              bepSales={bepSales}
              bepRevenue={bepRevenue}
              bepVarCost={bepVarCost}
              bepContrMargin={bepContrMargin}
              bepOperatingProfit={bepOperatingProfit}
              mosUnits={mosUnits}
              mosUnitsRatio={mosUnitsRatio}
            />
          )}

          {/* TAB 2: WHERE THE DATA COMES FROM */}
          {activeTab === 'sources' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* Top Header Banner (Matching Tab 3 & Tab 4) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                  Data Origins & Line-Item Drivers for Year {selectedYear}
                </h3>
              </div>

              {/* 3-Column Summary Strip (Matching Tab 4) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Fixed Cost Pool (Numerator)
                  </span>
                  <span className="text-lg font-bold font-financial text-indigo-950 block mt-0.5">
                    {formatCurrency(totalFixedCosts, c)}
                  </span>
                  <span className="text-[10px] text-slate-400">7 contractual & overhead schedules</span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Variable Cost Pool (Denominator)
                  </span>
                  <span className="text-lg font-bold font-financial text-slate-900 block mt-0.5">
                    {formatCurrency(totalVariableCosts, c)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {formatCurrency(avgVariableCost, c)} per unit average
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                    Revenue Pool (Net Sales)
                  </span>
                  <span className="text-lg font-bold font-financial text-emerald-900 block mt-0.5">
                    {formatCurrency(currentFin.netSales, c)}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-medium">
                    {Math.round(totalUnits).toLocaleString()} total projected units
                  </span>
                </div>
              </div>

              {/* 1. NUMERATOR: FIXED COSTS BREAKDOWN & ORIGIN */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Numerator: Total Fixed Costs Breakdown ({formatCurrency(totalFixedCosts, c)})
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-950">
                    100.0% of Fixed Overhead
                  </span>
                </div>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[560px] text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold">
                        <th className="py-2.5 px-3 text-left">Fixed Cost Component</th>
                        <th className="py-2.5 px-3 text-right font-financial">Amount ({c})</th>
                        <th className="py-2.5 px-3 text-right">% of Fixed</th>
                        <th className="py-2.5 px-3 text-left">Source / Origin in Feasibility Study</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {/* Direct Labor (100% Fixed) */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Direct Labor Base Wages (100% Fixed)
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(directLaborFixed, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                          {totalFixedCosts > 0 ? ((directLaborFixed / totalFixedCosts) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                            <Building2 className="w-3 h-3" />
                            Direct Labor Schedule
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Core production line staffing compensation (treated as 100% fixed committed overhead)
                          </span>
                        </td>
                      </tr>

                      {/* Factory Overhead */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Total Factory Overhead (FOH)
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(totalFOH, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                          {totalFixedCosts > 0 ? ((totalFOH / totalFixedCosts) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded text-[11px]">
                            <FileSpreadsheet className="w-3 h-3" />
                            Cost of Goods Sold (COGS) Schedule
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Plant utilities, factory maintenance, supplies, equipment depreciation & statutory benefits
                          </span>
                        </td>
                      </tr>

                      {/* Admin Expenses */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Administrative Expenses
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(adminCosts, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                          {totalFixedCosts > 0 ? ((adminCosts / totalFixedCosts) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                            Administrative OPEX
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Executive compensation, office staff salaries, general office supplies
                          </span>
                        </td>
                      </tr>

                      {/* Rent and General Utilities */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Facility Rent & Administrative Utilities
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(rentUtilities, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                          {totalFixedCosts > 0 ? ((rentUtilities / totalFixedCosts) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                            Rent & Utilities Schedule
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Monthly contract lease costs and base non-production power/water
                          </span>
                        </td>
                      </tr>

                      {/* Other OPEX */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Other Fixed Operating Expenses
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(otherOpex, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                          {totalFixedCosts > 0 ? ((otherOpex / totalFixedCosts) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                            Other Operating Expenses
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Insurance, business permits, audit/accounting, software licenses
                          </span>
                        </td>
                      </tr>

                      {/* OPEX Depreciation */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Administrative & Commercial Depreciation
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(opexDepreciation, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                          {totalFixedCosts > 0 ? ((opexDepreciation / totalFixedCosts) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded text-[11px]">
                            Depreciation Schedule (Non-Plant)
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Office computers, furniture, store fixtures, and administrative equipment
                          </span>
                        </td>
                      </tr>

                      {/* Interest Expense */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          Financing Interest Expense
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-slate-900">
                          {formatCurrency(interestExpense, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 font-medium">
                          {totalFixedCosts > 0 ? ((interestExpense / totalFixedCosts) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded text-[11px]">
                            Debt Amortization Schedule
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Commercial bank loan interest expense committed for Year {selectedYear}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold">
                        <td className="py-2.5 px-3 text-slate-900">Total Fixed Costs (Numerator)</td>
                        <td className="py-2.5 px-3 text-right font-financial text-indigo-950 text-sm">
                          {formatCurrency(totalFixedCosts, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 font-bold">100.0%</td>
                        <td className="py-2.5 px-3 text-xs text-slate-600 font-normal">
                          All committed contractual & non-volume overhead
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 2. DENOMINATOR: UNIT CONTRIBUTION MARGIN & VARIABLE COSTS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Denominator: Unit Contribution Margin (UCM = {formatCurrency(unitContributionMargin, c)} / unit)
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800">
                    {formatPercent(cmRatio)} Contribution Margin Ratio
                  </span>
                </div>
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[560px] text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold">
                        <th className="py-2.5 px-3 text-left">Unit Economics Driver</th>
                        <th className="py-2.5 px-3 text-right font-financial">Annual Total ({c})</th>
                        <th className="py-2.5 px-3 text-right font-financial">Per Unit ({c})</th>
                        <th className="py-2.5 px-3 text-left">Source / Origin in Feasibility Study</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                      {/* Selling Price */}
                      <tr className="bg-emerald-50/30 hover:bg-emerald-50/50 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-emerald-950">
                          Weighted Average Selling Price (P_avg)
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950">
                          {formatCurrency(currentFin.netSales, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-emerald-950 text-xs sm:text-sm">
                          {formatCurrency(avgSellingPrice, c)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-2 py-0.5 rounded text-[11px]">
                            Sales Revenue Schedule
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            Net Sales ÷ {Math.round(totalUnits).toLocaleString()} Total Units
                          </span>
                        </td>
                      </tr>

                      {/* Direct Materials */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900 pl-6">
                          ↳ Direct Materials (Raw Materials & Packaging)
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-800">
                          {formatCurrency(directMaterials, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-800">
                          {totalUnits > 0 ? formatCurrency(directMaterials / totalUnits, c) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            Bill of Materials (BOM) Schedule
                          </span>
                        </td>
                      </tr>

                      {/* Selling Expenses */}
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-slate-900 pl-6">
                          ↳ Selling, Marketing & Delivery Commissions
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-800">
                          {formatCurrency(sellingExpenses, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-800">
                          {totalUnits > 0 ? formatCurrency(sellingExpenses / totalUnits, c) : '—'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            Selling & Marketing Schedule
                          </span>
                        </td>
                      </tr>

                      {/* Sales Discounts if any */}
                      {salesDiscounts > 0 && (
                        <tr className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-900 pl-6">
                            ↳ Sales Discounts & Volume Rebates
                          </td>
                          <td className="py-2.5 px-3 text-right font-financial text-slate-800">
                            {formatCurrency(salesDiscounts, c)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-financial text-slate-800">
                            {totalUnits > 0 ? formatCurrency(salesDiscounts / totalUnits, c) : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              Sales Deductions Policy
                            </span>
                          </td>
                        </tr>
                      )}

                      {/* Total Variable Cost Subtotal */}
                      <tr className="bg-slate-100/60 font-semibold border-t border-slate-200">
                        <td className="py-2.5 px-3 text-slate-900">
                          Weighted Average Variable Cost / Unit (VC_avg)
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-900">
                          {formatCurrency(totalVariableCosts, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-900 font-bold">
                          {formatCurrency(avgVariableCost, c)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 font-normal">
                          Total Variable Costs ÷ Total Units
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-emerald-300 bg-emerald-50/80 font-bold">
                        <td className="py-2.5 px-3 text-emerald-950">
                          Unit Contribution Margin (UCM = P_avg − VC_avg)
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-emerald-950">
                          {formatCurrency(currentFin.contributionMargin, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-emerald-950 font-black text-sm">
                          {formatCurrency(unitContributionMargin, c)}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-800 text-xs font-semibold">
                          {formatPercent(cmRatio)} Contribution Margin Ratio (CMR)
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRODUCT MIX ALLOCATION */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Multi-Product Sales Mix Allocation for Year {selectedYear}
                </h3>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto scrollbar-thin">
                <table className="w-full min-w-[660px] text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-semibold">
                      <th className="py-2.5 px-3 text-left">Product Name</th>
                      <th className="py-2.5 px-3 text-right font-financial">Unit Price ({c})</th>
                      <th className="py-2.5 px-3 text-right font-financial">Projected Target (Units)</th>
                      <th className="py-2.5 px-3 text-right">Sales Mix %</th>
                      <th className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950 bg-indigo-50/40">
                        Allocated BEP Units
                      </th>
                      <th className="py-2.5 px-3 text-right font-financial text-indigo-900">
                        Allocated BEP Sales ({c})
                      </th>
                      <th className="py-2.5 px-3 text-right font-financial font-semibold text-emerald-800 bg-emerald-50/30">
                        Margin of Safety (Units)
                      </th>
                      <th className="py-2.5 px-3 text-right text-emerald-800">
                        MOS %
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {productAllocation.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-900">
                          {item.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-700">
                          {formatCurrency(item.unitPrice, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-slate-900">
                          {item.volume.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                          {formatPercent(item.mixPercent)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-bold text-indigo-950 bg-indigo-50/40">
                          {item.allocatedBepUnits.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial text-indigo-900">
                          {formatCurrency(item.allocatedBepSales, c)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-financial font-semibold text-emerald-700 bg-emerald-50/30">
                          {item.allocatedMosUnits.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-right font-medium text-emerald-700">
                          {formatPercent(item.allocatedMosRatio)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-300 bg-slate-100 font-bold text-slate-900">
                      <td className="py-2.5 px-3">Total / Composite</td>
                      <td className="py-2.5 px-3 text-right font-financial text-slate-600">
                        {formatCurrency(avgSellingPrice, c)} (avg)
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial">
                        {Math.round(totalUnits).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">100.0%</td>
                      <td className="py-2.5 px-3 text-right font-financial font-black text-indigo-950 bg-indigo-100/60">
                        {bepUnits.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial text-indigo-950">
                        {formatCurrency(bepSales, c)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-financial font-black text-emerald-950 bg-emerald-100/60">
                        {mosUnits.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-800">
                        {formatPercent(mosUnitsRatio)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DEFENSE & OPERATIONAL MEANING */}
          {activeTab === 'defense' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              {/* OPERATIONAL TIMELINE MILESTONE */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Operational Calendar Milestone (When is Break-Even Reached?)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Production Progress to BEP</span>
                    <span className="text-lg font-bold font-financial text-indigo-950 block mt-0.5">
                      {(bepFraction * 100).toFixed(1)}% of Target
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {bepUnits.toLocaleString()} of {Math.round(totalUnits).toLocaleString()} units
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Estimated Operating Day</span>
                    <span className="text-lg font-bold font-financial text-slate-900 block mt-0.5">
                      Day {bepOperatingDays} of 300
                    </span>
                    <span className="text-[10px] text-slate-400">Assuming 300 operating days/year</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">Calendar Month Equivalent</span>
                    <span className="text-lg font-bold font-financial text-emerald-700 block mt-0.5">
                      ~ Month {bepOperatingMonths}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-medium">Profitable remainder of year</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-2">
                  At steady daily sales, the enterprise recovers its entire annual fixed overhead within the first <strong>{bepOperatingMonths} months (Day {bepOperatingDays})</strong>. All subsequent unit sales for the remaining {(12 - parseFloat(bepOperatingMonths)).toFixed(1)} months contribute 100% of their Unit Contribution Margin ({formatCurrency(unitContributionMargin, c)}/unit) directly to net operating income.
                </p>
              </div>

              {/* PANEL DEFENSE GUIDANCE */}
              <div className="bg-amber-50/80 rounded-xl border border-amber-200 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  Feasibility Defense & Examiner Inquiries
                </div>

                <div className="bg-white/90 p-3 rounded-lg border border-amber-200 space-y-1">
                  <span className="text-xs font-bold text-amber-950 block">
                    Q: &ldquo;Why do your Break-Even Units change between Year 1 and Year 5?&rdquo;
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Recommended Answer: </strong>
                    &ldquo;Fixed costs change over time as debt interest decreases through amortization, operational expenses experience modest inflation adjustments, and statutory compensation steps up. Concurrently, product growth expands total volume, improving scale economies and widening our Margin of Safety.&rdquo;
                  </p>
                </div>

                <div className="bg-white/90 p-3 rounded-lg border border-amber-200 space-y-1">
                  <span className="text-xs font-bold text-amber-950 block">
                    Q: &ldquo;Why is Direct Labor classified entirely as a Fixed Cost instead of Variable?&rdquo;
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Recommended Answer: </strong>
                    &ldquo;Under our operational model and Philippine labor regulations, production workers are salaried regular/contractual personnel entitled to fixed monthly wages and statutory benefits regardless of short-term day-to-day manufacturing volume swings. Treating 100% of Direct Labor as a fixed commitment ensures conservative break-even volume targets and protects cash flow feasibility.&rdquo;
                  </p>
                </div>

                <div className="bg-white/90 p-3 rounded-lg border border-amber-200 space-y-1">
                  <span className="text-xs font-bold text-amber-950 block">
                    Q: &ldquo;What happens if commercial sales drop by 20%? Will the project default?&rdquo;
                  </span>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Recommended Answer: </strong>
                    &ldquo;No. In Year {selectedYear}, our Margin of Safety is <strong>{formatPercent(mosUnitsRatio)} ({mosUnits.toLocaleString()} units)</strong>. A 20% sales contraction would still leave actual production comfortably above our break-even threshold of {bepUnits.toLocaleString()} units, ensuring all bank loans, salaries, and operating commitments are fully serviced.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-5 py-3.5 sm:px-6 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-700">Currently viewing:</span>
            <span className="font-semibold text-indigo-700">Year {selectedYear} ({bepUnits.toLocaleString()} Units)</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">Fixed: {formatCurrency(totalFixedCosts, c)}</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">UCM: {formatCurrency(unitContributionMargin, c)}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
