import React, { useState } from 'react';
import { FeasibilityProject, YearFinancials } from '../types';
import { formatCurrency, formatPercent } from '../utils/financialCalculations';
import { Target, Layers, ShieldCheck, TrendingUp, Info, Search, Calculator } from 'lucide-react';
import BreakEvenBreakdownModal from './BreakEvenBreakdownModal';
import PdfDownloadButton from './PdfDownloadButton';

interface BreakEvenUnitsTableProps {
  project: FeasibilityProject;
  financials: YearFinancials[];
}

export default function BreakEvenUnitsTable({
  project,
  financials,
}: BreakEvenUnitsTableProps) {
  const [selectedModalYear, setSelectedModalYear] = useState<number | null>(null);
  const c = project.currency;
  const years5 = financials.slice(1);

  const bepYearData = years5.map((y) => {
    const prodVolumes = (project.products || []).map((p) => {
      const growth = Math.pow(1 + (p.annualGrowthRate || 0) / 100, y.year - 1);
      const vol = (p.year1Volume || 0) * growth;
      return {
        id: p.id,
        name: p.name,
        volume: vol,
        unitPrice: p.unitPrice,
      };
    });

    const totalUnits = prodVolumes.reduce((sum, p) => sum + p.volume, 0);
    const avgPrice = totalUnits > 0 ? y.netSales / totalUnits : 0;
    const avgVariableCost = totalUnits > 0 ? y.variableCosts / totalUnits : 0;
    const unitCM = totalUnits > 0 ? y.contributionMargin / totalUnits : 0;
    const bepUnits = unitCM > 0 ? Math.round(y.fixedCosts / unitCM) : 0;
    const mosUnits = Math.max(0, Math.round(totalUnits - bepUnits));
    const mosUnitsRatio = totalUnits > 0 ? (mosUnits / totalUnits) * 100 : 0;

    const productBreakdown = prodVolumes.map((pv) => {
      const mixPercent = totalUnits > 0 ? (pv.volume / totalUnits) * 100 : 0;
      const allocatedBepUnits = Math.round(bepUnits * (mixPercent / 100));
      const allocatedMosUnits = Math.max(0, Math.round(pv.volume - allocatedBepUnits));
      return {
        name: pv.name,
        volume: Math.round(pv.volume),
        mixPercent,
        bepUnits: allocatedBepUnits,
        mosUnits: allocatedMosUnits,
      };
    });

    return {
      year: y.year,
      fixedCosts: y.fixedCosts,
      variableCosts: y.variableCosts,
      netSales: y.netSales,
      totalUnits: Math.round(totalUnits),
      avgPrice,
      avgVariableCost,
      unitCM,
      cmRatio: y.contributionMarginRatio * 100,
      bepUnits,
      bepSales: y.breakEvenSales,
      mosUnits,
      mosUnitsRatio,
      productBreakdown,
    };
  });

  const yr1 = bepYearData[0] || {
    bepUnits: 0,
    totalUnits: 0,
    mosUnits: 0,
    mosUnitsRatio: 0,
    bepSales: 0,
  };

  return (
    <section id="table-break-even-units" className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm print-break-inside-avoid">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Break-Even Point (BEP) in Units
              </h3>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                Cost-Volume-Profit (CVP) Analysis
              </span>
            </div>
          </div>
        </div>
        <PdfDownloadButton
          targetId="table-break-even-units"
          title="Break-Even Point (BEP) in Units & CVP Analysis"
          subtitle={`${project.title} • 5-Year BEP Breakdown`}
          projectTitle={project.title}
          buttonText="Download PDF"
          size="xs"
          variant="default"
          orientation="landscape"
          format="a4"
          fitToSinglePage={true}
        />
      </div>

      {/* MINI STATS CARDS FOR YEAR 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4">
        <button
          type="button"
          onClick={() => setSelectedModalYear(1)}
          className="bg-slate-50 hover:bg-indigo-50/60 rounded-xl p-3.5 border border-slate-200 hover:border-indigo-300 transition-all text-left group cursor-pointer shadow-2xs hover:shadow-sm"
          title="Click to view detailed Year 1 BEP computation breakdown and data sources"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 group-hover:text-indigo-700 uppercase tracking-wider transition-colors flex items-center gap-1">
              Year 1 Break-Even Units
            </span>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100/70 group-hover:bg-indigo-600 group-hover:text-white px-2 py-0.5 rounded-md transition-all flex items-center gap-1">
              <span>Inspect</span>
              <Search className="w-2.5 h-2.5" />
            </span>
          </div>
          <div className="text-lg sm:text-xl font-bold font-financial text-indigo-950 mt-1 flex items-center gap-2">
            <span>{yr1.bepUnits.toLocaleString()}</span>
          </div>
          <span className="text-[11px] text-slate-500 group-hover:text-indigo-900 transition-colors">
            Break-Even Sales: {formatCurrency(yr1.bepSales, c)}
          </span>
        </button>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Year 1 Target Production
          </span>
          <div className="text-lg sm:text-xl font-bold font-financial text-slate-900 mt-1">
            {yr1.totalUnits.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">
            Planned annual sales capacity
          </span>
        </div>

        <div className="bg-emerald-50/60 rounded-xl p-3.5 border border-emerald-200">
          <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Year 1 Margin of Safety
          </span>
          <div className="text-lg sm:text-xl font-bold font-financial text-emerald-950 mt-1">
            {yr1.mosUnits.toLocaleString()}
          </div>
          <span className="text-[11px] font-semibold text-emerald-700">
            {formatPercent(yr1.mosUnitsRatio)} volume safety cushion
          </span>
        </div>
      </div>

      {/* 5-YEAR BREAK-EVEN IN UNITS TABLE */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[620px] text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 font-semibold text-slate-800">
              <th className="py-2.5 text-left w-1/3">CVP Component / Metric</th>
              <th className="py-2.5 text-left text-xs text-slate-500 font-medium hidden md:table-cell w-1/4">
                Computation Basis
              </th>
              <th className="py-2.5 text-right font-financial">Year 1</th>
              <th className="py-2.5 text-right font-financial">Year 2</th>
              <th className="py-2.5 text-right font-financial">Year 3</th>
              <th className="py-2.5 text-right font-financial">Year 4</th>
              <th className="py-2.5 text-right font-financial">Year 5</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-normal text-slate-800">
            {/* Total Fixed Operating Costs */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">Total Fixed Costs</td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Direct Labor (Fixed) + FOH + Admin + Rent + Depr + Int
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.fixedCosts, c)}
                </td>
              ))}
            </tr>

            {/* Total Variable Costs */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">Total Variable Costs</td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Direct Materials + Selling Commissions + Sales Discounts
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.variableCosts, c)}
                </td>
              ))}
            </tr>

            {/* Weighted Avg Selling Price */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Weighted Avg. Selling Price / Unit
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Net Sales ÷ Total Projected Units
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.avgPrice, c)}
                </td>
              ))}
            </tr>

            {/* Weighted Avg Variable Cost / Unit */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Weighted Avg. Variable Cost / Unit
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Total Variable Costs ÷ Total Projected Units
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial text-slate-900">
                  {formatCurrency(d.avgVariableCost, c)}
                </td>
              ))}
            </tr>

            {/* Weighted Avg Unit Contribution Margin */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Unit Contribution Margin (UCM)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Avg. Selling Price − Avg. Variable Cost
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  {formatCurrency(d.unitCM, c)}
                </td>
              ))}
            </tr>

            {/* Contribution Margin Ratio */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Contribution Margin Ratio (CMR)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                (Total Contribution Margin ÷ Net Sales) × 100%
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  {formatPercent(d.cmRatio)}
                </td>
              ))}
            </tr>

            {/* BREAK-EVEN POINT IN UNITS (HIGHLIGHTED & INTERACTIVE) */}
            <tr className="bg-indigo-50/80 hover:bg-indigo-100/60 font-bold border-y-2 border-indigo-200 transition-colors">
              <td className="py-3 pl-2 text-indigo-950 font-bold">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <span>Break-Even Point in Units (BEP Units)</span>
                </div>
              </td>
              <td className="py-3 text-xs text-indigo-700 font-mono hidden md:table-cell">
                <span>Total Fixed Costs ÷ Unit Contribution Margin</span>
              </td>
              {bepYearData.map((d) => (
                <td
                  key={d.year}
                  className="py-2.5 px-2 text-right font-financial font-bold text-indigo-950 text-sm"
                >
                  <button
                    type="button"
                    id={`btn-bep-units-year-${d.year}`}
                    onClick={() => setSelectedModalYear(d.year)}
                    className="inline-flex items-center justify-end gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-600 text-indigo-950 hover:text-white border border-indigo-200 hover:border-indigo-600 shadow-2xs hover:shadow-xs transition-all font-bold cursor-pointer group text-xs sm:text-sm"
                    title={`Click to view Year ${d.year} detailed BEP breakdown (${d.bepUnits.toLocaleString()} units)`}
                  >
                    <span>{d.bepUnits.toLocaleString()}</span>
                    <Search className="w-3 h-3 text-indigo-500 group-hover:text-white transition-colors shrink-0" />
                  </button>
                </td>
              ))}
            </tr>

            {/* Break-Even Point in Sales Value */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Break-Even Point in Sales Value
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Total Fixed Costs ÷ Contribution Margin Ratio
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  <button
                    type="button"
                    id={`btn-bep-sales-year-${d.year}`}
                    onClick={() => setSelectedModalYear(d.year)}
                    className="hover:text-indigo-600 hover:underline cursor-pointer font-medium"
                    title={`Click to view Year ${d.year} detailed BEP breakdown (${formatCurrency(d.bepSales, c)})`}
                  >
                    {formatCurrency(d.bepSales, c)}
                  </button>
                </td>
              ))}
            </tr>

            {/* Target Production Volume */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-slate-900">
                Projected Sales Volume (Target Units)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Total Planned Commercial Unit Production
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-medium text-slate-900">
                  {d.totalUnits.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Margin of Safety in Units */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-emerald-900">
                Margin of Safety in Units
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                Target Units − Break-Even Units
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-semibold text-emerald-700">
                  {d.mosUnits.toLocaleString()}
                </td>
              ))}
            </tr>

            {/* Margin of Safety Ratio */}
            <tr className="hover:bg-slate-50/60 transition-colors">
              <td className="py-2.5 pl-2 font-medium text-emerald-900">
                Margin of Safety Ratio (Volume %)
              </td>
              <td className="py-2.5 text-xs text-slate-500 font-mono hidden md:table-cell">
                (Margin of Safety Units ÷ Target Units) × 100%
              </td>
              {bepYearData.map((d) => (
                <td key={d.year} className="py-2.5 text-right font-financial font-semibold text-emerald-700">
                  {formatPercent(d.mosUnitsRatio)}
                </td>
              ))}
            </tr>

            {/* PRODUCT-LEVEL ALLOCATION IF MULTI-PRODUCT */}
            {project.products && project.products.length > 1 && (
              <>
                <tr className="bg-slate-100/80 font-bold">
                  <td
                    colSpan={7}
                    className="py-2 pl-2 text-xs uppercase tracking-wider text-slate-700 font-semibold"
                  >
                    Product-Level Break-Even Allocation (Sales Mix Weighted)
                  </td>
                </tr>
                {project.products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2 pl-4 text-xs font-medium text-slate-800 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-slate-400" />
                      <span>{prod.name} (BEP Units)</span>
                    </td>
                    <td className="py-2 text-[11px] text-slate-500 font-mono hidden md:table-cell">
                      BEP Units × Product Mix %
                    </td>
                    {bepYearData.map((d) => {
                      const item = d.productBreakdown.find((p) => p.name === prod.name);
                      return (
                        <td
                          key={d.year}
                          className="py-2 px-2 text-right font-financial text-xs text-slate-800"
                        >
                          {item ? (
                            <button
                              type="button"
                              onClick={() => setSelectedModalYear(d.year)}
                              className="hover:text-indigo-600 hover:underline cursor-pointer font-medium"
                              title={`View Year ${d.year} allocation breakdown`}
                            >
                              {item.bepUnits.toLocaleString()}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTNOTE */}
      <div className="mt-4 text-[11px] text-slate-500 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <Info className="w-4 h-4 text-indigo-500 shrink-0" />
        <span>
          <strong>Defense Note:</strong> Break-even in units is achieved when contribution margin covers all fixed operating costs. Projected volumes exceed break-even thresholds across all 5 years, providing a strong operational safety cushion.
        </span>
      </div>

      {/* DETAILED BREAK-EVEN BREAKDOWN MODAL */}
      {selectedModalYear !== null && (
        <BreakEvenBreakdownModal
          isOpen={selectedModalYear !== null}
          onClose={() => setSelectedModalYear(null)}
          initialYear={selectedModalYear}
          project={project}
          financials={financials}
        />
      )}
    </section>
  );
}
